import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();

    const getIconName = (routeName: string): keyof typeof Ionicons.glyphMap => {
        switch (routeName) {
            case 'home':
                return 'home';
            case 'forum':
                return 'chatbubbles';
            case 'messages':
                return 'mail';
            case 'blog':
                return 'newspaper';
            default:
                return 'home';
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.card }]}>
            <View style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
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

                    const iconName = getIconName(route.name);

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <View style={styles.iconContainer}>
                                {isFocused && <View style={[styles.activeLine, { backgroundColor: colors.primary }]} />}
                                <Ionicons
                                    name={iconName}
                                    size={28}
                                    color={isFocused ? colors.primary : colors.text}
                                />
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    tabBar: {
        flexDirection: 'row',
        height: 60,
        paddingBottom: Platform.OS === 'ios' ? 5 : 0,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 0,
    },
    iconContainer: {
        alignItems: 'center',
    },
    activeLine: {
        position: 'absolute',
        top: -12,
        width: 30,
        height: 3,
        borderRadius: 2,
    },
});

export default CustomTabBar;