import React, { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Slot, Redirect } from 'expo-router';
import { useColorScheme, Alert } from 'react-native';
import { AppLightTheme, AppDarkTheme } from '../constants/Colors';
import { User } from 'firebase/auth';
import { auth, db } from '../config/firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(index)',
};

function RootLayoutNav({ user }: { user: User | null }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
      {user ? <Redirect href="/(main)/home" /> : <Redirect href="/" />}
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loaded, error] = useFonts({
    Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
    RobotoBold: require('../assets/fonts/Roboto-Bold.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    let userListener: (() => void) | undefined;

    const authListener = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);

      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        userListener = onSnapshot(userRef,
          (snapshot) => {
            const userData = snapshot.data();
            if (userData?.suspended) {
              signOut(auth).then(() => {
                Alert.alert(
                  'Account Suspended',
                  'Your account has been suspended. Please contact support for assistance.',
                  [{
                    text: 'OK',
                    onPress: () => { }
                  }]
                );
              }).catch(error => {
                console.log("Error signing out:", error);
              });
            }
          },
          (error) => {
            if (error.code === 'permission-denied') {
              console.log("User access restricted");
              return;
            }
            console.error("Error checking user status:", error);
          }
        );
      }
    });

    return () => {
      authListener();
      if (userListener) {
        userListener();
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !authChecked) {
    return null;
  }

  return <RootLayoutNav user={user} />;
}