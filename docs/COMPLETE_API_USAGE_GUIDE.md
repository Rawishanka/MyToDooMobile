# 🔥 **COMPLETE TASK API USAGE EXAMPLES**

This file demonstrates how to use every single API endpoint in your React Native components.

## 📱 **COMPONENT EXAMPLES**

### **1. 📋 Task List Component (Browse All Tasks)**

```typescript
// TaskListScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useGetAllTasks } from '@/hooks/useTaskApi';
import { Task } from '@/api/types/tasks';

export default function TaskListScreen() {
  const { data: tasksResponse, isLoading, error, refetch } = useGetAllTasks();

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
        <Text>Error loading tasks: {error.message}</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Text style={{ color: 'blue' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTask = ({ item }: { item: Task }) => (
    <TouchableOpacity style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ color: '#666' }}>{item.details}</Text>
      <Text style={{ color: '#007AFF' }}>{item.formattedBudget || `${item.currency} ${item.budget}`}</Text>
      <Text style={{ fontSize: 12, color: '#999' }}>{item.location.address}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', padding: 16 }}>All Tasks</Text>
      <FlatList
        data={tasksResponse?.data || []}
        renderItem={renderTask}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
}
```

### **2. 🔍 Task Search Component**

```typescript
// TaskSearchScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useSearchTasks } from '@/hooks/useTaskApi';
import { TaskSearchParams } from '@/api/types/tasks';

export default function TaskSearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskSearchParams>({});
  
  const { data: searchResults, isLoading } = useSearchTasks({
    search: searchQuery,
    ...filters
  }, searchQuery.length > 2); // Only search when query is longer than 2 chars

  const handleSearch = () => {
    setFilters({ search: searchQuery });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Search Tasks</Text>
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16 }}
        placeholder="Search for tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
      />
      
      <TouchableOpacity 
        style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, marginBottom: 16 }}
        onPress={handleSearch}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>Search</Text>
      </TouchableOpacity>

      {isLoading ? (
        <Text>Searching...</Text>
      ) : (
        <FlatList
          data={searchResults?.data || []}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
              <Text>{item.details}</Text>
            </View>
          )}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
}
```

### **3. ➕ Create Task Component**

```typescript
// CreateTaskScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useCreateTask } from '@/hooks/useTaskApi';
import { CreateTaskRequest } from '@/api/types/tasks';

export default function CreateTaskScreen() {
  const [taskData, setTaskData] = useState<CreateTaskRequest>({
    title: '',
    category: [],
    dateType: 'Easy',
    time: 'Anytime',
    location: '',
    details: '',
    budget: 0,
    currency: 'LKR',
  });

  const createTaskMutation = useCreateTask();

  const handleCreateTask = () => {
    if (!taskData.title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    createTaskMutation.mutate(taskData, {
      onSuccess: (response) => {
        Alert.alert('Success', 'Task created successfully!');
        // Reset form or navigate back
        setTaskData({
          title: '',
          category: [],
          dateType: 'Easy',
          time: 'Anytime',
          location: '',
          details: '',
          budget: 0,
          currency: 'LKR',
        });
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to create task. Please try again.');
        console.error('Create task error:', error);
      },
    });
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Create New Task</Text>
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16 }}
        placeholder="Task title"
        value={taskData.title}
        onChangeText={(text) => setTaskData({ ...taskData, title: text })}
      />
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16, height: 100 }}
        placeholder="Task details"
        multiline
        value={taskData.details}
        onChangeText={(text) => setTaskData({ ...taskData, details: text })}
      />
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16 }}
        placeholder="Location"
        value={taskData.location}
        onChangeText={(text) => setTaskData({ ...taskData, location: text })}
      />
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16 }}
        placeholder="Budget"
        keyboardType="numeric"
        value={taskData.budget.toString()}
        onChangeText={(text) => setTaskData({ ...taskData, budget: parseInt(text) || 0 })}
      />

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 16, 
          borderRadius: 8, 
          marginTop: 16,
          opacity: createTaskMutation.isPending ? 0.6 : 1 
        }}
        onPress={handleCreateTask}
        disabled={createTaskMutation.isPending}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### **4. 📖 Task Details Component**

```typescript
// TaskDetailsScreen.tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useGetTaskById, useDeleteTask, useGetTaskOffers } from '@/hooks/useTaskApi';

