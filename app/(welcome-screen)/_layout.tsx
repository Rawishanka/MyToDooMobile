import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // integrate tanstack query
  const queryClient = new QueryClient();

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="first-screen" options={{ headerShown: false }} />
          <Stack.Screen name="second-screen" options={{ headerShown: false }} />
          <Stack.Screen name="third-screen" options={{ headerShown: false }} />
          <Stack.Screen name="goal-screen" options={{ headerShown: false }} />
          <Stack.Screen name="title-screen" options={{ headerShown: false }} />
          <Stack.Screen name="time-select-screen" options={{ headerShown: false }} />
          <Stack.Screen name="location-screen" options={{ headerShown: false }} />
          <Stack.Screen name="budget-screen" options={{ headerShown: false }} />
          <Stack.Screen name="description-screen" options={{ headerShown: false }} />
          <Stack.Screen name="image-upload-screen" options={{ headerShown: false }} />
          <Stack.Screen name="detail-screen" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
