import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';
import CustomTabBar from '../../components/CustomTabBar';

// This file sets up the main layout for our app's tabs

export default function MainLayout() {
  // We're using the app's theme, but we're not doing anything with it right now
  useTheme();

  return (
    <Tabs
      // This hides the default header at the top of all tab screens
      screenOptions={{
        headerShown: false,
      }}
      // We're using our own custom tab bar instead of the default one
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Here we set up all the tabs for our app */}
      
      {/* This is the Home tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
        }}
      />

      {/* This is the Forum tab */}
      <Tabs.Screen
        name="forum"
        options={{
          title: 'Forum',
        }}
      />

      {/* This is the Messages tab */}
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />

      {/* This is the Blog tab */}
      <Tabs.Screen
        name="blog"
        options={{
          title: 'Blog',
        }}
      />

      {/* If you want to add a new tab, you can copy one of the Tabs.Screen 
          blocks above and change the 'name' and 'title' to whatever you want */}
    </Tabs>
  );
}
