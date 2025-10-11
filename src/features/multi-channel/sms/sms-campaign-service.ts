import axios from 'axios';
import crypto from 'crypto';

export interface SMSMessage {
    id: string;
    to: string;
    from: string;
    message: string;
    language: 'ml' | 'en' | 'manglish';
    status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
    sentAt?: Date;
    deliveredAt?: Date;
    cost: number;
    messageId?: string;
    errorCode?: string;
    errorMessage?: string;
}

export interface SMSTemplate {
    id: string;
    name: string;
    content: string;
    language: 'ml' | 'en' | 'manglish';
    variables: string[];
    category: 'otp' | 'marketing' | 'transactional' | 'appointment' | 'alert' | 'support';
    characterCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SMSCampaign {
    id: string;
    name: string;
    templateId: string;
    recipients: Array<{
        phoneNumber: string;
        name: string;
        customData: Record<string, any>;
        status: 'pending' | 'sent' | 'delivered' | 'failed' | 'expired';
    }>;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
    scheduledAt?: Date;
    sentAt?: Date;
    totalSent: number;
    totalDelivered: number;
    totalFailed: number;
    estimatedCost: number;
    actualCost: number;
    createdAt: Date;
}

export interface SMSProvider {
    name: string;
    apiUrl: string;
    apiKey: string;
    senderId: string;
    costPerSMS: number;
    supportsMalayalam: boolean;
}

export class SMSCampaignService {
    private providers: Map<string, SMSProvider> = new Map();
    private templates: Map<string, SMSTemplate> = new Map();
    private campaigns: Map<string, SMSCampaign> = new Map();
    private sentMessages: Map<string, SMSMessage> = new Map();
    private smsQueue: Array<{
        phoneNumber: string;
        message: string;
        language: 'ml' | 'en' | 'manglish';
        campaignId?: string;
        templateId?: string;
        customData?: Record<string, any>;
    }> = [];

    constructor() {
        this.initializeProviders();
        this.initializeDefaultTemplates();
        this.startSMSProcessor();
    }

    private initializeProviders(): void {
        // Twilio
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.providers.set('twilio', {
                name: 'Twilio',
                apiUrl: 'https://api.twilio.com/2010-04-01',
                apiKey: process.env.TWILIO_AUTH_TOKEN,
                senderId: process.env.TWILIO_PHONE_NUMBER || '',
                costPerSMS: 0.05, // USD per SMS
                supportsMalayalam: true
            });
        }

        // Exotel (Indian provider - good for Malayalam)
        if (process.env.EXOTEL_API_KEY && process.env.EXOTEL_API_TOKEN) {
            this.providers.set('exotel', {
                name: 'Exotel',
                apiUrl: `https://${process.env.EXOTEL_API_KEY}:${process.env.EXOTEL_API_TOKEN}@api.exotel.com/v1/Accounts/${process.env.EXOTEL_SID}`,
                apiKey: process.env.EXOTEL_API_TOKEN,
                senderId: process.env.EXOTEL_SENDER_ID || 'AIIVR',
                costPerSMS: 0.02, // USD per SMS (cheaper in India)
                supportsMalayalam: true
            });
        }

        // TextLocal (UK/India provider)
        if (process.env.TEXTLOCAL_API_KEY) {
            this.providers.set('textlocal', {
                name: 'TextLocal',
                apiUrl: 'https://api.textlocal.in/send',
                apiKey: process.env.TEXTLOCAL_API_KEY,
                senderId: process.env.TEXTLOCAL_SENDER || 'AIIVR',
                costPerSMS: 0.03,
                supportsMalayalam: true
            });
        }

        // AWS SNS
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            this.providers.set('aws-sns', {
                name: 'AWS SNS',
                apiUrl: `https://sns.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com`,
                apiKey: process.env.AWS_SECRET_ACCESS_KEY,
                senderId: 'AIIVR',
                costPerSMS: 0.05,
                supportsMalayalam: true
            });
        }

