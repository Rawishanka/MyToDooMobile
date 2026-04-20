import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AuthLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack 
        screenOptions={{ 
          headerShown: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: '#ffffff',
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
