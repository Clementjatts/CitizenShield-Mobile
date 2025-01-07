import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export function useClientOnlyValue<S, C>(server: S, client: C): S | C {
  const [value, setValue] = useState<S | C>(server);

  useEffect(() => {
    // Only update the value on the client side
    if (Platform.OS !== 'web' || typeof window !== 'undefined') {
      setValue(client);
    }
  }, [client]);

  return value;
}
