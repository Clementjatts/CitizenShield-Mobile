export type AppRoutes = {
    index: undefined;
    login: undefined;
    signup: undefined;
    "forgot-password": undefined;
    "reset-password": undefined;
    "(main)": undefined;
    modal: undefined;
    "message/[id]": { id: string };
    "article/[id]": { id: string };
    "post/[id]": { id: string };
    "privacy-policy": undefined;
    "terms-of-service": undefined;
    "profile": undefined;
    "notifications": undefined;
    "edit-profile": undefined;
    "create-post": undefined;
    "change-password": undefined;
    "contact-support": undefined;
};

declare global {
    namespace ReactNavigation {
        interface RootParamList extends AppRoutes { }
    }
}
