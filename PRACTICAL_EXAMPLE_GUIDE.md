# 🎯 **PRACTICAL EXAMPLE: CREATING A NEW API ENDPOINT**

## 📋 **SCENARIO: Adding a "Get All Tasks" Feature**

Let me show you **step-by-step** how to create a new API endpoint and integrate it with the frontend.

---

## 🏗️ **STEP 1: BACKEND IMPLEMENTATION**

### **1. Create Task Model (`models/Task.js`)**
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
```

### **2. Create Task Controller (`controllers/taskController.js`)**
```javascript
const Task = require('../models/Task');

// GET /api/tasks - Get all tasks for authenticated user
const getAllTasks = async (req, res) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user.id;
    
    // Find all tasks for this user
    const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// POST /api/tasks - Create new task
const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.id;
    
    const task = new Task({
      title,
      description,
      userId
    });
    
    await task.save();
    
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message
    });
  }
};

module.exports = {
  getAllTasks,
  createTask
};
```

### **3. Create Task Routes (`routes/taskRoutes.js`)**
```javascript
const express = require('express');
const { getAllTasks, createTask } = require('../controllers/taskController');
const auth = require('../middleware/auth'); // JWT verification middleware

const router = express.Router();

// Protect all task routes with authentication
router.use(auth);

// Define routes
router.get('/', getAllTasks);        // GET /api/tasks
router.post('/', createTask);        // POST /api/tasks

module.exports = router;
```

### **4. Add Routes to Main Server (`server.js`)**
```javascript
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Add this

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);    // Add this line

app.listen(5001, () => {
  console.log('Server running on http://localhost:5001');
});
```

---

## 🚀 **STEP 2: FRONTEND INTEGRATION**

### **1. Add TypeScript Types (`api/types/index.ts`)**
```typescript
export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface TasksResponse {
  success: boolean;
  count: number;
  data: Task[];
}
```

### **2. Add API Functions (`api/mytasks.ts`)**
```typescript
import { API_CONFIG, createApi } from './config';
import { Task, CreateTaskRequest, TasksResponse } from './types';

// Get user's authentication token
const getAuthToken = () => {
  const { token } = useAuthTaskStore.getState();
  return token;
};

// Create authenticated API client
const createAuthenticatedApi = () => {
  const api = createApi(API_CONFIG.BASE_URL);
  const token = getAuthToken();
  
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  return api;
};

// GET /api/tasks - Fetch all tasks
async function getAllTasks(): Promise<Task[]> {
  const api = createAuthenticatedApi();
  
  try {
    console.log('🔍 Fetching all tasks...');
    const response = await api.get('/tasks');
    console.log('✅ Tasks fetched successfully:', response.data);
    
    return response.data.data; // Return the tasks array
  } catch (error: any) {
    console.error('❌ Failed to fetch tasks:', error?.response?.data);
    throw error;
  }
}

// POST /api/tasks - Create new task
async function createTask(taskData: CreateTaskRequest): Promise<Task> {
  const api = createAuthenticatedApi();
  
  try {
    console.log('📝 Creating new task:', taskData);
    const response = await api.post('/tasks', taskData);
    console.log('✅ Task created successfully:', response.data);
    
    return response.data.data; // Return the created task
  } catch (error: any) {
    console.error('❌ Failed to create task:', error?.response?.data);
    throw error;
  }
}

// Export functions
export {
  getAllTasks,
  createTask
};
```

### **3. Create React Query Hooks (`hooks/useApi.ts`)**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllTasks, createTask } from '../api/mytasks';
import { CreateTaskRequest } from '../api/types';

// Query Keys for caching
const QUERY_KEYS = {
  tasks: ['tasks'],
  allTasks: () => [...QUERY_KEYS.tasks, 'all'],
};

// GET /api/tasks hook
export function useGetAllTasksQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.allTasks(),
    queryFn: getAllTasks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // Only fetch if user is authenticated
    enabled: !!useAuthTaskStore.getState().token,
  });
}

// POST /api/tasks hook
export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData: CreateTaskRequest) => createTask(taskData),
    
    // Update cache on success
    onSuccess: (newTask) => {
      console.log('✅ Task created, updating cache...');
      
      // Add new task to existing cache
      queryClient.setQueryData(QUERY_KEYS.allTasks(), (oldTasks: Task[] = []) => {
        return [newTask, ...oldTasks]; // Add to beginning
      });
      
      // Or invalidate cache to refetch
      // queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allTasks() });
    },
    
    onError: (error) => {
      console.error('❌ Failed to create task:', error);
    },
  });
}
```

### **4. Create Task List Component (`components/TaskList.tsx`)**
```typescript
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGetAllTasksQuery } from '@/hooks/useApi';
import { Task } from '@/api/types';

export default function TaskList() {
  // Fetch tasks using React Query
  const { data: tasks, isLoading, error, refetch } = useGetAllTasksQuery();
  
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading tasks...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Failed to load tasks</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const renderTask = ({ item }: { item: Task }) => (
    <View style={{ padding: 16, borderBottomWidth: 1 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.title}</Text>
      {item.description && (
        <Text style={{ fontSize: 14, color: '#666' }}>{item.description}</Text>
      )}
      <Text style={{ fontSize: 12, color: '#999' }}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </View>
  );
  
  return (
    <FlatList
      data={tasks}
      renderItem={renderTask}
      keyExtractor={(item) => item._id}
      refreshing={isLoading}
      onRefresh={refetch}
      ListEmptyComponent={
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text>No tasks found</Text>
        </View>
      }
    />
  );
}
```

### **5. Create Add Task Component (`components/AddTask.tsx`)**
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCreateTask } from '@/hooks/useApi';

export default function AddTask() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const { mutateAsync: createTask, isLoading } = useCreateTask();
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }
    
    try {
      await createTask({
        title: title.trim(),
        description: description.trim()
      });
      
      // Clear form
      setTitle('');
      setDescription('');
      
      Alert.alert('Success', 'Task created successfully!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to create task. Please try again.');
    }
  };
  
  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        Add New Task
      </Text>
      
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Task title"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Task description (optional)"
        multiline
        numberOfLines={3}
        style={{ borderWidth: 1, padding: 10, marginBottom: 20 }}
      />
      
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isLoading}
        style={{ 
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {isLoading ? 'Creating...' : 'Create Task'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## 🧪 **STEP 3: TESTING THE INTEGRATION**

### **1. Test Backend Endpoint:**
```powershell
# Test with authentication
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
    "Content-Type" = "application/json"
}

# Get all tasks
Invoke-WebRequest -Uri "http://192.168.1.4:5001/api/tasks" -Method GET -Headers $headers

# Create new task
$body = @{
    title = "Test Task"
    description = "This is a test task"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://192.168.1.4:5001/api/tasks" -Method POST -Body $body -Headers $headers
```

### **2. Use in Main App (`app/(tabs)/tasks.tsx`)**
```typescript
import React from 'react';
import { View, ScrollView } from 'react-native';
import TaskList from '@/components/TaskList';
import AddTask from '@/components/AddTask';

export default function TasksScreen() {
  return (
    <ScrollView style={{ flex: 1 }}>
      <AddTask />
      <TaskList />
    </ScrollView>
  );
}
```

This is the **complete process** from backend to frontend! 🎯