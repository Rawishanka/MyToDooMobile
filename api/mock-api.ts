// Mock API service for development when server is unreachable
import { CreateTaskRequest, CreateTaskResponse, Task, TasksResponse } from './types/tasks';

// Mock task data generator
const generateMockTask = (overrides: Partial<Task> = {}): Task => ({
  _id: Math.random().toString(36).substr(2, 9),
  title: 'Mock Task',
  details: 'This is a mock task for development',
  categories: ['General'],
  budget: 100,
  currency: 'AUD',
  formattedBudget: 'A$100',
  status: 'open',
  dateType: 'Flexible',
  dateRange: {
    start: new Date().toISOString(),
    end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
  },
  time: 'Anytime',
  location: {
    address: 'Mock Location',
    coordinates: {
      type: 'Point',
      coordinates: [144.9631, -37.8136] // Melbourne coordinates
    }
  },
  images: [],
  createdBy: {
    _id: 'mock-user-id',
    firstName: 'Mock',
    lastName: 'User',
    rating: 4.5,
    email: 'mock@example.com',
    verified: true
  },
  statusHistory: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __v: 0,
  offerCount: Math.floor(Math.random() * 5),
  ...overrides
});

export class MockApiService {
  private static mockTasks: Task[] = Array.from({ length: 15 }, (_, i) => {
    const taskTypes = [
      'House Cleaning', 'Garden Maintenance', 'Furniture Assembly', 'Moving Help',
      'Computer Repair', 'Tutoring', 'Pet Care', 'Delivery Service',
      'Handyman Work', 'Photography', 'Web Design', 'Car Wash',
      'Cooking Service', 'Data Entry', 'Translation Work'
    ];
    
    const locations = [
      'Sydney CBD', 'Melbourne Central', 'Brisbane City', 'Perth Hills',
      'Adelaide Park', 'Darwin Centre', 'Hobart Marina', 'Canberra Mall',
      'Gold Coast Beach', 'Newcastle West', 'Wollongong South', 'Cairns North',
      'Townsville East', 'Geelong West', 'Ballarat Central'
    ];
    
    return generateMockTask({
      title: taskTypes[i] || `Mock Task ${i + 1}`,
      details: `Professional ${taskTypes[i]?.toLowerCase() || 'service'} needed. Please provide quality work and be punctual.`,
      budget: 50 + (i * 25),
      formattedBudget: `A$${50 + (i * 25)}`,
      offerCount: Math.floor(Math.random() * 10),
      location: {
        address: locations[i] || 'Mock Location',
        coordinates: {
          type: 'Point',
          coordinates: [144.9631 + (Math.random() - 0.5) * 2, -37.8136 + (Math.random() - 0.5) * 2]
        }
      },
      status: Math.random() > 0.7 ? 'completed' : 'open',
      categories: i % 3 === 0 ? ['Home & Garden'] : i % 3 === 1 ? ['Technology'] : ['General']
    });
  });

  static async postTask(taskData: CreateTaskRequest): Promise<CreateTaskResponse> {
    console.log('📝 Mock API: Creating task', taskData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const coordinates = taskData.coordinates || { lat: 6.9271, lng: 79.8612 };
    
    const newTask = generateMockTask({
      title: taskData.title,
      details: taskData.details,
      budget: taskData.budget,
      currency: taskData.currency,
      formattedBudget: `${taskData.currency}$${taskData.budget}`,
      location: {
        address: taskData.location,
        coordinates: {
          type: 'Point',
          coordinates: [coordinates.lng, coordinates.lat]
        }
      },
      dateType: taskData.dateType,
      dateRange: taskData.dateRange || {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      time: taskData.time,
      categories: taskData.category
    });
    
    // Add to mock database
    this.mockTasks.unshift(newTask);
    
    console.log('✅ Mock API: Task created successfully', newTask);
    
    return {
      success: true,
      data: newTask
    };
  }

  static async getAllTasks(): Promise<TasksResponse> {
    console.log('📝 Mock API: Fetching all tasks');
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      success: true,
      count: this.mockTasks.length,
      total: this.mockTasks.length,
      pages: 1,
      currentPage: 1,
      data: this.mockTasks
    };
  }

  static async searchTasks(params: any): Promise<TasksResponse> {
    console.log('📝 Mock API: Searching tasks', params);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredTasks = this.mockTasks;
    
    if (params.search) {
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(params.search.toLowerCase()) ||
        task.details.toLowerCase().includes(params.search.toLowerCase())
      );
    }
    
    return {
      success: true,
      count: filteredTasks.length,
      total: filteredTasks.length,
      pages: 1,
      currentPage: 1,
      data: filteredTasks
    };
  }
}