import axios from 'axios';
import crypto from 'crypto';

export interface WhatsAppMessage {
    id: string;
    from: string;
    to: string;
    message: string;
    type: 'text' | 'audio' | 'image' | 'document';
    timestamp: Date;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    mediaUrl?: string;
    replyToId?: string;
}

export interface WhatsAppContact {
    phoneNumber: string;
    name?: string;
    profilePicture?: string;
    language: string;
    lastInteraction: Date;
    conversationHistory: WhatsAppMessage[];
}

export interface WhatsAppWebhookPayload {
    entry: Array<{
        id: string;
        changes: Array<{
            value: {
                messaging_product: string;
                metadata: {
                    display_phone_number: string;
                    phone_number_id: string;
                };
                contacts?: Array<{
                    profile: { name: string };
                    wa_id: string;
                }>;
                messages?: Array<{
                    id: string;
                    from: string;
                    timestamp: string;
                    type: string;
                    text?: { body: string };
                    audio?: { id: string; mime_type: string };
                    image?: { id: string; mime_type: string; caption?: string };
                    document?: { id: string; filename: string; mime_type: string };
                }>;
            };
        }>;
    }>;
}

export class WhatsAppService {
    private accessToken: string;
    private phoneNumberId: string;
    private webhookVerifyToken: string;
    private apiVersion: string = 'v18.0';
    private baseUrl: string;
    private contacts: Map<string, WhatsAppContact> = new Map();

    constructor() {
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || '';
        this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
        this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';
        this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;

        if (!this.accessToken || !this.phoneNumberId) {
            console.warn('WhatsApp credentials not configured');
        }
    }

