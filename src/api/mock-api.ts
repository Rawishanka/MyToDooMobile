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
      { name: 'Sydney CBD', coords: [151.2093, -33.8688] },
      { name: 'Melbourne Central', coords: [144.9631, -37.8136] },
      { name: 'Brisbane City', coords: [153.0251, -27.4698] },
      { name: 'Perth Hills', coords: [115.8613, -31.9505] },
      { name: 'Adelaide Park', coords: [138.6007, -34.9285] },
      { name: 'Gold Coast Beach', coords: [153.4000, -28.0167] },
      { name: 'Newcastle West', coords: [151.7817, -32.9283] },
      { name: 'Wollongong South', coords: [150.8931, -34.4278] },
      { name: 'Cairns North', coords: [145.7781, -16.9186] },
      { name: 'Geelong West', coords: [144.3617, -38.1499] },
      { name: 'Townsville East', coords: [146.8169, -19.2590] },
      { name: 'Canberra Mall', coords: [149.1300, -35.2809] },
      { name: 'Darwin Centre', coords: [130.8456, -12.4634] },
      { name: 'Hobart Marina', coords: [147.3272, -42.8821] },
      { name: 'Ballarat Central', coords: [143.8503, -37.5622] }
    ];
    
    return generateMockTask({
      title: taskTypes[i] || `Mock Task ${i + 1}`,
      details: `Professional ${taskTypes[i]?.toLowerCase() || 'service'} needed. Please provide quality work and be punctual.`,
      budget: 50 + (i * 25),
      formattedBudget: `A$${50 + (i * 25)}`,
      offerCount: Math.floor(Math.random() * 10),
      location: {
        address: locations[i]?.name || 'Mock Location',
        coordinates: {
          type: 'Point',
          coordinates: locations[i]?.coords || [144.9631, -37.8136]
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
          coordinates: [
            'lng' in coordinates ? coordinates.lng : coordinates.longitude,
            'lat' in coordinates ? coordinates.lat : coordinates.latitude
          ]
        }
      },
      dateType: taskData.dateType,
      dateRange: taskData.dateRange || {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      time: taskData.time,
      categories: [taskData.category]
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