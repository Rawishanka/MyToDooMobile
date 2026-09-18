import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/src/shared/theme';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function WelcomeScreenLayout() {
  const { isDarkMode } = useTheme();
  // integrate tanstack query
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: isDarkMode ? '#0B1120' : '#FFFFFF' }
      }}>
        <Stack.Screen name="first-screen" />
        <Stack.Screen name="second-screen" />
        <Stack.Screen name="third-screen" />
        <Stack.Screen name="goal-screen" />
        <Stack.Screen name="title-screen" />
        <Stack.Screen name="time-select-screen" />
        <Stack.Screen name="location-screen" />
        <Stack.Screen name="budget-screen" />
        <Stack.Screen name="description-screen" />
        <Stack.Screen name="image-upload-screen" />
        <Stack.Screen name="detail-screen" />
        <Stack.Screen name="post-task-screen" />
      </Stack>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </QueryClientProvider>
  );
}
