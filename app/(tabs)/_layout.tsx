import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabs } from '@/components/CustomTabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { colors } from '@/constants/theme'; // Ensure you have color constants

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: colors.neutral800, // Set to match the tabs' background
        },
      }}
      tabBar={(props: BottomTabBarProps) => <CustomTabs {...props} />}
    >
      {/* Order has been changed here */}
      <Tabs.Screen
        name="index" // Home - First
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="statistics" // Wallet - Second
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="wallet" // Statistics - Third
        options={{
          title: '',
        }}
      />
      <Tabs.Screen
        name="Profile" // Profile - Last
        options={{
          title: '',
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
