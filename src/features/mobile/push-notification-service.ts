import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import notifee, {
    AndroidImportance,
    AndroidStyle,
    EventType,
    Notification
} from '@notifee/react-native';

export interface PushNotificationData {
    id: string;
    title: string;
    body: string;
    data?: Record<string, any>;
    type: 'call' | 'message' | 'appointment' | 'alert' | 'marketing';
    language: 'ml' | 'en' | 'manglish';
    priority: 'low' | 'normal' | 'high' | 'urgent';
    scheduledAt?: Date;
    expiresAt?: Date;
    sound?: string;
    vibrate?: boolean;
    largeIcon?: string;
    bigPicture?: string;
    actions?: Array<{
        id: string;
        title: string;
        icon?: string;
    }>;
}

export interface NotificationPreferences {
    enablePushNotifications: boolean;
    enableCallNotifications: boolean;
    enableMessageNotifications: boolean;
    enableAppointmentNotifications: boolean;
    enableMarketingNotifications: boolean;
    quietHoursStart?: string; // "22:00"
    quietHoursEnd?: string;   // "08:00"
    preferredLanguage: 'ml' | 'en' | 'manglish';
    vibrationEnabled: boolean;
    soundEnabled: boolean;
    customSounds: Record<string, string>;
}

export class PushNotificationService {
    private fcmToken: string | null = null;
    private preferences: NotificationPreferences | null = null;
    private isInitialized: boolean = false;

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Request permission for iOS
            if (Platform.OS === 'ios') {
                const authStatus = await messaging().requestPermission();
                const enabled =
                    authStatus === messaging().AuthorizationStatus.AUTHORIZED ||
                    authStatus === messaging().AuthorizationStatus.PROVISIONAL;

                if (!enabled) {
                    throw new Error('Push notification permission denied');
                }
            }

            // Get FCM token
            await this.getFCMToken();

            // Load user preferences
            await this.loadPreferences();

            // Create notification channels for Android
            await this.createNotificationChannels();

            // Set up message handlers
            this.setupMessageHandlers();

            // Set up foreground service for call handling
            await this.setupForegroundService();

