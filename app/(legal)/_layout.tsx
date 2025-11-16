import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="terms" />
      <Stack.Screen name="community-guidelines" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}