import { Task } from '@/src/api/types/tasks';

const defaultCoordinates = {
  type: 'Point',
  coordinates: [-33.8688, 151.2093] // Default Sydney coordinates
};

const defaultDateRange = {
  start: new Date().toISOString(),
  end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
};

const baseTask = {
  dateRange: defaultDateRange,
  images: [],
  statusHistory: [],
  updatedAt: new Date().toISOString(),
  __v: 0,
};

export const sampleTasks: { [key: string]: Task[] } = {
  // For Tasker Role
  openTasks: [
    {
      ...baseTask,
      _id: '1',
      title: 'Moving Help Needed',
      details: 'Need help moving furniture from apartment to new house',
      status: 'open',
      budget: 150,
      currency: 'AUD',
      dateType: 'specific',
      time: '10:00 AM',
      createdAt: new Date().toISOString(),
      categories: ['Moving', 'Heavy Lifting'],
      location: {
        address: '123 Sydney Road, Melbourne',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user1',
        firstName: 'John',
        lastName: 'Smith',
        rating: 4.5,
        verified: true
      }
    },
    {
      ...baseTask,
      _id: '2',
      title: 'Garden Maintenance',
      details: 'Regular garden maintenance including mowing and weeding',
      status: 'open',
      budget: 80,
      currency: 'AUD',
      dateType: 'flexible',
      time: 'Anytime',
      createdAt: new Date().toISOString(),
      categories: ['Gardening', 'Maintenance'],
      location: {
        address: '456 Brisbane St, Brisbane',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        rating: 4.8,
        verified: true
      }
    }
  ],
  
  todoTasks: [
    {
      ...baseTask,
      _id: '3',
      title: 'House Cleaning',
      details: 'Deep cleaning of 3-bedroom house',
      status: 'assigned',
      budget: 200,
      currency: 'AUD',
      dateType: 'specific',
      time: '9:00 AM',
      createdAt: new Date().toISOString(),
      categories: ['Cleaning', 'House Work'],
      location: {
        address: '789 Perth Road, Perth',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user3',
        firstName: 'Michael',
        lastName: 'Brown',
        rating: 4.2,
        verified: true
      }
    }
  ],
  
  // For Poster Role
  postedTasks: [
    {
      ...baseTask,
      _id: '4',
      title: 'Website Development',
      details: 'Create a simple portfolio website',
      status: 'open',
      budget: 500,
      currency: 'AUD',
      dateType: 'no-rush',
      time: 'Flexible',
      createdAt: new Date().toISOString(),
      categories: ['Web Development', 'IT'],
      location: {
        address: 'Online',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user4',
        firstName: 'Emma',
        lastName: 'Wilson',
        rating: 4.6,
        verified: true
      }
    }
  ],
  
  acceptedTasks: [
    {
      ...baseTask,
      _id: '5',
      title: 'Dog Walking Service',
      details: 'Walk my golden retriever for 30 minutes',
      status: 'accepted',
      budget: 30,
      currency: 'AUD',
      dateType: 'specific',
      time: '4:00 PM',
      createdAt: new Date().toISOString(),
      categories: ['Pet Care', 'Dog Walking'],
      location: {
        address: '321 Adelaide Ave, Adelaide',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user5',
        firstName: 'David',
        lastName: 'Lee',
        rating: 4.9,
        verified: true
      }
    }
  ],
  
  completedTasks: [
    {
      ...baseTask,
      _id: '6',
      title: 'iPhone Screen Repair',
      details: 'Replace broken iPhone 13 screen',
      status: 'completed',
      budget: 120,
      currency: 'AUD',
      dateType: 'specific',
      time: '2:00 PM',
      createdAt: new Date().toISOString(),
      categories: ['Phone Repair', 'Electronics'],
      location: {
        address: '654 Hobart Place, Hobart',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user6',
        firstName: 'Lisa',
        lastName: 'Taylor',
        rating: 4.7,
        verified: true
      }
    }
  ],
  
  overdueTasks: [
    {
      ...baseTask,
      _id: '7',
      title: 'Math Tutoring',
      details: 'Need help with calculus homework',
      status: 'overdue',
      budget: 50,
      currency: 'AUD',
      dateType: 'specific',
      time: '3:00 PM',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      categories: ['Tutoring', 'Education'],
      location: {
        address: 'Online',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user7',
        firstName: 'James',
        lastName: 'Anderson',
        rating: 4.4,
        verified: true
      }
    }
  ],
  
  cancelledTasks: [
    {
      ...baseTask,
      _id: '8',
      title: 'Event Photography',
      details: 'Photographer needed for birthday party',
      status: 'cancelled',
      budget: 300,
      currency: 'AUD',
      dateType: 'specific',
      time: '6:00 PM',
      createdAt: new Date().toISOString(),
      categories: ['Photography', 'Events'],
      location: {
        address: '987 Darwin Drive, Darwin',
        coordinates: defaultCoordinates
      },
      createdBy: {
        _id: 'user8',
        firstName: 'Sophie',
        lastName: 'Martin',
        rating: 4.3,
        verified: true
      }
    }
  ]
};