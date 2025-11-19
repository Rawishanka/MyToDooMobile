import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
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
  );
}
