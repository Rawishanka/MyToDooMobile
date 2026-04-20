import EditTaskScreen from '@/src/features/tasks/screens/mytasks/edit-mytasks-screen';
import { Stack } from 'expo-router';

export default function EditTask() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <EditTaskScreen />
    </>
  );
}
