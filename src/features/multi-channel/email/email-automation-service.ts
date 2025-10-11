import nodemailer, { Transporter } from 'nodemailer';
// Remove invalid import - will use any type instead

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    language: 'ml' | 'en' | 'manglish';
    variables: string[];
    category: 'welcome' | 'appointment' | 'billing' | 'support' | 'marketing' | 'system';
    createdAt: Date;
    updatedAt: Date;
}

export interface EmailCampaign {
    id: string;
    name: string;
    templateId: string;
    recipients: EmailRecipient[];
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
    scheduledAt?: Date;
    sentAt?: Date;
    totalSent: number;
    totalOpened: number;
    totalClicked: number;
    createdAt: Date;
}

export interface EmailRecipient {
    email: string;
    name: string;
    language: 'ml' | 'en' | 'manglish';
    customData: Record<string, any>;
    status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
    sentAt?: Date;
}

export interface EmailAnalytics {
    totalEmails: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    languageDistribution: Record<string, number>;
    campaignPerformance: Array<{
        campaignId: string;
        name: string;
        sent: number;
        opened: number;
        clicked: number;
    }>;
}

export class EmailAutomationService {
    private transporter!: Transporter;
    private templates: Map<string, EmailTemplate> = new Map();
    private campaigns: Map<string, EmailCampaign> = new Map();
    private emailQueue: Array<{
        recipient: EmailRecipient;
        template: EmailTemplate;
        campaignId: string;
        customData: Record<string, any>;
    }> = [];

    constructor() {
        this.setupTransporter();
        this.initializeDefaultTemplates();
        this.startEmailProcessor();
    }

    private setupTransporter(): void {
        // Support multiple email providers
        const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';

        switch (emailProvider) {
            case 'smtp':
                this.transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST || 'localhost',
                    port: parseInt(process.env.SMTP_PORT || '587'),
                    secure: process.env.SMTP_SECURE === 'true',
                    auth: {
                        user: process.env.SMTP_USER || '',
                        pass: process.env.SMTP_PASS || ''
                    }
                });
                break;

