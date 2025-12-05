/**
 * WhatsApp Payment Link API
 * POST /api/v1/integration/whatsapp/send-payment
 * Soft Collection payment link via WhatsApp
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const sendPaymentSchema = z.object({
    phoneNumber: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
    customerName: z.string().min(2),
    amountDue: z.number().positive(),
    currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
    dueDate: z.string().optional(),
    invoiceNumber: z.string().optional(),
    reminderType: z.enum(['gentle', 'standard', 'final']).default('gentle'),
    paymentMethods: z.array(z.enum(['upi', 'card', 'netbanking', 'wallet'])).optional(),
    callbackUrl: z.string().url().optional(),
    bpoClientId: z.string().optional(),
});

// Message templates by reminder type
const MESSAGE_TEMPLATES = {
    gentle: {
        template: 'payment_reminder_gentle',
        body: `Hi {{customerName}}, 

This is a friendly reminder about your pending payment of {{currency}} {{amount}} {{invoiceRef}}. 

To make your payment quickly and securely, simply tap the link below:
{{paymentLink}}

Thank you for your continued trust in our services. If you've already made this payment, please disregard this message.

Best regards,
{{companyName}}`,
    },
    standard: {
        template: 'payment_reminder_standard',
        body: `Dear {{customerName}},

Your payment of {{currency}} {{amount}} is now due {{dueInfo}}. {{invoiceRef}}

Please complete your payment using this secure link:
{{paymentLink}}

If you're facing any difficulties, we're here to help discuss flexible payment options.

Thank you,
{{companyName}}`,
    },
    final: {
        template: 'payment_reminder_final',
        body: `Important Notice for {{customerName}}

Your payment of {{currency}} {{amount}} is overdue. {{invoiceRef}}

To avoid any service interruption, please make your payment immediately:
{{paymentLink}}

If you believe this is an error or need to discuss your account, please contact us right away.

{{companyName}} Support`,
    },
};

// Generate mock payment link (in production, integrate with payment gateway)
function generatePaymentLink(data: {
    amount: number;
    currency: string;
    invoiceNumber?: string;
    customerId: string;
    methods: string[];
}): string {
    const baseUrl = process.env.PAYMENT_GATEWAY_URL || 'https://pay.example.com';
    const params = new URLSearchParams({
        amount: data.amount.toString(),
        currency: data.currency,
        invoice: data.invoiceNumber || '',
        customer: data.customerId,
        methods: data.methods.join(','),
        expiry: Date.now() + (24 * 60 * 60 * 1000).toString(), // 24 hours
    });
    return `${baseUrl}/p/${Buffer.from(params.toString()).toString('base64').slice(0, 16)}`;
}

// Send WhatsApp message (mock - integrate with Twilio/360dialog/etc)
async function sendWhatsAppMessage(
    phoneNumber: string,
    template: string,
    variables: Record<string, string>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // In production, this would call the WhatsApp Business API
        // Example with Twilio:
        // const client = twilio(accountSid, authToken);
        // await client.messages.create({
        //   from: 'whatsapp:+14155238886',
        //   to: `whatsapp:${phoneNumber}`,
        //   body: processedMessage,
        // });

        console.log(`[WhatsApp] Sending to ${phoneNumber}:`, {
            template,
            variables,
        });

        // Simulate API call
        return {
            success: true,
            messageId: `wamid.${Date.now()}${Math.random().toString(36).slice(2, 8)}`,
        };
    } catch (err) {
        console.error('WhatsApp send error:', err);
        return {
            success: false,
            error: 'Failed to send WhatsApp message',
        };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = sendPaymentSchema.parse(body);

        // Get appropriate template
        const templateConfig = MESSAGE_TEMPLATES[validatedData.reminderType];

        // Generate payment link
        const paymentLink = generatePaymentLink({
            amount: validatedData.amountDue,
            currency: validatedData.currency,
            invoiceNumber: validatedData.invoiceNumber,
            customerId: validatedData.phoneNumber,
            methods: validatedData.paymentMethods || ['upi', 'card'],
        });

        // Build message variables
        const variables: Record<string, string> = {
            customerName: validatedData.customerName,
            amount: validatedData.amountDue.toLocaleString('en-IN'),
            currency: validatedData.currency === 'INR' ? '₹' : validatedData.currency,
            paymentLink,
            invoiceRef: validatedData.invoiceNumber ? `(Invoice: ${validatedData.invoiceNumber})` : '',
            dueInfo: validatedData.dueDate ? `by ${validatedData.dueDate}` : '',
            companyName: 'Your Company', // Would come from BPO client config
        };

        // Process template
        let messageBody = templateConfig.body;
        Object.entries(variables).forEach(([key, value]) => {
            messageBody = messageBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });

        // Send WhatsApp message
        const sendResult = await sendWhatsAppMessage(
            validatedData.phoneNumber,
            templateConfig.template,
            variables
        );

        if (!sendResult.success) {
            return NextResponse.json({
                success: false,
                error: 'Failed to send payment reminder',
                details: sendResult.error,
            }, { status: 500 });
        }

        // Log for audit
        console.log('[Payment Reminder] Sent:', {
            phoneNumber: validatedData.phoneNumber,
            amount: validatedData.amountDue,
            reminderType: validatedData.reminderType,
            messageId: sendResult.messageId,
            paymentLink,
        });

        return NextResponse.json({
            success: true,
            message: 'Payment reminder sent successfully',
            data: {
                messageId: sendResult.messageId,
                phoneNumber: validatedData.phoneNumber,
                amount: validatedData.amountDue,
                currency: validatedData.currency,
                reminderType: validatedData.reminderType,
                paymentLink,
                sentAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            },
        });

    } catch (err: unknown) {
        console.error('Error sending payment reminder:', err);

        if (err && typeof err === 'object' && 'errors' in err) {
            return NextResponse.json(
                { success: false, error: 'Validation Error', details: (err as { errors: unknown[] }).errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// GET - Check message status
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('messageId');

    if (!messageId) {
        return NextResponse.json(
            { success: false, error: 'messageId required' },
            { status: 400 }
        );
    }

    // Mock status check (in production, query WhatsApp API)
    const statuses = ['sent', 'delivered', 'read', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * 3)]; // Mostly success

    return NextResponse.json({
        success: true,
        data: {
            messageId,
            status: randomStatus,
            timestamp: new Date().toISOString(),
        },
    });
}
