// hooks/useStorageState.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export function useStorageState(key: string): [[boolean, string | null], (value: string | null) => Promise<void>] {
  const [state, setState] = useState<[boolean, string | null]>([true, null]);

  useEffect(() => {
    // Use setTimeout to avoid blocking the main thread
    const loadStorageValue = async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setState([false, value]);
      } catch (error) {

        setState([false, null]);
      }
    };
    
    // Don't block initial render
    setTimeout(loadStorageValue, 0);
  }, [key]);

  const setValue = async (value: string | null) => {
    if (value === null) {
      await AsyncStorage.removeItem(key);
    } else {
      await AsyncStorage.setItem(key, value);
    }
    setState([false, value]);
  };

  return [state, setValue];
}
