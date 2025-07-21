type BaseTask = {
  mainGoal: string;
  title: string;
  description: string;
  budget: number;
  date: string;
  time: string;
  photo: string;
};

// ✅ Case 1: isRemoval = true
type RemovalTask = BaseTask & {
  isRemoval: true;
  pickupLocation: string;
  deliveryLocation: string;
  isOnline?: never;
  inPerson?: never;
  suburb?: never;
};

// ✅ Case 2: isRemoval = false AND isOnline = true
type OnlineTask = BaseTask & {
  isRemoval: false;
  isOnline: true;
  inPerson?: false;
  suburb?: never;
  pickupLocation?: never;
  deliveryLocation?: never;
};

// ✅ Case 3: isRemoval = false AND inPerson = true
type InPersonTask = BaseTask & {
  isRemoval: false;
  isOnline?: false;
  inPerson: true;
  suburb: string;
  pickupLocation?: never;
  deliveryLocation?: never;
};

// ✅ Final Union Type
export type CreateTask =BaseTask| RemovalTask | OnlineTask | InPersonTask;