            case 'gmail':
                this.transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER || '',
                        pass: process.env.GMAIL_APP_PASSWORD || ''
                    }
                });
                break;

            case 'sendgrid':
                this.transporter = nodemailer.createTransport({
                    host: 'smtp.sendgrid.net',
                    port: 587,
                    secure: false,
                    auth: {
                        user: 'apikey',
                        pass: process.env.SENDGRID_API_KEY || ''
                    }
                });
                break;

            case 'ses':
                this.transporter = nodemailer.createTransport({
                    host: 'email-smtp.us-east-1.amazonaws.com',
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.AWS_SES_ACCESS_KEY || '',
                        pass: process.env.AWS_SES_SECRET_KEY || ''
                    }
                });
                break;

            default:
                console.warn('Unknown email provider, falling back to SMTP');
                this.setupTransporter();
        }
    }

    // Send individual email
    async sendEmail(
        to: string,
        subject: string,
        htmlContent: string,
        textContent?: string,
        attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string }>
    ): Promise<string> {
        try {
            const mailOptions = {
                from: process.env.FROM_EMAIL || 'noreply@aiivr.com',
                to: to,
                subject: subject,
                html: htmlContent,
                text: textContent || this.htmlToText(htmlContent),
                attachments: attachments
            };

            const result: any = await this.transporter.sendMail(mailOptions);
            return result.messageId || '';
        } catch (error) {
            console.error('Failed to send email:', error);
            throw new Error('Email sending failed');
        }
    }

    // Send templated email
    async sendTemplatedEmail(
        to: string,
        templateId: string,
        customData: Record<string, any> = {},
        language: 'ml' | 'en' | 'manglish' = 'en'
    ): Promise<string> {
        const template = this.templates.get(templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        // Replace variables in template
        const personalizedSubject = this.replaceVariables(template.subject, customData);
        const personalizedHtml = this.replaceVariables(template.htmlContent, customData);
        const personalizedText = this.replaceVariables(template.textContent, customData);

        return await this.sendEmail(to, personalizedSubject, personalizedHtml, personalizedText);
    }

    // Create email campaign
    async createCampaign(
        name: string,
        templateId: string,
        recipients: EmailRecipient[],
        scheduledAt?: Date
    ): Promise<EmailCampaign> {
        const campaign: EmailCampaign = {
            id: this.generateId(),
            name,
            templateId,
            recipients: recipients.map(r => ({ ...r, status: 'pending' })),
            status: scheduledAt ? 'scheduled' : 'draft',
            scheduledAt,
            totalSent: 0,
            totalOpened: 0,
            totalClicked: 0,
            createdAt: new Date()
        };

        this.campaigns.set(campaign.id, campaign);

        if (!scheduledAt) {
            // Start sending immediately
            await this.processCampaign(campaign.id);
        }

        return campaign;
    }

    // Process email campaign
    async processCampaign(campaignId: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (!campaign) {
            throw new Error('Campaign not found');
        }

        const template = this.templates.get(campaign.templateId);
        if (!template) {
            throw new Error('Template not found');
        }

        campaign.status = 'sending';
        this.campaigns.set(campaignId, campaign);

        // Add emails to queue for processing
        for (const recipient of campaign.recipients.filter(r => r.status === 'pending')) {
            this.emailQueue.push({
                recipient,
                template,
                campaignId,
                customData: recipient.customData
            });
        }
    }

    // Email queue processor
    private startEmailProcessor(): void {
        setInterval(async () => {
            if (this.emailQueue.length === 0) return;

            const batch = this.emailQueue.splice(0, 10); // Process 10 emails at a time

            for (const item of batch) {
                try {
                    await this.processQueuedEmail(item);
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting
                } catch (error) {
                    console.error('Failed to process queued email:', error);
                    item.recipient.status = 'failed';
                }
            }
        }, 5000); // Process every 5 seconds
    }

    private async processQueuedEmail(item: {
        recipient: EmailRecipient;
        template: EmailTemplate;
        campaignId: string;
        customData: Record<string, any>;
    }): Promise<void> {
        try {
            // Get language-specific template version
            const localizedTemplate = await this.getLocalizedTemplate(item.template, item.recipient.language);

            // Personalize content
            const customData = {
                ...item.customData,
                recipientName: item.recipient.name,
                recipientEmail: item.recipient.email
            };

            const subject = this.replaceVariables(localizedTemplate.subject, customData);
            const htmlContent = this.replaceVariables(localizedTemplate.htmlContent, customData);
            const textContent = this.replaceVariables(localizedTemplate.textContent, customData);

            // Add tracking pixels and links
            const trackedHtml = this.addTrackingToContent(htmlContent, item.campaignId, item.recipient.email);

            await this.sendEmail(item.recipient.email, subject, trackedHtml, textContent);

            item.recipient.status = 'sent';
            item.recipient.sentAt = new Date();

            // Update campaign statistics
            const campaign = this.campaigns.get(item.campaignId);
            if (campaign) {
                campaign.totalSent++;
                this.campaigns.set(item.campaignId, campaign);
            }

        } catch (error) {
            console.error('Failed to send campaign email:', error);
            item.recipient.status = 'failed';
        }
    }

    // Create email template
    createTemplate(
        name: string,
        subject: string,
        htmlContent: string,
        textContent: string,
        language: 'ml' | 'en' | 'manglish',
        category: EmailTemplate['category'],
        variables: string[] = []
    ): EmailTemplate {
        const template: EmailTemplate = {
            id: this.generateId(),
            name,
            subject,
            htmlContent,
            textContent,
            language,
            variables,
            category,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.templates.set(template.id, template);
        return template;
    }

    // Initialize default Malayalam templates
    private initializeDefaultTemplates(): void {
        // Malayalam Welcome Template
        this.createTemplate(
            'Malayalam Welcome',
            'സ്വാഗതം {{recipientName}} - AI IVR പ്ലാറ്റ്ഫോമിലേക്ക്!',
            `
      <html>
        <body style="font-family: 'Noto Sans Malayalam', Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50; text-align: center;">സ്വാഗതം {{recipientName}}!</h1>
            
            <p>നമസ്കാരം {{recipientName}},</p>
            
            <p>AI IVR Malayalam Platform-ൽ സ്വാഗതം! നിങ്ങളുടെ ബിസിനസ്സിനെ മലയാളത്തിൽ ഡിജിറ്റലായി മാറ്റാൻ ഞങ്ങൾ ഇവിടെയുണ്ട്.</p>
            
            <h3>ഞങ്ങളുടെ സേവനങ്ങൾ:</h3>
            <ul>
              <li>മലയാളം വോയ്‌സ് AI ഏജന്റുകൾ</li>
              <li>മംഗ്ലീഷ് പിന്തുണ</li>
              <li>പ്രാദേശിക ഭാഷകളിലുള്ള IVR സിസ്റ്റം</li>
              <li>24/7 കസ്റ്റമർ സപ്പോർട്ട്</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboardUrl}}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">ഡാഷ്ബോർഡ് കാണുക</a>
            </div>
            
            <p>എന്തെങ്കിലും സഹായം വേണമെങ്കിൽ ഞങ്ങളെ സമീപിക്കുക.</p>
            
            <p>നന്ദി,<br>AI IVR Team</p>
          </div>
        </body>
      </html>
      `,
            `
      സ്വാഗതം {{recipientName}}!
      
      നമസ്കാരം {{recipientName}},
      
      AI IVR Malayalam Platform-ൽ സ്വാഗതം! നിങ്ങളുടെ ബിസിനസ്സിനെ മലയാളത്തിൽ ഡിജിറ്റലായി മാറ്റാൻ ഞങ്ങൾ ഇവിടെയുണ്ട്.
      
      ഞങ്ങളുടെ സേവനങ്ങൾ:
      - മലയാളം വോയ്‌സ് AI ഏജന്റുകൾ
      - മംഗ്ലീഷ് പിന്തുണ
      - പ്രാദേശിക ഭാഷകളിലുള്ള IVR സിസ്റ്റം
      - 24/7 കസ്റ്റമർ സപ്പോർട്ട്
      
      ഡാഷ്ബോർഡ് കാണുക: {{dashboardUrl}}
      
      എന്തെങ്കിലും സഹായം വേണമെങ്കിൽ ഞങ്ങളെ സമീപിക്കുക.
      
      നന്ദി,
      AI IVR Team
      `,
            'ml',
            'welcome',
            ['recipientName', 'dashboardUrl']
        );

        // English Appointment Confirmation Template
        this.createTemplate(
            'Appointment Confirmation',
            'Appointment Confirmed - {{appointmentDate}} at {{appointmentTime}}',
            `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #27ae60; text-align: center;">Appointment Confirmed ✓</h1>
            
            <p>Dear {{recipientName}},</p>
            
            <p>Your appointment has been successfully confirmed!</p>
            
            <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Appointment Details:</h3>
              <p><strong>Date:</strong> {{appointmentDate}}</p>
              <p><strong>Time:</strong> {{appointmentTime}}</p>
              <p><strong>Service:</strong> {{serviceName}}</p>
              <p><strong>Location:</strong> {{location}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{rescheduleUrl}}" style="background-color: #f39c12; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">Reschedule</a>
              <a href="{{cancelUrl}}" style="background-color: #e74c3c; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 0 10px;">Cancel</a>
            </div>
            
            <p>We'll send you a reminder 1 hour before your appointment.</p>
            
            <p>Thank you for choosing our services!</p>
            
            <p>Best regards,<br>AI IVR Platform</p>
          </div>
        </body>
      </html>
      `,
            `
      Appointment Confirmed ✓
      
      Dear {{recipientName}},
      
      Your appointment has been successfully confirmed!
      
      Appointment Details:
      Date: {{appointmentDate}}
      Time: {{appointmentTime}}
      Service: {{serviceName}}
      Location: {{location}}
      
      Reschedule: {{rescheduleUrl}}
      Cancel: {{cancelUrl}}
      
      We'll send you a reminder 1 hour before your appointment.
      
      Thank you for choosing our services!
      
      Best regards,
      AI IVR Platform
      `,
            'en',
            'appointment',
            ['recipientName', 'appointmentDate', 'appointmentTime', 'serviceName', 'location', 'rescheduleUrl', 'cancelUrl']
        );

        // Manglish Billing Template
        this.createTemplate(
            'Billing Reminder Manglish',
            'Bill Payment Reminder - {{billAmount}} due on {{dueDate}}',
            `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #e67e22; text-align: center;">Bill Payment Reminder</h1>
            
            <p>Dear {{recipientName}},</p>
            
            <p>Ningalude bill payment reminder aanu. Dayavayi time-il payment cheyyuka.</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin: 0 0 10px 0; color: #856404;">Bill Details:</h3>
              <p><strong>Amount:</strong> ₹{{billAmount}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Bill Number:</strong> {{billNumber}}</p>
              <p><strong>Service Period:</strong> {{servicePeriod}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{paymentUrl}}" style="background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Pay Now</a>
            </div>
            
            <p>Late payment-inu additional charges undakam. Dayavayi due date-nu munne payment complete cheyyuka.</p>
            
            <p>Enthenkilum doubt undo? Contact cheyyuka: {{supportPhone}} or {{supportEmail}}</p>
            
            <p>Thank you,<br>Billing Team</p>
          </div>
        </body>
      </html>
      `,
            `
      Bill Payment Reminder
      
      Dear {{recipientName}},
      
      Ningalude bill payment reminder aanu. Dayavayi time-il payment cheyyuka.
      
      Bill Details:
      Amount: ₹{{billAmount}}
      Due Date: {{dueDate}}
      Bill Number: {{billNumber}}
      Service Period: {{servicePeriod}}
      
      Pay Now: {{paymentUrl}}
      
      Late payment-inu additional charges undakam. Dayavayi due date-nu munne payment complete cheyyuka.
      
      Enthenkilum doubt undo? Contact cheyyuka: {{supportPhone}} or {{supportEmail}}
      
      Thank you,
      Billing Team
      `,
            'manglish',
            'billing',
            ['recipientName', 'billAmount', 'dueDate', 'billNumber', 'servicePeriod', 'paymentUrl', 'supportPhone', 'supportEmail']
        );
    }

    // Helper methods
    private replaceVariables(content: string, data: Record<string, any>): string {
        let result = content;
        for (const [key, value] of Object.entries(data)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            result = result.replace(regex, String(value));
        }
        return result;
    }

    private htmlToText(html: string): string {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .trim();
    }

    private addTrackingToContent(html: string, campaignId: string, email: string): string {
        const trackingPixel = `<img src="${process.env.TRACKING_URL || 'https://your-domain.com'}/track/open?campaign=${campaignId}&email=${encodeURIComponent(email)}" width="1" height="1" style="display: none;" />`;
        return html.replace('</body>', `${trackingPixel}</body>`);
    }

    private async getLocalizedTemplate(template: EmailTemplate, language: 'ml' | 'en' | 'manglish'): Promise<EmailTemplate> {
        // If template is already in requested language, return as-is
        if (template.language === language) {
            return template;
        }

        // Look for language-specific version
        const localizedTemplate = Array.from(this.templates.values())
            .find(t => t.name.includes(template.name) && t.language === language);

        return localizedTemplate || template;
    }

    private generateId(): string {
        return 'email_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Public API methods
    async getTemplates(language?: string): Promise<EmailTemplate[]> {
        const templates = Array.from(this.templates.values());
        return language ? templates.filter(t => t.language === language) : templates;
    }

    async getCampaigns(): Promise<EmailCampaign[]> {
        return Array.from(this.campaigns.values());
    }

    async getCampaign(campaignId: string): Promise<EmailCampaign | undefined> {
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

    // Track email opens and clicks
    async trackEmailOpen(campaignId: string, email: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (campaign) {
            const recipient = campaign.recipients.find(r => r.email === email);
            if (recipient && recipient.status === 'sent') {
                recipient.status = 'opened';
                campaign.totalOpened++;
                this.campaigns.set(campaignId, campaign);
            }
        }
    }

    async trackEmailClick(campaignId: string, email: string, url: string): Promise<void> {
        const campaign = this.campaigns.get(campaignId);
        if (campaign) {
            const recipient = campaign.recipients.find(r => r.email === email);
            if (recipient && ['sent', 'opened'].includes(recipient.status)) {
                recipient.status = 'clicked';
                campaign.totalClicked++;
                this.campaigns.set(campaignId, campaign);
            }
        }
    }

    // Analytics
    async getEmailAnalytics(): Promise<EmailAnalytics> {
        const campaigns = Array.from(this.campaigns.values());
        const templates = Array.from(this.templates.values());

        const totalEmails = campaigns.reduce((sum, c) => sum + c.totalSent, 0);
        const totalOpened = campaigns.reduce((sum, c) => sum + c.totalOpened, 0);
        const totalClicked = campaigns.reduce((sum, c) => sum + c.totalClicked, 0);

        const languageDistribution = templates.reduce((acc, template) => {
            acc[template.language] = (acc[template.language] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const campaignPerformance = campaigns.map(campaign => ({
            campaignId: campaign.id,
            name: campaign.name,
            sent: campaign.totalSent,
            opened: campaign.totalOpened,
            clicked: campaign.totalClicked
        }));

        return {
            totalEmails,
            deliveryRate: totalEmails > 0 ? 0.95 : 0, // Placeholder
            openRate: totalEmails > 0 ? totalOpened / totalEmails : 0,
            clickRate: totalOpened > 0 ? totalClicked / totalOpened : 0,
            bounceRate: 0.02, // Placeholder
            languageDistribution,
            campaignPerformance
        };
    }
}