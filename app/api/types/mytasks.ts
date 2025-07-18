export interface TaskResponse {
  success: boolean;
  data: Task[];
}

export interface Task {
  _id: string;
  title: string;
  categories: string[];
  dateType: string;
  dateRange: {
    start: string; 
    end: string;
  };
  time: string;
  location: {
    address: string;
    coordinates: {
      type: string;
      coordinates: [number, number]; 
    };
  };
  details: string;
  budget: number;
  currency: string;
  images: string[];
  status: string;
  createdBy: {
    _id: string;
  };
  __v: number;
  formattedDate: string;
  dateDisplay: {
    type: string;
    display: string;
  };
  offerCount: number;
  offers: any[];
}
