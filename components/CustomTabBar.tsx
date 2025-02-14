/**
 * CustomTabBar Component
 * A custom bottom tab bar navigation component with animated indicators
 * Supports icons, labels, and custom styling for active/inactive states
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView, Animated, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useTabAnimation } from '../hooks/useTabAnimation';
import { TAB_CONFIG, TabRouteName } from '../constants/TabBar';
import { CommonStyles } from '../constants/Styles';

/**
 * Interface for badge data display
 * @interface TabBadge
 * @property {boolean} show - Whether to show the badge
 * @property {number} [count] - Optional count to display in badge
 */
interface TabBadge {
    show: boolean;
    count?: number;
}

/**
 * Props for the CustomTabBar component
 * @interface CustomTabBarProps
 * @property {TabRouteName[]} routes - Array of route names for the tabs
 * @property {number} activeIndex - Index of the currently active tab
 * @property {(index: number) => void} onTabPress - Callback when a tab is pressed
 */
interface CustomTabBarProps extends BottomTabBarProps {
    // No additional props
}

/**
 * Maps route names to their corresponding icon names
 * @param {TabRouteName} route - Route name to get icon for
 * @returns {TabIconName} Corresponding icon name
 */
const getIconName = (routeName: TabRouteName, isFocused: boolean) => {
    const route = TAB_CONFIG.routes[routeName];
    return route ? (isFocused ? route.icons.active : route.icons.inactive) : TAB_CONFIG.routes.home.icons.inactive;
};

/**
 * Maps route names to their corresponding labels
 * @param {TabRouteName} route - Route name to get label for
 * @returns {string} Corresponding label
 */
const getLabelText = (routeName: TabRouteName) => {
    const route = TAB_CONFIG.routes[routeName];
    return route ? route.label : routeName;
};

/**
 * Gets badge data for a given route
 * @param {TabRouteName} route - Route name to get badge data for
 * @param {number} unreadCount - Number of unread messages
 * @returns {TabBadge} Badge data
 */
const getBadgeData = (routeName: TabRouteName, unreadCount: number): TabBadge => {
    if (routeName === 'messages') {
        return { 
            show: unreadCount > 0,
            count: unreadCount
        };
    }
    return { show: false };
};

/**
 * CustomTabBar Component
 * Renders a custom bottom tab bar with animated selection indicator
 * 
 * @param {CustomTabBarProps} props - Component props
 * @returns {React.ReactElement} Rendered component
 */
const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();
    const unreadCount = useUnreadMessages();
    const { getAnimatedStyles } = useTabAnimation(state.routes, state.index);

    /**
     * Handles tab press event
     * @param {any} route - Route object
     * @param {boolean} isFocused - Whether the tab is currently focused
     */
    const handlePress = (route: any, isFocused: boolean) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={[styles.tabBar, { borderTopColor: colors.border }]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconName = getIconName(route.name as TabRouteName, isFocused);
                    const badge = getBadgeData(route.name as TabRouteName, unreadCount);
                    const { scale, opacity } = getAnimatedStyles(index);

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={() => handlePress(route, isFocused)}
                            style={[styles.tabItem, { zIndex: 2 }]}
                            activeOpacity={0.7}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <View style={styles.iconContainer}>
                                {isFocused && (
                                    <Animated.View 
                                        style={[
                                            styles.activeBackground,
                                            { 
                                                backgroundColor: colors.primary + '10',
                                                opacity,
                                                transform: [{ scale }]
                                            }
                                        ]} 
                                    />
                                )}
                                <Animated.View style={[
                                    { transform: [{ scale }] },
                                    styles.iconWrapper
                                ]}>
                                    <Ionicons
                                        name={iconName}
                                        size={24}
                                        color={isFocused ? colors.primary : colors.text + '80'}
                                        style={styles.icon}
                                    />
                                    {badge.show && (
                                        <View style={[
                                            styles.badge,
                                            styles.countBadge,
                                            { backgroundColor: colors.notification }
                                        ]}>
                                            <Text style={styles.badgeText}>
                                                {badge.count}
                                            </Text>
                                        </View>
                                    )}
                                </Animated.View>
                                <Animated.Text 
                                    style={[
                                        styles.label,
                                        { 
                                            color: isFocused ? colors.primary : colors.text + '80',
                                            opacity: isFocused ? 1 : 0.8,
                                            transform: [{ scale }]
                                        }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {getLabelText(route.name as TabRouteName)}
                                </Animated.Text>
                                {isFocused && (
                                    <Animated.View 
                                        style={[
                                            styles.activeDot,
                                            { 
                                                backgroundColor: colors.primary,
                                                opacity,
                                                transform: [{ scale }]
                                            }
                                        ]} 
                                    />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
            <View style={[
                styles.blur,
                {
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                }
            ]} />
        </SafeAreaView>
    );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...CommonStyles.shadow,
    },
    tabBar: {
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: 24,
        borderTopWidth: 1,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 50,
    },
    iconWrapper: {
        position: 'relative',
    },
    icon: {
        marginBottom: 4,
    },
    activeBackground: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        position: 'absolute',
        bottom: 0,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    countBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        paddingHorizontal: 4,
    },
    label: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 2,
    },
    blur: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 30,
        borderTopWidth: 1,
    },
});

export default CustomTabBar;