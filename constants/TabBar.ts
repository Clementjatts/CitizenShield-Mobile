export type TabIconName = 'home-outline' | 'home' | 'chatbubbles-outline' | 'chatbubbles' | 'mail-outline' | 'mail' | 'newspaper-outline' | 'newspaper';
export type TabRouteName = 'home' | 'forum' | 'messages' | 'blog';

export const TAB_CONFIG = {
    routes: {
        home: {
            label: 'Home',
            icons: {
                active: 'home' as TabIconName,
                inactive: 'home-outline' as TabIconName,
            },
        },
        forum: {
            label: 'Forum',
            icons: {
                active: 'chatbubbles' as TabIconName,
                inactive: 'chatbubbles-outline' as TabIconName,
            },
        },
        messages: {
            label: 'Chat',
            icons: {
                active: 'mail' as TabIconName,
                inactive: 'mail-outline' as TabIconName,
            },
        },
        blog: {
            label: 'Blog',
            icons: {
                active: 'newspaper' as TabIconName,
                inactive: 'newspaper-outline' as TabIconName,
            },
        },
    },
    animation: {
        duration: 200,
        scale: {
            min: 1,
            max: 1.2,
        },
    },
} as const;