        // MSG91 (Indian provider - excellent for Malayalam)
        if (process.env.MSG91_API_KEY) {
            this.providers.set('msg91', {
                name: 'MSG91',
                apiUrl: 'https://api.msg91.com/api/v5/flow',
                apiKey: process.env.MSG91_API_KEY,
                senderId: process.env.MSG91_SENDER_ID || 'AIIVR',
                costPerSMS: 0.015, // Very cheap for Indian numbers
                supportsMalayalam: true
            });
        }
    }

    // Send single SMS
    async sendSMS(
        phoneNumber: string,
        message: string,
        language: 'ml' | 'en' | 'manglish' = 'en',
        providerId?: string
    ): Promise<SMSMessage> {
        const provider = this.selectProvider(providerId, language);
        const smsId = this.generateId();

        const smsMessage: SMSMessage = {
            id: smsId,
            to: phoneNumber,
            from: provider.senderId,
            message,
            language,
            status: 'pending',
            cost: provider.costPerSMS
        };

        try {
            const result = await this.sendViProvider(provider, phoneNumber, message);

            smsMessage.status = 'sent';
            smsMessage.sentAt = new Date();
            smsMessage.messageId = result.messageId;

            this.sentMessages.set(smsId, smsMessage);

            return smsMessage;
        } catch (error) {
            console.error('Failed to send SMS:', error);
            smsMessage.status = 'failed';
            smsMessage.errorMessage = (error as Error).message;
            this.sentMessages.set(smsId, smsMessage);
            throw error;
        }
    }

    // Send templated SMS
    async sendTemplatedSMS(
        phoneNumber: string,
        templateId: string,
        customData: Record<string, any> = {},
        language: 'ml' | 'en' | 'manglish' = 'en'
    ): Promise<SMSMessage> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error('SMS template not found');
        }

        const personalizedMessage = this.replaceVariables(template.content, customData);
        return await this.sendSMS(phoneNumber, personalizedMessage, language);
    }

    // Send OTP SMS (special handling)
    async sendOTP(
        phoneNumber: string,
        otp: string,
        language: 'ml' | 'en' | 'manglish' = 'en'
    ): Promise<SMSMessage> {
        const otpTemplates = {
            ml: `നിങ്ങളുടെ OTP: ${otp}. ഇത് 5 മിനിറ്റിനുള്ളിൽ കാലഹരണപ്പെടും. ആരോടും പങ്കിടരുത്. - AI IVR`,
            en: `Your OTP is: ${otp}. This will expire in 5 minutes. Do not share with anyone. - AI IVR`,
            manglish: `Ningalude OTP: ${otp}. Ithu 5 minute-il expire aakum. Aarodum share cheyyaruth. - AI IVR`
        };

        return await this.sendSMS(phoneNumber, otpTemplates[language], language);
    }

    // Create SMS campaign
    async createSMSCampaign(
        name: string,
        templateId: string,
        recipients: Array<{
            phoneNumber: string;
            name: string;
            customData: Record<string, any>;
        }>,
        scheduledAt?: Date
    ): Promise<SMSCampaign> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error('SMS template not found');
        }

        const provider = this.selectProvider(undefined, template.language);
        const estimatedCost = recipients.length * provider.costPerSMS;

        const campaign: SMSCampaign = {
            id: this.generateId(),
            name,
            templateId,
            recipients: recipients.map(r => ({ ...r, status: 'pending' })),
            status: scheduledAt ? 'scheduled' : 'draft',
            scheduledAt,
            totalSent: 0,
            totalDelivered: 0,
            totalFailed: 0,
            estimatedCost,
            actualCost: 0,
            createdAt: new Date()
        };

        this.campaigns.set(campaign.id, campaign);

        if (!scheduledAt) {
            await this.processSMSCampaign(campaign.id);
        }

        return campaign;
    }

    // Process SMS campaign
    async processSMSCampaign(campaignId: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) {
            throw new Error('SMS campaign not found');
        }

        const template = this.templates.get(campaign.templateId);
        if (!template) {
            throw new Error('SMS template not found');
        }

        campaign.status = 'sending';
        this.campaigns.set(campaignId, campaign);

        // Add SMS messages to queue
        for (const recipient of campaign.recipients.filter(r => r.status === 'pending')) {
            const personalizedMessage = this.replaceVariables(template.content, {
                ...recipient.customData,
                recipientName: recipient.name,
                phoneNumber: recipient.phoneNumber
            });

            this.smsQueue.push({
                phoneNumber: recipient.phoneNumber,
                message: personalizedMessage,
                language: template.language,
                campaignId,
                templateId: template.id,
                customData: recipient.customData
            });
        }
    }

    // SMS queue processor
    private startSMSProcessor(): void {
        setInterval(async () => {
            if (this.smsQueue.length === 0) return;

            const batch = this.smsQueue.splice(0, 5); // Process 5 SMS at a time to avoid rate limits

            for (const item of batch) {
                try {
                    await this.processQueuedSMS(item);
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Rate limiting - 2 seconds between SMS
                } catch (error) {
                    console.error('Failed to process queued SMS:', error);
                }
            }
        }, 10000); // Process every 10 seconds
    }

    private async processQueuedSMS(item: {
        phoneNumber: string;
        message: string;
        language: 'ml' | 'en' | 'manglish';
        campaignId?: string;
        templateId?: string;
        customData?: Record<string, any>;
    }): Promise<void> {
        try {
            const smsResult = await this.sendSMS(item.phoneNumber, item.message, item.language);

            // Update campaign statistics
            if (item.campaignId) {
                const campaign = this.campaigns.get(item.campaignId);
                if (campaign) {
                    const recipient = campaign.recipients.find(r => r.phoneNumber === item.phoneNumber);
                    if (recipient) {
                        recipient.status = smsResult.status;
                        campaign.totalSent++;
                        campaign.actualCost += smsResult.cost;

                        if (smsResult.status === 'sent') {
                            campaign.totalDelivered++;
                        } else if (smsResult.status === 'failed') {
                            campaign.totalFailed++;
                        }

                        this.campaigns.set(item.campaignId, campaign);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send queued SMS:', error);

            // Update campaign with failure
            if (item.campaignId) {
                const campaign = this.campaigns.get(item.campaignId);
                if (campaign) {
                    const recipient = campaign.recipients.find(r => r.phoneNumber === item.phoneNumber);
                    if (recipient) {
                        recipient.status = 'failed';
                        campaign.totalFailed++;
                        this.campaigns.set(item.campaignId, campaign);
                    }
                }
            }
        }
    }

    // Provider-specific sending methods
    private async sendViProvider(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        switch (provider.name) {
            case 'Twilio':
                return await this.sendViaTwilio(provider, phoneNumber, message);
            case 'Exotel':
                return await this.sendViaExotel(provider, phoneNumber, message);
            case 'TextLocal':
                return await this.sendViaTextLocal(provider, phoneNumber, message);
            case 'MSG91':
                return await this.sendViaMsg91(provider, phoneNumber, message);
            case 'AWS SNS':
                return await this.sendViaAWSSNS(provider, phoneNumber, message);
            default:
                throw new Error(`Unsupported SMS provider: ${provider.name}`);
        }
    }

    private async sendViaTwilio(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${provider.apiKey}`).toString('base64');

        const response = await axios.post(
            `${provider.apiUrl}/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
            new URLSearchParams({
                From: provider.senderId,
                To: phoneNumber,
                Body: message
            }),
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return { messageId: response.data.sid };
    }

    private async sendViaExotel(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        const response = await axios.post(
            `${provider.apiUrl}/Sms/send.json`,
            new URLSearchParams({
                From: provider.senderId,
                To: phoneNumber,
                Body: message
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return { messageId: response.data.SMSMessage.Sid };
    }

    private async sendViaTextLocal(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        const response = await axios.post(
            provider.apiUrl,
            new URLSearchParams({
                apikey: provider.apiKey,
                numbers: phoneNumber,
                message: message,
                sender: provider.senderId
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        return { messageId: response.data.messages[0].id };
    }

    private async sendViaMsg91(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        const response = await axios.post(
            provider.apiUrl,
            {
                template_id: process.env.MSG91_TEMPLATE_ID,
                sender: provider.senderId,
                short_url: 0,
                mobiles: phoneNumber,
                var1: message
            },
            {
                headers: {
                    'authkey': provider.apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        return { messageId: response.data.request_id };
    }

    private async sendViaAWSSNS(provider: SMSProvider, phoneNumber: string, message: string): Promise<{ messageId: string }> {
        // AWS SNS implementation would go here
        // This is a simplified version
        throw new Error('AWS SNS implementation needed');
    }

    // Create SMS template
    createSMSTemplate(
        name: string,
        content: string,
        language: 'ml' | 'en' | 'manglish',
        category: SMSTemplate['category'],
        variables: string[] = []
    ): SMSTemplate {
        const template: SMSTemplate = {
            id: this.generateId(),
            name,
            content,
            language,
            variables,
            category,
            characterCount: content.length,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.templates.set(template.id, template);
        return template;
    }

    // Initialize default templates
    private initializeDefaultTemplates(): void {
        // Malayalam appointment reminder
        this.createSMSTemplate(
            'Malayalam Appointment Reminder',
            'നമസ്കാരം {{name}}! നാളെ {{time}}-ന് നിങ്ങളുടെ അപ്പോയിന്റ്മെന്റ് ഉണ്ട്. സമയത്ത് വരണം. വിശദാംശങ്ങൾ: {{details}} - AI IVR',
            'ml',
            'appointment',
            ['name', 'time', 'details']
        );

        // English booking confirmation
        this.createSMSTemplate(
            'Booking Confirmation',
            'Hi {{name}}! Your booking is confirmed for {{date}} at {{time}}. Reference: {{bookingId}}. Need help? Call {{supportPhone}} - AI IVR',
            'en',
            'transactional',
            ['name', 'date', 'time', 'bookingId', 'supportPhone']
        );

        // Manglish billing reminder
        this.createSMSTemplate(
            'Billing Reminder Manglish',
            'Hello {{name}}, ningalude bill amount ₹{{amount}} aanu. Due date: {{dueDate}}. Payment link: {{paymentLink}} - AI IVR',
            'manglish',
            'transactional',
            ['name', 'amount', 'dueDate', 'paymentLink']
        );

        // Malayalam marketing message
        this.createSMSTemplate(
            'Malayalam Marketing',
            '🎉 വിശേഷ ഓഫർ! AI IVR സേവനത്തിൽ 50% വിട്. ഇന്നു തന്നെ രജിസ്റ്റർ ചെയ്യുക: {{registerLink}} കൂടുതൽ വിവരങ്ങൾ: {{phone}} - AI IVR',
            'ml',
            'marketing',
            ['registerLink', 'phone']
        );

        // OTP templates for different languages
        this.createSMSTemplate(
            'OTP Malayalam',
            'നിങ്ങളുടെ OTP: {{otp}}. ഇത് {{validity}} മിനിറ്റിനുള്ളിൽ കാലഹരണപ്പെടും. ആരോടും പങ്കിടരുത്. - AI IVR',
            'ml',
            'otp',
            ['otp', 'validity']
        );

        this.createSMSTemplate(
            'OTP English',
            'Your OTP is: {{otp}}. This will expire in {{validity}} minutes. Do not share with anyone. - AI IVR',
            'en',
            'otp',
            ['otp', 'validity']
        );
    }

    // Helper methods
    private selectProvider(providerId?: string, language?: 'ml' | 'en' | 'manglish'): SMSProvider {
        if (providerId && this.providers.has(providerId)) {
            return this.providers.get(providerId)!;
        }

        // For Malayalam, prefer Indian providers
        if (language === 'ml' || language === 'manglish') {
            const indianProviders = ['msg91', 'exotel', 'textlocal'];
            for (const providerName of indianProviders) {
                if (this.providers.has(providerName)) {
                    return this.providers.get(providerName)!;
                }
            }
        }

        // Fallback to first available provider
        const providers = Array.from(this.providers.values());
        if (providers.length === 0) {
            throw new Error('No SMS providers configured');
        }

        return providers[0];
    }

    private replaceVariables(content: string, data: Record<string, any>): string {
        let result = content;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, String(value));
        }
        return result;
    }

    private generateId(): string {
        return 'sms_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API methods
    async getTemplates(language?: string, category?: string): Promise<SMSTemplate[]> {
        let templates = Array.from(this.templates.values());

        if (language) {
            templates = templates.filter(t => t.language === language);
        }

        if (category) {
            templates = templates.filter(t => t.category === category);
        }

        return templates;
    }

    async getCampaigns(): Promise<SMSCampaign[]> {
        return Array.from(this.campaigns.values());
    }

    async getCampaign(campaignId: string): Promise<SMSCampaign | undefined> {
        return this.campaigns.get(campaignId);
    }

    async pauseCampaign(campaignId: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (campaign) {
            campaign.status = 'paused';
            this.campaigns.set(campaignId, campaign);
        }
    }

    async resumeCampaign(campaignId: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (campaign && campaign.status === 'paused') {
            campaign.status = 'sending';
            this.campaigns.set(campaignId, campaign);
        }
    }

    // Analytics and reporting
    async getSMSAnalytics(): Promise<{
        totalSent: number;
        deliveryRate: number;
        totalCost: number;
        messagesThisMonth: number;
        languageDistribution: Record<string, number>;
        providerPerformance: Array<{
            provider: string;
            sent: number;
            deliveryRate: number;
            cost: number;
        }>;
        campaignPerformance: Array<{
            campaignId: string;
            name: string;
            sent: number;
            delivered: number;
            cost: number;
        }>;
    }> {
        const campaigns = Array.from(this.campaigns.values());
        const messages = Array.from(this.sentMessages.values());

        const totalSent = messages.length;
        const totalDelivered = messages.filter(m => m.status === 'delivered' || m.status === 'sent').length;
        const deliveryRate = totalSent > 0 ? totalDelivered / totalSent : 0;
        const totalCost = messages.reduce((sum, m) => sum + m.cost, 0);

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const messagesThisMonth = messages.filter(m => m.sentAt && m.sentAt >= thisMonth).length;

        const languageDistribution = messages.reduce((acc, message) => {
            acc[message.language] = (acc[message.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const campaignPerformance = campaigns.map(campaign => ({
            campaignId: campaign.id,
            name: campaign.name,
            sent: campaign.totalSent,
            delivered: campaign.totalDelivered,
            cost: campaign.actualCost
        }));

        return {
            totalSent,
            deliveryRate,
            totalCost,
            messagesThisMonth,
            languageDistribution,
            providerPerformance: [], // Would be calculated based on provider usage
            campaignPerformance
        };
    }

    // Bulk SMS operations
    async sendBulkSMS(
        recipients: Array<{ phoneNumber: string; message: string; language?: 'ml' | 'en' | 'manglish' }>,
        providerId?: string
    ): Promise<SMSMessage[]> {
        const results: SMSMessage[] = [];

        for (const recipient of recipients) {
            try {
                const result = await this.sendSMS(
                    recipient.phoneNumber,
                    recipient.message,
                    recipient.language || 'en',
                    providerId
                );
                results.push(result);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Failed to send SMS to ${recipient.phoneNumber}:`, error);
            }
        }

        return results;
    }

    // Check delivery status
    async checkDeliveryStatus(messageId: string): Promise<SMSMessage | undefined> {
        return this.sentMessages.get(messageId);
    }

    // Get provider status
    getAvailableProviders(): Array<{ name: string; supportsMalayalam: boolean; costPerSMS: number }> {
        return Array.from(this.providers.values()).map(provider => ({
            name: provider.name,
            supportsMalayalam: provider.supportsMalayalam,
            costPerSMS: provider.costPerSMS
        }));
    }
}