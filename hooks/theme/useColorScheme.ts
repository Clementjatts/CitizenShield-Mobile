import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useClientOnlyValue } from '../useClientOnlyValue';

export function useColorScheme() {
  // On web, we only want to use light/dark based on CSS media queries
  // In native, we want to use the device's color scheme
  return useClientOnlyValue('light', useNativeColorScheme() ?? 'light');
}
