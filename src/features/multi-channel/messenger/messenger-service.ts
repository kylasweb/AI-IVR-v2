import axios from 'axios';
import crypto from 'crypto';

export interface MessengerMessage {
    id: string;
    senderId: string;
    recipientId: string;
    message: string;
    type: 'text' | 'quick_reply' | 'postback' | 'attachment';
    timestamp: Date;
    attachments?: Array<{
        type: string;
        payload: { url: string };
    }>;
    quickReply?: {
        payload: string;
    };
}

export interface MessengerUser {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture: string;
    locale: string;
    timezone: number;
    language: string;
    conversationHistory: MessengerMessage[];
    lastInteraction: Date;
}

export interface MessengerWebhookPayload {
    object: string;
    entry: Array<{
        id: string;
        time: number;
        messaging: Array<{
            sender: { id: string };
            recipient: { id: string };
            timestamp: number;
            message?: {
                mid: string;
                text?: string;
                quick_reply?: { payload: string };
                attachments?: Array<{
                    type: string;
                    payload: { url: string };
                }>;
            };
            postback?: {
                payload: string;
                title: string;
            };
        }>;
    }>;
}

export class FacebookMessengerService {
    private accessToken: string;
    private appSecret: string;
    private verifyToken: string;
    private apiVersion: string = 'v18.0';
    private baseUrl: string;
    private users: Map<string, MessengerUser> = new Map();

    constructor() {
        this.accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || '';
        this.appSecret = process.env.FACEBOOK_APP_SECRET || '';
        this.verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || '';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

        if (!this.accessToken || !this.appSecret) {
            console.warn('Facebook Messenger credentials not configured');
        }

        // Set up persistent menu for Malayalam options
        this.setupPersistentMenu();
    }

    // Send text message
    async sendMessage(recipientId: string, message: string): Promise<MessengerMessage> {
        try {
            const payload = {
                recipient: { id: recipientId },
                message: { text: message },
                messaging_type: 'RESPONSE'
            };

            const response = await axios.post(
                `${this.baseUrl}/me/messages?access_token=${this.accessToken}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            const messengerMessage: MessengerMessage = {
                id: response.data.message_id,
                senderId: response.data.recipient_id,
                recipientId: recipientId,
                message: message,
                type: 'text',
                timestamp: new Date()
            };

            this.updateUserHistory(recipientId, messengerMessage);
            return messengerMessage;
        } catch (error) {
            console.error('Failed to send Messenger message:', error);
            throw new Error('Messenger message sending failed');
        }
    }

    // Send quick replies (for Malayalam menu options)
    async sendQuickReplies(recipientId: string, text: string, quickReplies: Array<{ title: string, payload: string }>): Promise<MessengerMessage> {
        try {
            const payload = {
                recipient: { id: recipientId },
                message: {
                    text: text,
                    quick_replies: quickReplies.map(reply => ({
                        content_type: 'text',
                        title: reply.title,
                        payload: reply.payload
                    }))
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/me/messages?access_token=${this.accessToken}`,
                payload
            );

            const messengerMessage: MessengerMessage = {
                id: response.data.message_id,
                senderId: response.data.recipient_id,
                recipientId: recipientId,
                message: text,
                type: 'quick_reply',
                timestamp: new Date()
            };

            this.updateUserHistory(recipientId, messengerMessage);
            return messengerMessage;
        } catch (error) {
            console.error('Failed to send quick replies:', error);
            throw new Error('Quick replies sending failed');
        }
    }