            this.isInitialized = true;
            console.log('Push notification service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize push notifications:', error);
            throw error;
        }
    }

    private async getFCMToken(): Promise<string> {
        try {
            const token = await messaging().getToken();
            this.fcmToken = token;

            // Save token to AsyncStorage
            await AsyncStorage.setItem('fcm_token', token);

            // Send token to your backend
            await this.sendTokenToBackend(token);

            return token;
        } catch (error) {
            console.error('Failed to get FCM token:', error);
            throw error;
        }
    }

    private async sendTokenToBackend(token: string): Promise<void> {
        try {
            const userId = await AsyncStorage.getItem('user_id');
            const response = await fetch('/api/mobile/register-device', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    deviceToken: token,
                    platform: Platform.OS,
                    appVersion: '1.0.0', // From app config
                    deviceInfo: {
                        model: Platform.OS === 'ios' ? 'iPhone' : 'Android',
                        osVersion: Platform.Version
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to register device token');
            }
        } catch (error) {
            console.error('Failed to send token to backend:', error);
        }
    }

    private async createNotificationChannels(): Promise<void> {
        if (Platform.OS !== 'android') return;

        const channels = [
            {
                id: 'call_notifications',
                name: 'Call Notifications',
                description: 'Incoming call notifications',
                importance: AndroidImportance.HIGH,
                sound: 'ringtone',
                vibration: true,
            },
            {
                id: 'message_notifications',
                name: 'Message Notifications',
                description: 'Chat and SMS notifications',
                importance: AndroidImportance.DEFAULT,
                sound: 'message_tone',
                vibration: true,
            },
            {
                id: 'appointment_notifications',
                name: 'Appointment Notifications',
                description: 'Appointment reminders and updates',
                importance: AndroidImportance.DEFAULT,
                sound: 'notification',
                vibration: true,
            },
            {
                id: 'alert_notifications',
                name: 'Alert Notifications',
                description: 'Important alerts and warnings',
                importance: AndroidImportance.HIGH,
                sound: 'alert_tone',
                vibration: true,
            },
            {
                id: 'marketing_notifications',
                name: 'Marketing Notifications',
                description: 'Promotional messages and offers',
                importance: AndroidImportance.LOW,
                sound: 'soft_chime',
                vibration: false,
            }
        ];

        for (const channel of channels) {
            await notifee.createChannel(channel);
        }
    }

    private setupMessageHandlers(): void {
        // Background message handler
        messaging().setBackgroundMessageHandler(async (remoteMessage) => {
            console.log('Background message:', remoteMessage);
            await this.handleBackgroundNotification(remoteMessage);
        });

        // Foreground message handler
        messaging().onMessage(async (remoteMessage) => {
            console.log('Foreground message:', remoteMessage);
            await this.handleForegroundNotification(remoteMessage);
        });

        // App opened from notification
        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log('App opened from notification:', remoteMessage);
            this.handleNotificationTap(remoteMessage);
        });

        // App opened from quit state
        messaging().getInitialNotification().then((remoteMessage) => {
            if (remoteMessage) {
                console.log('App opened from quit state:', remoteMessage);
                this.handleNotificationTap(remoteMessage);
            }
        });

        // Handle notification interactions
        notifee.onForegroundEvent(({ type, detail }) => {
            if (type === EventType.ACTION_PRESS && detail.pressAction?.id) {
                this.handleNotificationAction(detail.pressAction.id, detail.notification);
            }
        });
    }

    private async handleBackgroundNotification(remoteMessage: any): Promise<void> {
        if (!this.shouldShowNotification(remoteMessage)) {
            return;
        }

        const notification = this.parseRemoteMessage(remoteMessage);
        await this.displayLocalNotification(notification);
    }

    private async handleForegroundNotification(remoteMessage: any): Promise<void> {
        if (!this.shouldShowNotification(remoteMessage)) {
            return;
        }

        const notification = this.parseRemoteMessage(remoteMessage);

        // For calls, show immediate notification even in foreground
        if (notification.type === 'call') {
            await this.displayLocalNotification(notification);
        } else {
            // For other types, show in-app notification or banner
            await this.showInAppNotification(notification);
        }
    }

    private parseRemoteMessage(remoteMessage: any): PushNotificationData {
        const { notification, data } = remoteMessage;

        return {
            id: data?.id || Date.now().toString(),
            title: notification?.title || '',
            body: notification?.body || '',
            data: data || {},
            type: data?.type || 'message',
            language: data?.language || 'en',
            priority: data?.priority || 'normal',
            sound: data?.sound,
            vibrate: data?.vibrate === 'true',
            largeIcon: data?.largeIcon,
            bigPicture: data?.bigPicture,
            actions: data?.actions ? JSON.parse(data.actions) : undefined
        };
    }

    async displayLocalNotification(notificationData: PushNotificationData): Promise<void> {
        try {
            const channelId = this.getChannelId(notificationData.type);

            const notification: Notification = {
                id: notificationData.id,
                title: notificationData.title,
                body: notificationData.body,
                data: notificationData.data,
                android: {
                    channelId,
                    importance: this.getAndroidImportance(notificationData.priority),
                    pressAction: {
                        id: 'default',
                        launchActivity: 'default'
                    },
                    largeIcon: notificationData.largeIcon,
                    style: notificationData.bigPicture ? {
                        type: AndroidStyle.BIGPICTURE,
                        picture: notificationData.bigPicture,
                    } : undefined,
                    actions: notificationData.actions?.map(action => ({
                        title: action.title,
                        pressAction: {
                            id: action.id,
                        },
                        icon: action.icon,
                    })),
                    sound: notificationData.sound,
                },
                ios: {
                    sound: notificationData.sound,
                    categoryId: notificationData.type,
                    attachments: notificationData.bigPicture ? [{
                        id: 'image',
                        url: notificationData.bigPicture,
                    }] : undefined,
                },
            };

            // Special handling for call notifications
            if (notificationData.type === 'call') {
                notification.android = {
                    ...notification.android,
                    ongoing: true,
                    autoCancel: false,
                    fullScreenAction: {
                        id: 'answer_call',
                        launchActivity: 'default'
                    },
                    actions: [
                        {
                            title: this.getLocalizedText('answer', notificationData.language),
                            pressAction: { id: 'answer_call' },
                            icon: 'ic_call_answer',
                        },
                        {
                            title: this.getLocalizedText('decline', notificationData.language),
                            pressAction: { id: 'decline_call' },
                            icon: 'ic_call_decline',
                        }
                    ]
                };
            }

            await notifee.displayNotification(notification);
        } catch (error) {
            console.error('Failed to display notification:', error);
        }
    }

    private async showInAppNotification(notificationData: PushNotificationData): Promise<void> {
        // Show toast or banner notification for foreground notifications
        Alert.alert(
            notificationData.title,
            notificationData.body,
            [
                {
                    text: this.getLocalizedText('dismiss', notificationData.language),
                    style: 'cancel'
                },
                {
                    text: this.getLocalizedText('view', notificationData.language),
                    onPress: () => this.handleNotificationTap({ data: notificationData.data })
                }
            ]
        );
    }

    private handleNotificationTap(remoteMessage: any): void {
        const data = remoteMessage.data;

        switch (data?.type) {
            case 'call':
                this.navigateToCallScreen(data);
                break;
            case 'message':
                this.navigateToMessageScreen(data);
                break;
            case 'appointment':
                this.navigateToAppointmentScreen(data);
                break;
            default:
                this.navigateToHomeScreen();
        }
    }

    private handleNotificationAction(actionId: string, notification: any): void {
        const data = notification?.data;

        switch (actionId) {
            case 'answer_call':
                this.answerCall(data);
                break;
            case 'decline_call':
                this.declineCall(data);
                break;
            case 'reply_message':
                this.quickReplyMessage(data);
                break;
            case 'snooze_reminder':
                this.snoozeReminder(data);
                break;
        }
    }

    private async setupForegroundService(): Promise<void> {
        if (Platform.OS !== 'android') return;

        // Create foreground service channel
        await notifee.createChannel({
            id: 'foreground_service',
            name: 'AI IVR Service',
            importance: AndroidImportance.LOW,
        });
    }

    // Public API methods
    async sendLocalNotification(notificationData: PushNotificationData): Promise<void> {
        await this.displayLocalNotification(notificationData);
    }

    async scheduleNotification(notificationData: PushNotificationData, scheduledAt: Date): Promise<void> {
        try {
            const trigger = {
                type: 'TIMESTAMP' as const,
                timestamp: scheduledAt.getTime(),
            };

            await notifee.createTriggerNotification(
                {
                    id: notificationData.id,
                    title: notificationData.title,
                    body: notificationData.body,
                    data: notificationData.data,
                    android: {
                        channelId: this.getChannelId(notificationData.type),
                    }
                },
                trigger
            );
        } catch (error) {
            console.error('Failed to schedule notification:', error);
        }
    }

    async cancelNotification(notificationId: string): Promise<void> {
        await notifee.cancelNotification(notificationId);
    }

    async cancelAllNotifications(): Promise<void> {
        await notifee.cancelAllNotifications();
    }

    // Preference management
    async loadPreferences(): Promise<NotificationPreferences> {
        try {
            const prefsJson = await AsyncStorage.getItem('notification_preferences');
            if (prefsJson) {
                this.preferences = JSON.parse(prefsJson);
            } else {
                // Default preferences
                this.preferences = {
                    enablePushNotifications: true,
                    enableCallNotifications: true,
                    enableMessageNotifications: true,
                    enableAppointmentNotifications: true,
                    enableMarketingNotifications: false,
                    preferredLanguage: 'en',
                    vibrationEnabled: true,
                    soundEnabled: true,
                    customSounds: {}
                };
                await this.savePreferences();
            }
            return this.preferences!;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            throw error;
        }
    }

    async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
        if (!this.preferences) {
            await this.loadPreferences();
        }

        this.preferences = { ...this.preferences!, ...preferences };
        await this.savePreferences();
    }

    private async savePreferences(): Promise<void> {
        if (this.preferences) {
            await AsyncStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
        }
    }

    private shouldShowNotification(remoteMessage: any): boolean {
        if (!this.preferences?.enablePushNotifications) {
            return false;
        }

        const type = remoteMessage.data?.type || 'message';

        switch (type) {
            case 'call':
                return this.preferences.enableCallNotifications;
            case 'message':
                return this.preferences.enableMessageNotifications;
            case 'appointment':
                return this.preferences.enableAppointmentNotifications;
            case 'marketing':
                return this.preferences.enableMarketingNotifications;
            default:
                return true;
        }
    }

    private isInQuietHours(): boolean {
        if (!this.preferences?.quietHoursStart || !this.preferences?.quietHoursEnd) {
            return false;
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const [startHour, startMin] = this.preferences.quietHoursStart.split(':').map(Number);
        const [endHour, endMin] = this.preferences.quietHoursEnd.split(':').map(Number);

        const startTime = startHour * 60 + startMin;
        const endTime = endHour * 60 + endMin;

        if (startTime > endTime) {
            // Overnight quiet hours (e.g., 22:00 to 08:00)
            return currentTime >= startTime || currentTime <= endTime;
        } else {
            // Same day quiet hours (e.g., 12:00 to 14:00)
            return currentTime >= startTime && currentTime <= endTime;
        }
    }

    // Helper methods
    private getChannelId(type: string): string {
        switch (type) {
            case 'call':
                return 'call_notifications';
            case 'message':
                return 'message_notifications';
            case 'appointment':
                return 'appointment_notifications';
            case 'alert':
                return 'alert_notifications';
            case 'marketing':
                return 'marketing_notifications';
            default:
                return 'message_notifications';
        }
    }

    private getAndroidImportance(priority: string): AndroidImportance {
        switch (priority) {
            case 'urgent':
                return AndroidImportance.HIGH;
            case 'high':
                return AndroidImportance.DEFAULT;
            case 'normal':
                return AndroidImportance.DEFAULT;
            case 'low':
                return AndroidImportance.LOW;
            default:
                return AndroidImportance.DEFAULT;
        }
    }

    private getLocalizedText(key: string, language: string): string {
        const texts = {
            answer: {
                ml: 'ഉത്തരം',
                en: 'Answer',
                manglish: 'Answer'
            },
            decline: {
                ml: 'നിരസിക്കുക',
                en: 'Decline',
                manglish: 'Decline'
            },
            dismiss: {
                ml: 'തള്ളിക്കളയുക',
                en: 'Dismiss',
                manglish: 'Dismiss'
            },
            view: {
                ml: 'കാണുക',
                en: 'View',
                manglish: 'View'
            }
        };

        return texts[key as keyof typeof texts]?.[language as keyof (typeof texts)[keyof typeof texts]] || texts[key as keyof typeof texts]?.en || key;
    }

    // Navigation methods (to be implemented based on your navigation setup)
    private navigateToCallScreen(data: any): void {
        // Navigation logic for call screen
        console.log('Navigate to call screen:', data);
    }

    private navigateToMessageScreen(data: any): void {
        // Navigation logic for message screen  
        console.log('Navigate to message screen:', data);
    }

    private navigateToAppointmentScreen(data: any): void {
        // Navigation logic for appointment screen
        console.log('Navigate to appointment screen:', data);
    }

    private navigateToHomeScreen(): void {
        // Navigation logic for home screen
        console.log('Navigate to home screen');
    }

    // Call handling methods
    private answerCall(data: any): void {
        console.log('Answer call:', data);
        // Implement call answering logic
    }

    private declineCall(data: any): void {
        console.log('Decline call:', data);
        // Implement call declining logic
    }

    private quickReplyMessage(data: any): void {
        console.log('Quick reply message:', data);
        // Implement quick reply logic
    }

    private snoozeReminder(data: any): void {
        console.log('Snooze reminder:', data);
        // Implement snooze logic
    }

    // Token management
    async refreshToken(): Promise<string> {
        try {
            await messaging().deleteToken();
            return await this.getFCMToken();
        } catch (error) {
            console.error('Failed to refresh FCM token:', error);
            throw error;
        }
    }

    async getToken(): Promise<string | null> {
        return this.fcmToken;
    }

    // Badge management
    async setBadgeCount(count: number): Promise<void> {
        if (Platform.OS === 'ios') {
            await notifee.setBadgeCount(count);
        }
    }

    async incrementBadgeCount(): Promise<void> {
        if (Platform.OS === 'ios') {
            const currentCount = await notifee.getBadgeCount();
            await notifee.setBadgeCount(currentCount + 1);
        }
    }

    async clearBadgeCount(): Promise<void> {
        if (Platform.OS === 'ios') {
            await notifee.setBadgeCount(0);
        }
    }
}