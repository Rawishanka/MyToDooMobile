import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// Import task creation screens from features
import FirstScreen from '@/src/features/dashboard/screens/first-screen';
import SecondScreen from '@/src/features/dashboard/screens/second-screen';
import ThirdScreen from '@/src/features/dashboard/screens/third-screen';
import BudgetScreen from '@/src/features/tasks/screens/create/budget-screen';
import DescriptionScreen from '@/src/features/tasks/screens/create/description-screen';
import DetailScreen from '@/src/features/tasks/screens/create/detail-screen';
import GoalScreen from '@/src/features/tasks/screens/create/goal-screen';
import ImageUploadScreen from '@/src/features/tasks/screens/create/image-upload-screen';
import LocationScreen from '@/src/features/tasks/screens/create/location-screen';
import PostTaskScreen from '@/src/features/tasks/screens/create/post-task-screen';
import TimeSelectScreen from '@/src/features/tasks/screens/create/time-select-screen';
import TitleScreen from '@/src/features/tasks/screens/create/title-screen';

const Stack = createStackNavigator();

export default function TaskCreationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="first-screen" component={FirstScreen} />
      <Stack.Screen name="second-screen" component={SecondScreen} />
      <Stack.Screen name="third-screen" component={ThirdScreen} />
      <Stack.Screen name="goal-screen" component={GoalScreen} />
      <Stack.Screen name="title-screen" component={TitleScreen} />
      <Stack.Screen name="time-select-screen" component={TimeSelectScreen} />
      <Stack.Screen name="location-screen" component={LocationScreen} />
      <Stack.Screen name="budget-screen" component={BudgetScreen} />
      <Stack.Screen name="description-screen" component={DescriptionScreen} />
      <Stack.Screen name="image-upload-screen" component={ImageUploadScreen} />
      <Stack.Screen name="detail-screen" component={DetailScreen} />
      <Stack.Screen name="post-task-screen" component={PostTaskScreen} />
    </Stack.Navigator>
  );
}
