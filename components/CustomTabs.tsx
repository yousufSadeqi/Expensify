import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs/lib/typescript/src/types';
import { colors, radius, spacingY } from '@/constants/theme';
import * as Icon from 'phosphor-react-native';
import { verticalScale } from '@/utils/styling';
import Animated from 'react-native-reanimated';

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

export function CustomTabs({ state, descriptors, navigation }: BottomTabBarProps) {
  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconSize = verticalScale(24);
    const iconColor = isFocused ? colors.primary : colors.neutral400;
    const weight = isFocused ? "fill" : "regular";

    switch (routeName) {
      case 'index':
        return <Icon.House size={iconSize} color={iconColor} weight={weight} />;
      case 'statistics':
        return <Icon.ChartBar size={iconSize} color={iconColor} weight={weight} />;
      case 'wallet':
        return <Icon.Wallet size={iconSize} color={iconColor} weight={weight} />;
      case 'Profile':
        return <Icon.User size={iconSize} color={iconColor} weight={weight} />;
      default:
        return <Icon.House size={iconSize} color={iconColor} weight={weight} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route: TabRoute, index: number) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
            >
              <Animated.View style={[
                styles.tabItem,
                isFocused && styles.tabItemActive
              ]}>
                {getTabIcon(route.name, isFocused)}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral900, // Darker background
  },
  tabBar: {
    flexDirection: 'row',
    height: verticalScale(75),
    backgroundColor: colors.neutral800,
    paddingBottom: spacingY._15,
    paddingTop: spacingY._10,
    borderTopWidth: 1,
    borderTopColor: colors.neutral700,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: radius._12,
  },
  tabItemActive: {
    backgroundColor: colors.neutral700,
  }
});