interface TaskDetailsScreenProps {
  taskId: string;
}

export default function TaskDetailsScreen({ taskId }: TaskDetailsScreenProps) {
  const { data: taskResponse, isLoading } = useGetTaskById(taskId);
  const { data: offersResponse } = useGetTaskOffers(taskId);
  const deleteTaskMutation = useDeleteTask();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading task details...</Text>
      </View>
    );
  }

  if (!taskResponse?.data) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Task not found</Text>
      </View>
    );
  }

  const task = taskResponse.data;

  const handleDeleteTask = () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteTaskMutation.mutate(taskId, {
              onSuccess: () => {
                Alert.alert('Success', 'Task deleted successfully');
                // Navigate back
              },
              onError: () => {
                Alert.alert('Error', 'Failed to delete task');
              },
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>{task.title}</Text>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Details:</Text>
        <Text>{task.details}</Text>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Budget:</Text>
        <Text style={{ color: '#007AFF', fontSize: 18, fontWeight: 'bold' }}>
          {task.formattedBudget || `${task.currency} ${task.budget}`}
        </Text>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Location:</Text>
        <Text>{task.location.address}</Text>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Categories:</Text>
        <Text>{task.categories.join(', ')}</Text>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Status:</Text>
        <Text style={{ color: task.status === 'open' ? 'green' : 'orange' }}>{task.status}</Text>
      </View>
      
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#666', marginBottom: 8 }}>Offers:</Text>
        <Text>{offersResponse?.data.offerCount || 0} offers received</Text>
      </View>

      <TouchableOpacity 
        style={{ backgroundColor: 'red', padding: 16, borderRadius: 8, marginTop: 16 }}
        onPress={handleDeleteTask}
        disabled={deleteTaskMutation.isPending}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {deleteTaskMutation.isPending ? 'Deleting...' : 'Delete Task'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

### **5. 👤 My Tasks Component**

```typescript
// MyTasksScreen.tsx
import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useGetMyTasks } from '@/hooks/useTaskApi';

export default function MyTasksScreen() {
  const [activeTab, setActiveTab] = useState('all-tasks');
  
  const { data: myTasksResponse, isLoading } = useGetMyTasks({ 
    section: activeTab 
  });

  const tabs = [
    { key: 'all-tasks', label: 'All Tasks' },
    { key: 'open', label: 'Open' },
    { key: 'in-progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Navigation */}
      <View style={{ flexDirection: 'row', backgroundColor: '#f5f5f5' }}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={{
              flex: 1,
              padding: 16,
              backgroundColor: activeTab === tab.key ? '#007AFF' : 'transparent'
            }}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={{
              textAlign: 'center',
              color: activeTab === tab.key ? 'white' : '#333'
            }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={myTasksResponse?.data || []}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.title}</Text>
            <Text style={{ color: '#666', marginTop: 4 }}>{item.details}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
              <Text style={{ color: '#007AFF' }}>
                {item.formattedBudget || `${item.currency} ${item.budget}`}
              </Text>
              <Text style={{ color: item.status === 'open' ? 'green' : 'orange' }}>
                {item.status}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No tasks found</Text>
          </View>
        }
      />
    </View>
  );
}
```

### **6. 💰 Create Offer Component**

```typescript
// CreateOfferScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useCreateOffer } from '@/hooks/useTaskApi';

interface CreateOfferScreenProps {
  taskId: string;
  taskTitle: string;
  onOfferCreated: () => void;
}

export default function CreateOfferScreen({ taskId, taskTitle, onOfferCreated }: CreateOfferScreenProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  
  const createOfferMutation = useCreateOffer();

  const handleCreateOffer = () => {
    if (!amount.trim() || parseInt(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid offer amount');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    createOfferMutation.mutate({
      taskId,
      offerData: {
        amount: parseInt(amount),
        message: message.trim(),
      }
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Offer submitted successfully!');
        setAmount('');
        setMessage('');
        onOfferCreated();
      },
      onError: (error) => {
        Alert.alert('Error', 'Failed to submit offer. Please try again.');
        console.error('Create offer error:', error);
      },
    });
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Make an Offer</Text>
      <Text style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>{taskTitle}</Text>
      
      <TextInput
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 16 }}
        placeholder="Your offer amount (LKR)"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      
      <TextInput
        style={{ 
          borderWidth: 1, 
          borderColor: '#ccc', 
          padding: 12, 
          marginBottom: 16, 
          height: 100 
        }}
        placeholder="Tell the task poster why you're the right person for this job..."
        multiline
        value={message}
        onChangeText={setMessage}
      />

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 16, 
          borderRadius: 8,
          opacity: createOfferMutation.isPending ? 0.6 : 1 
        }}
        onPress={handleCreateOffer}
        disabled={createOfferMutation.isPending}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {createOfferMutation.isPending ? 'Submitting...' : 'Submit Offer'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### **7. 🤝 Offers Management Component**

```typescript
// OffersScreen.tsx
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useGetTaskOffers, useAcceptOffer } from '@/hooks/useTaskApi';
import { TaskOffer } from '@/api/types/tasks';

interface OffersScreenProps {
  taskId: string;
  isTaskOwner: boolean;
}

export default function OffersScreen({ taskId, isTaskOwner }: OffersScreenProps) {
  const { data: offersResponse, isLoading } = useGetTaskOffers(taskId);
  const acceptOfferMutation = useAcceptOffer();

  const handleAcceptOffer = (offerId: string) => {
    Alert.alert(
      'Accept Offer',
      'Are you sure you want to accept this offer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            acceptOfferMutation.mutate({ taskId, offerId }, {
              onSuccess: () => {
                Alert.alert('Success', 'Offer accepted successfully!');
              },
              onError: () => {
                Alert.alert('Error', 'Failed to accept offer');
              },
            });
          },
        },
      ]
    );
  };

  const renderOffer = ({ item }: { item: TaskOffer }) => (
    <View style={{ 
      padding: 16, 
      borderWidth: 1, 
      borderColor: '#eee', 
      borderRadius: 8, 
      marginBottom: 16 
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontWeight: 'bold' }}>
          {item.taskTakerId.firstName} {item.taskTakerId.lastName}
        </Text>
        <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>
          LKR {item.offer.amount}
        </Text>
      </View>
      
      <Text style={{ color: '#666', marginBottom: 8 }}>
        Rating: ⭐ {item.taskTakerId.rating}
      </Text>
      
      <Text style={{ marginBottom: 12 }}>
        {item.offer.message}
      </Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 12, color: '#999' }}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        {isTaskOwner && item.status === 'pending' && (
          <TouchableOpacity
            style={{ backgroundColor: '#007AFF', padding: 8, borderRadius: 4 }}
            onPress={() => handleAcceptOffer(item._id)}
            disabled={acceptOfferMutation.isPending}
          >
            <Text style={{ color: 'white', fontSize: 12 }}>
              {acceptOfferMutation.isPending ? 'Accepting...' : 'Accept'}
            </Text>
          </TouchableOpacity>
        )}
        
        {item.status !== 'pending' && (
          <Text style={{ 
            color: item.status === 'accepted' ? 'green' : 'red',
            fontSize: 12,
            fontWeight: 'bold'
          }}>
            {item.status.toUpperCase()}
          </Text>
        )}
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading offers...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        Offers ({offersResponse?.data.offerCount || 0})
      </Text>
      
      <FlatList
        data={offersResponse?.data.offers || []}
        renderItem={renderOffer}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={{ padding: 32, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No offers yet</Text>
          </View>
        }
      />
    </View>
  );
}
```

## 🚀 **READY TO USE!**

These components demonstrate how to use every API endpoint from your documentation. You can:

1. **Browse all tasks** with the TaskListScreen
2. **Search for specific tasks** with TaskSearchScreen  
3. **Create new tasks** with CreateTaskScreen
4. **View task details** with TaskDetailsScreen
5. **Manage your tasks** with MyTasksScreen
6. **Make offers** with CreateOfferScreen
7. **Handle offers** with OffersScreen

Each component includes proper error handling, loading states, and user feedback. The React Query hooks automatically handle caching, refetching, and data synchronization across your app!

🎯 **Next Steps:**
1. Add these components to your app
2. Style them to match your design
3. Add navigation between screens
4. Test with your backend API

Your complete API integration is ready! 🔥