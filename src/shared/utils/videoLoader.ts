// utils/videoLoader.ts - Preload all videos for Metro bundler
// Metro bundler requires all assets to be statically referenced
const videoAssets = {
  '1': require('@/assets/services/Appliance_installation_and_repair.mp4'),
  '2': require('@/assets/services/Auto_mechanicle_and_Electrician.mp4'),
  '3': require('@/assets/services/Automotive.mp4'),
  '4': require('@/assets/services/Building_Maintences_and_Renovations.mp4'),
  '5': require('@/assets/services/Business_and_accounting.mp4'),
  '6': require('@/assets/services/carpentry.mp4'),
  '7': require('@/assets/services/Delivery.mp4'),
  '8': require('@/assets/services/education_and_tutoring.mp4'),
  '9': require('@/assets/services/Electrical.mp4'),
  '10': require('@/assets/services/Event_Planning.mp4'),
  '11': require('@/assets/services/furniture_repair_and_fl.mp4'),
  '12': require('@/assets/services/Graphic_designer.mp4'),
  '13': require('@/assets/services/Handyman_and_handywomen.mp4'),
  '14': require('@/assets/services/health_and_fitness.mp4'),
  '15': require('@/assets/services/IT_and_Tech.mp4'),
  '16': require('@/assets/services/Legal_services.mp4'),
  '17': require('@/assets/services/Marketing_advertising.mp4'),
  '18': require('@/assets/services/music_and_entertainment.mp4'),
  '19': require('@/assets/services/Painting_Services.mp4'),
  '20': require('@/assets/services/personal_assistence.mp4'),
  '21': require('@/assets/services/PetServices.mp4'),
  '22': require('@/assets/services/Photography.mp4'),
  '23': require('@/assets/services/Plumbing.mp4'),
  '24': require('@/assets/services/Real_estate_1.mp4'),
  '25': require('@/assets/services/somthing_else.mp4'),
  '26': require('@/assets/services/tours_and_transport.mp4'),
  '27': require('@/assets/services/Web_and_App_Dev.mp4'),
  '28': require('@/assets/services/Gardening_and_Landscaping.mp4'),
  '29': require('@/assets/services/Cleaning_and_Organising.mp4'),
  '30': require('@/assets/services/Removalist.mp4')
};

export const getCategoryVideo = (id: string) => {
  const video = videoAssets[id as keyof typeof videoAssets];
  return video !== undefined ? video : null;
};

export const categoryVideos = [
  { id: '1', title: 'Appliance Installation & Repair' },
  { id: '2', title: 'Auto Mechanic & Electrician' },
  { id: '3', title: 'Automotive' },
  { id: '4', title: 'Building Maintenance' },
  { id: '5', title: 'Business & Accounting' },
  { id: '6', title: 'Carpentry' },
  { id: '7', title: 'Delivery' },
  { id: '8', title: 'Education & Tutoring' },
  { id: '9', title: 'Electrical' },
  { id: '10', title: 'Event Planning' },
  { id: '11', title: 'Furniture Repair' },
  { id: '12', title: 'Graphic Design' },
  { id: '13', title: 'Handyman & Handywomen' },
  { id: '14', title: 'Health & Fitness' },
  { id: '15', title: 'IT & Tech' },
  { id: '16', title: 'Legal Services' },
  { id: '17', title: 'Marketing & Advertising' },
  { id: '18', title: 'Music & Entertainment' },
  { id: '19', title: 'Painting' },
  { id: '20', title: 'Personal Assistance' },
  { id: '21', title: 'Pet Care' },
  { id: '22', title: 'Photography' },
  { id: '23', title: 'Plumbing' },
  { id: '24', title: 'Real Estate' },
  { id: '25', title: 'Something Else' },
  { id: '26', title: 'Tours & Transport' },
  { id: '27', title: 'Web & App Development' },
  { id: '28', title: 'Gardening and Landscaping' },
  { id: '29', title: 'Cleaning and Organising' },
  { id: '30',title: 'Removalist'}
];