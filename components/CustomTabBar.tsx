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

interface TabBadge {
    show: boolean;
    count?: number;
}

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();
    const unreadCount = useUnreadMessages();
    const { getAnimatedStyles } = useTabAnimation(state.routes, state.index);

    const getIconName = (routeName: TabRouteName, isFocused: boolean) => {
        const route = TAB_CONFIG.routes[routeName];
        return route ? (isFocused ? route.icons.active : route.icons.inactive) : TAB_CONFIG.routes.home.icons.inactive;
    };

    const getLabelText = (routeName: TabRouteName) => {
        const route = TAB_CONFIG.routes[routeName];
        return route ? route.label : routeName;
    };

    const getBadgeData = (routeName: TabRouteName): TabBadge => {
        if (routeName === 'messages') {
            return { 
                show: unreadCount > 0,
                count: unreadCount
            };
        }
        return { show: false };
    };

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
                    const badge = getBadgeData(route.name as TabRouteName);
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

const styles = StyleSheet.create({
    container: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    tabBar: {
        ...CommonStyles.row,
        height: 60,
        paddingBottom: 0,
        borderTopWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    tabItem: {
        flex: 1,
        height: 60,
        ...CommonStyles.flexCenter,
    },
    iconContainer: {
        ...CommonStyles.flexCenter,
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    iconWrapper: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    icon: {
        marginBottom: 2,
    },
    label: {
        fontSize: 11,
        marginTop: 2,
        fontWeight: '500',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -6,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        ...CommonStyles.flexCenter,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    countBadge: {
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
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
        marginTop: 4,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
        borderTopWidth: 1,
        zIndex: 1,
    },
});

export default CustomTabBar;