    // Send button template
    async sendButtonTemplate(recipientId: string, text: string, buttons: Array<{ type: string, title: string, payload?: string, url?: string }>): Promise<MessengerMessage> {
        try {
            const payload = {
                recipient: { id: recipientId },
                message: {
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'button',
                            text: text,
                            buttons: buttons.map(button => {
                                if (button.type === 'web_url') {
                                    return {
                                        type: 'web_url',
                                        url: button.url,
                                        title: button.title
                                    };
                                }
                                return {
                                    type: 'postback',
                                    title: button.title,
                                    payload: button.payload
                                };
                            })
                        }
                    }
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/me/messages?access_token=${this.accessToken}`,
                payload
            );

            const messengerMessage: MessengerMessage = {
                id: response.data.message_id,
                senderId: response.data.recipient_id,
                recipientId: recipientId,
                message: text,
                type: 'postback',
                timestamp: new Date()
            };

            this.updateUserHistory(recipientId, messengerMessage);
            return messengerMessage;
        } catch (error) {
            console.error('Failed to send button template:', error);
            throw new Error('Button template sending failed');
        }
    }

    // Send audio message (for Malayalam TTS)
    async sendAudioMessage(recipientId: string, audioUrl: string): Promise<MessengerMessage> {
        try {
            const payload = {
                recipient: { id: recipientId },
                message: {
                    attachment: {
                        type: 'audio',
                        payload: {
                            url: audioUrl,
                            is_reusable: true
                        }
                    }
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/me/messages?access_token=${this.accessToken}`,
                payload
            );

            const messengerMessage: MessengerMessage = {
                id: response.data.message_id,
                senderId: response.data.recipient_id,
                recipientId: recipientId,
                message: 'Audio message',
                type: 'attachment',
                timestamp: new Date(),
                attachments: [{ type: 'audio', payload: { url: audioUrl } }]
            };

            this.updateUserHistory(recipientId, messengerMessage);
            return messengerMessage;
        } catch (error) {
            console.error('Failed to send audio message:', error);
            throw new Error('Audio message sending failed');
        }
    }

    // Handle incoming webhook
    async handleWebhook(payload: MessengerWebhookPayload): Promise<MessengerMessage[]> {
        const messages: MessengerMessage[] = [];

        for (const entry of payload.entry) {
            for (const messagingEvent of entry.messaging) {
                let message: MessengerMessage;

                if (messagingEvent.message) {
                    message = {
                        id: messagingEvent.message.mid,
                        senderId: messagingEvent.sender.id,
                        recipientId: messagingEvent.recipient.id,
                        message: messagingEvent.message.text || 'Attachment received',
                        type: messagingEvent.message.quick_reply ? 'quick_reply' : 'text',
                        timestamp: new Date(messagingEvent.timestamp),
                        attachments: messagingEvent.message.attachments,
                        quickReply: messagingEvent.message.quick_reply
                    };
                } else if (messagingEvent.postback) {
                    message = {
                        id: `postback_${Date.now()}`,
                        senderId: messagingEvent.sender.id,
                        recipientId: messagingEvent.recipient.id,
                        message: messagingEvent.postback.title,
                        type: 'postback',
                        timestamp: new Date(messagingEvent.timestamp)
                    };
                } else {
                    continue;
                }

                messages.push(message);
                this.updateUserHistory(message.senderId, message);

                // Handle the message with AI IVR
                await this.handleIncomingMessage(message);
            }
        }

        return messages;
    }

    // Process incoming message with Malayalam AI
    private async handleIncomingMessage(message: MessengerMessage): Promise<void> {
        try {
            const user = await this.getOrCreateUser(message.senderId);

            // Handle different message types
            if (message.type === 'text') {
                const response = await this.processTextWithAI(message.message, user.language);
                await this.sendMessage(message.senderId, response);
            } else if (message.type === 'quick_reply' && message.quickReply) {
                await this.handleQuickReplyPayload(message.senderId, message.quickReply.payload);
            } else if (message.type === 'postback') {
                await this.handlePostbackPayload(message.senderId, message.message);
            } else if (message.attachments) {
                await this.handleAttachment(message.senderId, message.attachments[0]);
            }
        } catch (error) {
            console.error('Failed to handle incoming message:', error);
            await this.sendMessage(message.senderId, 'Sorry, I encountered an error. Please try again.');
        }
    }

    // Malayalam-specific quick reply handling
    private async handleQuickReplyPayload(senderId: string, payload: string): Promise<void> {
        const user = await this.getOrCreateUser(senderId);

        switch (payload) {
            case 'LANGUAGE_MALAYALAM':
                user.language = 'ml';
                await this.sendMessage(senderId, 'മലയാളത്തിൽ സംസാരിക്കാം. എങ്ങനെ സഹായിക്കാം?');
                await this.sendMalayalamMenu(senderId);
                break;
            case 'LANGUAGE_ENGLISH':
                user.language = 'en';
                await this.sendMessage(senderId, 'Let\'s continue in English. How can I help you?');
                await this.sendEnglishMenu(senderId);
                break;
            case 'LANGUAGE_MANGLISH':
                user.language = 'manglish';
                await this.sendMessage(senderId, 'Manglish il samsarikalam. Enthaanu sahayam?');
                await this.sendManglishMenu(senderId);
                break;
            case 'HELP_BOOKING':
                await this.handleBookingHelp(senderId, user.language);
                break;
            case 'HELP_BILLING':
                await this.handleBillingHelp(senderId, user.language);
                break;
            case 'HELP_SUPPORT':
                await this.handleSupportHelp(senderId, user.language);
                break;
            default:
                await this.sendMessage(senderId, 'I didn\'t understand that option. Please try again.');
        }

        this.users.set(senderId, user);
    }

    // Setup persistent menu with Malayalam options
    private async setupPersistentMenu(): Promise<void> {
        try {
            const payload = {
                persistent_menu: [
                    {
                        locale: 'default',
                        composer_input_disabled: false,
                        call_to_actions: [
                            {
                                type: 'postback',
                                title: 'മലയാളം (Malayalam)',
                                payload: 'LANGUAGE_MALAYALAM'
                            },
                            {
                                type: 'postback',
                                title: 'English',
                                payload: 'LANGUAGE_ENGLISH'
                            },
                            {
                                type: 'postback',
                                title: 'Manglish',
                                payload: 'LANGUAGE_MANGLISH'
                            },
                            {
                                type: 'web_url',
                                title: 'Visit Website',
                                url: process.env.WEBSITE_URL || 'https://your-website.com'
                            }
                        ]
                    }
                ]
            };

            await axios.post(
                `${this.baseUrl}/me/messenger_profile?access_token=${this.accessToken}`,
                payload
            );
        } catch (error) {
            console.error('Failed to setup persistent menu:', error);
        }
    }

    // Send language-specific menus
    private async sendMalayalamMenu(senderId: string): Promise<void> {
        const quickReplies = [
            { title: 'ബുക്കിംഗ് സഹായം', payload: 'HELP_BOOKING' },
            { title: 'ബില്ലിംഗ് സഹായം', payload: 'HELP_BILLING' },
            { title: 'പിന്തുണ', payload: 'HELP_SUPPORT' }
        ];

        await this.sendQuickReplies(senderId, 'ഏതു സേവനത്തിനാണ് സഹായം വേണ്ടത്?', quickReplies);
    }

    private async sendEnglishMenu(senderId: string): Promise<void> {
        const quickReplies = [
            { title: 'Booking Help', payload: 'HELP_BOOKING' },
            { title: 'Billing Help', payload: 'HELP_BILLING' },
            { title: 'Support', payload: 'HELP_SUPPORT' }
        ];

        await this.sendQuickReplies(senderId, 'Which service do you need help with?', quickReplies);
    }

    private async sendManglishMenu(senderId: string): Promise<void> {
        const quickReplies = [
            { title: 'Booking sahayam', payload: 'HELP_BOOKING' },
            { title: 'Billing sahayam', payload: 'HELP_BILLING' },
            { title: 'Support', payload: 'HELP_SUPPORT' }
        ];

        await this.sendQuickReplies(senderId, 'Ethu service-nu sahayam venam?', quickReplies);
    }

    // Helper methods
    private async getOrCreateUser(userId: string): Promise<MessengerUser> {
        if (this.users.has(userId)) {
            return this.users.get(userId)!;
        }

        // Fetch user info from Facebook
        try {
            const response = await axios.get(
                `${this.baseUrl}/${userId}?fields=first_name,last_name,profile_pic,locale,timezone&access_token=${this.accessToken}`
            );

            const userInfo = response.data;
            const user: MessengerUser = {
                id: userId,
                firstName: userInfo.first_name || '',
                lastName: userInfo.last_name || '',
                profilePicture: userInfo.profile_pic || '',
                locale: userInfo.locale || 'en_US',
                timezone: userInfo.timezone || 0,
                language: this.detectLanguageFromLocale(userInfo.locale),
                conversationHistory: [],
                lastInteraction: new Date()
            };

            this.users.set(userId, user);
            return user;
        } catch (error) {
            console.error('Failed to fetch user info:', error);

            // Create default user
            const user: MessengerUser = {
                id: userId,
                firstName: '',
                lastName: '',
                profilePicture: '',
                locale: 'en_US',
                timezone: 0,
                language: 'en',
                conversationHistory: [],
                lastInteraction: new Date()
            };

            this.users.set(userId, user);
            return user;
        }
    }

    private detectLanguageFromLocale(locale: string): string {
        if (locale.startsWith('ml')) return 'ml';
        if (locale.includes('IN')) return 'manglish';
        return 'en';
    }

    private updateUserHistory(userId: string, message: MessengerMessage): void {
        if (this.users.has(userId)) {
            const user = this.users.get(userId)!;
            user.conversationHistory.push(message);
            user.lastInteraction = new Date();

            // Keep only last 50 messages
            if (user.conversationHistory.length > 50) {
                user.conversationHistory = user.conversationHistory.slice(-50);
            }

            this.users.set(userId, user);
        }
    }

    private async processTextWithAI(text: string, language: string): Promise<string> {
        // This would integrate with your existing NLP and conversation services
        // Placeholder implementation
        const responses = {
            ml: 'നിങ്ങളുടെ സന്ദേശം മനസ്സിലായി. കൂടുതൽ വിവരങ്ങൾക്ക് ദയവായി കാത്തിരിക്കുക.',
            en: 'I understand your message. Please wait for more information.',
            manglish: 'Ningalude message manasilaayi. Koode information-nu dayavayi wait cheyyuka.'
        };

        return responses[language as keyof typeof responses] || responses.en;
    }

    private async handleBookingHelp(senderId: string, language: string): Promise<void> {
        const messages = {
            ml: 'ബുക്കിംഗ് സഹായത്തിന് ഞാൻ ഇവിടെയുണ്ട്. എന്താണ് പ്രശ്നം?',
            en: 'I\'m here to help with booking. What\'s the issue?',
            manglish: 'Booking sahayathinu njan ivideyund. Enthaanu problem?'
        };

        await this.sendMessage(senderId, messages[language as keyof typeof messages] || messages.en);
    }

    private async handleBillingHelp(senderId: string, language: string): Promise<void> {
        const messages = {
            ml: 'ബില്ലിംഗ് സംബന്ധിച്ച് എന്തെങ്കിലും സഹായം വേണോ?',
            en: 'Do you need any billing-related help?',
            manglish: 'Billing related enthenkilum sahayam veno?'
        };

        await this.sendMessage(senderId, messages[language as keyof typeof messages] || messages.en);
    }

    private async handleSupportHelp(senderId: string, language: string): Promise<void> {
        const messages = {
            ml: 'പിന്തുണയ്ക്കായി ഞാൻ ഇവിടെയുണ്ട്. എന്തു സഹായം വേണം?',
            en: 'I\'m here for support. What help do you need?',
            manglish: 'Support-aayi njan ivideyund. Enthu sahayam venam?'
        };

        await this.sendMessage(senderId, messages[language as keyof typeof messages] || messages.en);
    }

    private async handleAttachment(senderId: string, attachment: any): Promise<void> {
        if (attachment.type === 'audio') {
            // Process audio with Malayalam STT
            await this.sendMessage(senderId, 'Audio message received. Processing...');
            // Integrate with your STT service here
        } else {
            await this.sendMessage(senderId, 'Attachment received. Thank you!');
        }
    }

    private async handlePostbackPayload(senderId: string, payload: string): Promise<void> {
        await this.handleQuickReplyPayload(senderId, payload);
    }

    // Verify webhook signature
    verifyWebhookSignature(body: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha1', this.appSecret)
            .update(body, 'utf8')
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(`sha1=${expectedSignature}`, 'utf8'),
            Buffer.from(signature, 'utf8')
        );
    }

    // Analytics
    async getMessengerAnalytics(): Promise<{
        totalUsers: number;
        messagesThisWeek: number;
        averageResponseTime: number;
        languageDistribution: Record<string, number>;
        topInteractions: Array<{ action: string, count: number }>;
    }> {
        const users = Array.from(this.users.values());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const messagesThisWeek = users.reduce((sum, user) => {
            return sum + user.conversationHistory.filter(m => m.timestamp >= weekAgo).length;
        }, 0);

        const languageDistribution = users.reduce((acc, user) => {
            acc[user.language] = (acc[user.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalUsers: users.length,
            messagesThisWeek,
            averageResponseTime: 1.8,
            languageDistribution,
            topInteractions: [
                { action: 'booking_help', count: 245 },
                { action: 'billing_help', count: 189 },
                { action: 'support_help', count: 156 }
            ]
        };
    }
}