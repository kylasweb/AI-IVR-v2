// Ambient module declarations for mobile app

declare module './store/store' {
    export const store: any;
    export const persistor: any;
}

declare module '../features/mobile/push-notification-service' {
    export class PushNotificationService {
        static getInstance(): PushNotificationService;
        initialize(): Promise<void>;
        [key: string]: any;
    }
}

declare module './i18n/i18n' {
    // Side-effect import
}

declare module '../features/mobile/components/CallScreen' {
    import React from 'react';
    const CallScreen: React.ComponentType<any>;
    export default CallScreen;
}

declare module './screens/SplashScreen' {
    import React from 'react';
    const SplashScreen: React.ComponentType<any>;
    export default SplashScreen;
}

declare module './screens/LoginScreen' {
    import React from 'react';
    const LoginScreen: React.ComponentType<any>;
    export default LoginScreen;
}

declare module './screens/HomeScreen' {
    import React from 'react';
    const HomeScreen: React.ComponentType<any>;
    export default HomeScreen;
}

declare module './screens/ChatScreen' {
    import React from 'react';
    const ChatScreen: React.ComponentType<any>;
    export default ChatScreen;
}

declare module './screens/ContactsScreen' {
    import React from 'react';
    const ContactsScreen: React.ComponentType<any>;
    export default ContactsScreen;
}

declare module './screens/SettingsScreen' {
    import React from 'react';
    const SettingsScreen: React.ComponentType<any>;
    export default SettingsScreen;
}

declare module './screens/ProfileScreen' {
    import React from 'react';
    const ProfileScreen: React.ComponentType<any>;
    export default ProfileScreen;
}

declare module './screens/NotificationsScreen' {
    import React from 'react';
    const NotificationsScreen: React.ComponentType<any>;
    export default NotificationsScreen;
}

declare module './screens/HistoryScreen' {
    import React from 'react';
    const HistoryScreen: React.ComponentType<any>;
    export default HistoryScreen;
}

declare module './screens/AppointmentsScreen' {
    import React from 'react';
    const AppointmentsScreen: React.ComponentType<any>;
    export default AppointmentsScreen;
}

declare module './screens/SupportScreen' {
    import React from 'react';
    const SupportScreen: React.ComponentType<any>;
    export default SupportScreen;
}

declare module './screens/LanguageScreen' {
    import React from 'react';
    const LanguageScreen: React.ComponentType<any>;
    export default LanguageScreen;
}

declare module './screens/PrivacyScreen' {
    import React from 'react';
    const PrivacyScreen: React.ComponentType<any>;
    export default PrivacyScreen;
}

declare module './screens/AboutScreen' {
    import React from 'react';
    const AboutScreen: React.ComponentType<any>;
    export default AboutScreen;
}