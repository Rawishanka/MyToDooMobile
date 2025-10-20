type BaseTask = {
  mainGoal: string;
  title: string;
  description: string;
  budget: number;
  date: string;
  time: string;
  photo: string; // Keep for backwards compatibility
  photos: string[]; // New field for multiple images
};

// ✅ Case 1: isRemoval = true
type RemovalTask = BaseTask & {
  isRemoval: true;
  pickupLocation: string;
  deliveryLocation: string;
  category?: never;
};

// ✅ Case 2: isRemoval = false (with category)
type CategoryTask = BaseTask & {
  isRemoval: false;
  category: string;
  location?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pickupLocation?: never;
  deliveryLocation?: never;
};

// ✅ Final Union Type
export type CreateTask = RemovalTask | CategoryTask;