    // Send text message
    async sendMessage(to: string, message: string, replyToId?: string): Promise<WhatsAppMessage> {
        try {
            const payload: any = {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: message }
            };

            if (replyToId) {
                payload.context = { message_id: replyToId };
            }

            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const whatsappMessage: WhatsAppMessage = {
                id: response.data.messages[0].id,
                from: this.phoneNumberId,
                to: to,
                message: message,
                type: 'text',
                timestamp: new Date(),
                status: 'sent',
                replyToId: replyToId
            };

            // Update contact history
            this.updateContactHistory(to, whatsappMessage);

            return whatsappMessage;
        } catch (error) {
            console.error('Failed to send WhatsApp message:', error);
            throw new Error('WhatsApp message sending failed');
        }
    }

    // Send audio message
    async sendAudioMessage(to: string, audioUrl: string, caption?: string): Promise<WhatsAppMessage> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "audio",
                audio: {
                    link: audioUrl,
                    caption: caption
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const whatsappMessage: WhatsAppMessage = {
                id: response.data.messages[0].id,
                from: this.phoneNumberId,
                to: to,
                message: caption || 'Audio message',
                type: 'audio',
                timestamp: new Date(),
                status: 'sent',
                mediaUrl: audioUrl
            };

            this.updateContactHistory(to, whatsappMessage);
            return whatsappMessage;
        } catch (error) {
            console.error('Failed to send WhatsApp audio:', error);
            throw new Error('WhatsApp audio sending failed');
        }
    }

    // Send interactive template (for Malayalam IVR menu)
    async sendInteractiveMenu(to: string, headerText: string, bodyText: string, options: Array<{ id: string, title: string }>): Promise<WhatsAppMessage> {
        try {
            const payload = {
                messaging_product: "whatsapp",
                to: to,
                type: "interactive",
                interactive: {
                    type: "list",
                    header: {
                        type: "text",
                        text: headerText
                    },
                    body: {
                        text: bodyText
                    },
                    action: {
                        button: "Select Option",
                        sections: [{
                            title: "Options",
                            rows: options.map(option => ({
                                id: option.id,
                                title: option.title
                            }))
                        }]
                    }
                }
            };

            const response = await axios.post(
                `${this.baseUrl}/${this.phoneNumberId}/messages`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const whatsappMessage: WhatsAppMessage = {
                id: response.data.messages[0].id,
                from: this.phoneNumberId,
                to: to,
                message: `Menu: ${bodyText}`,
                type: 'text',
                timestamp: new Date(),
                status: 'sent'
            };

            this.updateContactHistory(to, whatsappMessage);
            return whatsappMessage;
        } catch (error) {
            console.error('Failed to send WhatsApp interactive menu:', error);
            throw new Error('WhatsApp interactive menu sending failed');
        }
    }

    // Handle incoming webhook
    async handleWebhook(payload: WhatsAppWebhookPayload): Promise<WhatsAppMessage[]> {
        const messages: WhatsAppMessage[] = [];

        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.value.messages) {
                    for (const incomingMessage of change.value.messages) {
                        const message: WhatsAppMessage = {
                            id: incomingMessage.id,
                            from: incomingMessage.from,
                            to: change.value.metadata.phone_number_id,
                            message: this.extractMessageContent(incomingMessage),
                            type: incomingMessage.type as any,
                            timestamp: new Date(parseInt(incomingMessage.timestamp) * 1000),
                            status: 'delivered'
                        };

                        if (incomingMessage.audio?.id) {
                            message.mediaUrl = await this.getMediaUrl(incomingMessage.audio.id);
                        }

                        messages.push(message);
                        this.updateContactHistory(incomingMessage.from, message);

                        // Auto-respond with AI IVR
                        await this.handleAutoResponse(incomingMessage.from, message);
                    }
                }
            }
        }

        return messages;
    }

    // Process incoming message for AI IVR
    private async handleAutoResponse(from: string, message: WhatsAppMessage): Promise<void> {
        try {
            // Get or create contact
            const contact = this.getOrCreateContact(from);

            // Process with NLP if it's text
            if (message.type === 'text') {
                const response = await this.processTextWithAI(message.message, contact.language);
                await this.sendMessage(from, response);
            }

            // Process audio with speech-to-text
            if (message.type === 'audio' && message.mediaUrl) {
                const transcript = await this.processAudioWithSTT(message.mediaUrl, contact.language);
                const response = await this.processTextWithAI(transcript, contact.language);
                await this.sendMessage(from, response);
            }
        } catch (error) {
            console.error('Auto-response failed:', error);
            await this.sendMessage(from, 'Sorry, I encountered an error. Please try again.');
        }
    }

    // Malayalam-specific AI processing
    private async processTextWithAI(text: string, language: string): Promise<string> {
        try {
            // This would integrate with your existing NLP service
            const isManglish = this.detectManglish(text);

            if (isManglish) {
                // Convert Manglish to Malayalam first
                const malayalamText = await this.convertManglishToMalayalam(text);
                return await this.generateMalayalamResponse(malayalamText);
            }

            if (language === 'ml' || this.containsMalayalamText(text)) {
                return await this.generateMalayalamResponse(text);
            }

            return await this.generateEnglishResponse(text);
        } catch (error) {
            console.error('AI processing failed:', error);
            return 'I apologize, but I encountered an issue processing your message. Please try again.';
        }
    }

    // Helper methods
    private extractMessageContent(message: any): string {
        if (message.text) return message.text.body;
        if (message.audio) return 'Audio message';
        if (message.image) return message.image.caption || 'Image message';
        if (message.document) return `Document: ${message.document.filename}`;
        return 'Unsupported message type';
    }

    private async getMediaUrl(mediaId: string): Promise<string> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/${mediaId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`
                    }
                }
            );
            return response.data.url;
        } catch (error) {
            console.error('Failed to get media URL:', error);
            return '';
        }
    }

    private updateContactHistory(phoneNumber: string, message: WhatsAppMessage): void {
        const contact = this.getOrCreateContact(phoneNumber);
        contact.conversationHistory.push(message);
        contact.lastInteraction = new Date();

        // Keep only last 50 messages
        if (contact.conversationHistory.length > 50) {
            contact.conversationHistory = contact.conversationHistory.slice(-50);
        }

        this.contacts.set(phoneNumber, contact);
    }

    private getOrCreateContact(phoneNumber: string): WhatsAppContact {
        if (this.contacts.has(phoneNumber)) {
            return this.contacts.get(phoneNumber)!;
        }

        const contact: WhatsAppContact = {
            phoneNumber,
            language: 'ml', // Default to Malayalam
            lastInteraction: new Date(),
            conversationHistory: []
        };

        this.contacts.set(phoneNumber, contact);
        return contact;
    }

    private detectManglish(text: string): boolean {
        const manglishWords = ['namaskaram', 'athe', 'alla', 'sari', 'sahayam', 'vendam'];
        return manglishWords.some(word => text.toLowerCase().includes(word));
    }

    private containsMalayalamText(text: string): boolean {
        // Check for Malayalam Unicode range
        return /[\u0D00-\u0D7F]/.test(text);
    }

    private async convertManglishToMalayalam(text: string): Promise<string> {
        // This would integrate with your ManglishService
        return text; // Placeholder
    }

    private async generateMalayalamResponse(text: string): Promise<string> {
        // This would integrate with your Malayalam conversation manager
        return 'നമസ്കാരം! എങ്ങനെ സഹായിക്കാം?'; // Placeholder
    }

    private async generateEnglishResponse(text: string): Promise<string> {
        // This would integrate with your English conversation manager
        return 'Hello! How can I help you today?'; // Placeholder
    }

    private async processAudioWithSTT(audioUrl: string, language: string): Promise<string> {
        // This would integrate with your speech-to-text service
        return 'Audio processed'; // Placeholder
    }

    // Verify webhook signature
    verifyWebhookSignature(body: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.WHATSAPP_APP_SECRET || '')
            .update(body, 'utf8')
            .digest('hex');

        return crypto.timingSafeEqual(
            Buffer.from(`sha256=${expectedSignature}`, 'utf8'),
            Buffer.from(signature, 'utf8')
        );
    }

    // Analytics
    async getWhatsAppAnalytics(): Promise<{
        totalContacts: number;
        messagesThisWeek: number;
        averageResponseTime: number;
        languageDistribution: Record<string, number>;
    }> {
        const contacts = Array.from(this.contacts.values());
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const messagesThisWeek = contacts.reduce((sum, contact) => {
            return sum + contact.conversationHistory.filter(m => m.timestamp >= weekAgo).length;
        }, 0);

        const languageDistribution = contacts.reduce((acc, contact) => {
            acc[contact.language] = (acc[contact.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            totalContacts: contacts.length,
            messagesThisWeek,
            averageResponseTime: 2.5, // seconds
            languageDistribution
        };
    }
}