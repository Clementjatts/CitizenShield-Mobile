import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, SafeAreaView, Animated, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useUnreadMessages } from '../hooks/useUnreadMessages';

type TabIconName = 'home-outline' | 'home' | 'chatbubbles-outline' | 'chatbubbles' | 'mail-outline' | 'mail' | 'newspaper-outline' | 'newspaper';

interface TabBadge {
    show: boolean;
    count?: number;
    dot?: boolean;
}

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();
    const animatedValues = useRef(state.routes.map(() => new Animated.Value(0))).current;
    const unreadCount = useUnreadMessages();

    useEffect(() => {
        // Animate the focused tab
        Animated.parallel(
            state.routes.map((_, i) => {
                return Animated.timing(animatedValues[i], {
                    toValue: i === state.index ? 1 : 0,
                    duration: 200,
                    useNativeDriver: true,
                });
            })
        ).start();
    }, [state.index]);

    const getIconName = (routeName: string, isFocused: boolean): TabIconName => {
        switch (routeName) {
            case 'home':
                return isFocused ? 'home' : 'home-outline';
            case 'forum':
                return isFocused ? 'chatbubbles' : 'chatbubbles-outline';
            case 'messages':
                return isFocused ? 'mail' : 'mail-outline';
            case 'blog':
                return isFocused ? 'newspaper' : 'newspaper-outline';
            default:
                return isFocused ? 'home' : 'home-outline';
        }
    };

    const getLabelText = (routeName: string): string => {
        switch (routeName) {
            case 'messages':
                return 'Chat';
            case 'forum':
                return 'Forum';
            case 'blog':
                return 'Blog';
            case 'home':
                return 'Home';
            default:
                return routeName;
        }
    };

    const getBadgeData = (routeName: string): TabBadge => {
        switch (routeName) {
            case 'messages':
                return { 
                    show: unreadCount > 0,
                    count: unreadCount
                };
            default:
                return { show: false };
        }
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
        <SafeAreaView style={[styles.container]}>
            <View style={[styles.tabBar]}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;
                    const iconName = getIconName(route.name, isFocused);
                    const badge = getBadgeData(route.name);

                    const scale = animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                    });

                    const opacity = animatedValues[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                    });

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            onPress={() => handlePress(route, isFocused)}
                            style={styles.tabItem}
                            activeOpacity={0.7}
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
                                            badge.dot ? styles.dotBadge : styles.countBadge,
                                            { backgroundColor: colors.notification }
                                        ]}>
                                            {!badge.dot && (
                                                <Text style={styles.badgeText}>
                                                    {badge.count}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </Animated.View>
                                <Animated.Text 
                                    style={[
                                        styles.label,
                                        { 
                                            color: isFocused ? '#007AFF' : '#666666',
                                            opacity: isFocused ? 1 : 0.8,
                                            transform: [{ scale }]
                                        }
                                    ]}
                                    numberOfLines={1}
                                >
                                    {getLabelText(route.name)}
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
            <View style={[styles.blur, { backgroundColor: colors.card + 'CC' }]} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#FFFFFF',
    },
    tabBar: {
        flexDirection: 'row',
        height: 45,
        paddingBottom: 0,
        borderTopWidth: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        position: 'relative',
        zIndex: 2,
        backgroundColor: '#FFFFFF',
        shadowOffset: {
            width: 0,
            height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 10,
    },
    blur: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: Platform.OS === 'ios' ? 15 : 8,
        zIndex: 1,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 0,
        height: '100%',
        flexDirection: 'column',
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: 32,
        width: 32,
        marginBottom: -9,
    },
    iconWrapper: {
        position: 'relative',
        alignItems: 'center',
    },
    icon: {
        zIndex: 1,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
        marginTop: 0,
        textAlign: 'center',
        includeFontPadding: false,
        textAlignVertical: 'center',
        maxWidth: 60,
        lineHeight: 10,
    },
    activeBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 20,
        zIndex: 0,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 2,
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -6,
        zIndex: 2,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    countBadge: {
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    dotBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
});

export default CustomTabBar;