import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTheme } from '@/src/shared/theme';

const queryClient = new QueryClient();

export default function AuthLayout() {
  const { isDarkMode } = useTheme();
  return (
    <QueryClientProvider client={queryClient}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: isDarkMode ? '#0B1120' : '#ffffff',
          },
        }}
      >
      <Stack.Screen 
        name="login" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen 
        name="signup" 
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
    </QueryClientProvider>
  );
}
