/**
 * CRM Integration Hub
 * Multi-CRM connector for Salesforce, HubSpot, Zendesk, Freshdesk, and custom APIs
 */

// CRM Types
export type CRMType = 'salesforce' | 'hubspot' | 'zendesk' | 'freshdesk' | 'zoho' | 'custom';

export interface CRMConfig {
    type: CRMType;
    credentials: CRMCredentials;
    fieldMapping: FieldMapping;
    syncSettings: SyncSettings;
}

export interface CRMCredentials {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    instanceUrl?: string;
    subdomain?: string;
}

export interface FieldMapping {
    phone: string;
    email: string;
    name: string;
    accountNumber?: string;
    customFields?: Record<string, string>;
}

export interface SyncSettings {
    enabled: boolean;
    syncInterval: number; // minutes
    syncOnCall: boolean;
    createMissingRecords: boolean;
}

export interface CustomerRecord {
    id: string;
    externalId: string;
    name: string;
    phone: string;
    email?: string;
    accountNumber?: string;
    tier?: string;
    customData?: Record<string, unknown>;
    lastUpdated: Date;
}

// CRM Connector Base Class
abstract class CRMConnector {
    protected config: CRMConfig;

    constructor(config: CRMConfig) {
        this.config = config;
    }

    abstract connect(): Promise<boolean>;
    abstract disconnect(): Promise<void>;
    abstract lookupByPhone(phone: string): Promise<CustomerRecord | null>;
    abstract lookupByEmail(email: string): Promise<CustomerRecord | null>;
    abstract updateRecord(id: string, data: Partial<CustomerRecord>): Promise<boolean>;
    abstract createRecord(data: Partial<CustomerRecord>): Promise<CustomerRecord>;
    abstract getRecentActivity(customerId: string): Promise<unknown[]>;
}

// Salesforce Connector
class SalesforceConnector extends CRMConnector {
    private accessToken: string | null = null;

    async connect(): Promise<boolean> {
        try {
            // OAuth 2.0 Token Exchange
            const response = await fetch(`${this.config.credentials.instanceUrl}/services/oauth2/token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    client_id: this.config.credentials.clientId!,
                    client_secret: this.config.credentials.clientSecret!,
                    refresh_token: this.config.credentials.refreshToken!
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access_token;
                return true;
            }
            return false;
        } catch (error) {
            console.error('Salesforce connection error:', error);
            return false;
        }
    }

    async disconnect(): Promise<void> {
        this.accessToken = null;
    }

    async lookupByPhone(phone: string): Promise<CustomerRecord | null> {
        if (!this.accessToken) await this.connect();

        try {
            const normalizedPhone = phone.replace(/\D/g, '');
            const query = `SELECT Id, Name, Phone, Email, AccountNumber FROM Contact WHERE Phone LIKE '%${normalizedPhone}%' LIMIT 1`;

            const response = await fetch(
                `${this.config.credentials.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
                { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.records?.length > 0) {
                    const record = data.records[0];
                    return {
                        id: record.Id,
                        externalId: record.Id,
                        name: record.Name,
                        phone: record.Phone,
                        email: record.Email,
                        accountNumber: record.AccountNumber,
                        lastUpdated: new Date()
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Salesforce lookup error:', error);
            return null;
        }
    }

    async lookupByEmail(email: string): Promise<CustomerRecord | null> {
        if (!this.accessToken) await this.connect();

        try {
            const query = `SELECT Id, Name, Phone, Email, AccountNumber FROM Contact WHERE Email = '${email}' LIMIT 1`;

            const response = await fetch(
                `${this.config.credentials.instanceUrl}/services/data/v58.0/query?q=${encodeURIComponent(query)}`,
                { headers: { 'Authorization': `Bearer ${this.accessToken}` } }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.records?.length > 0) {
                    const record = data.records[0];
                    return {
                        id: record.Id,
                        externalId: record.Id,
                        name: record.Name,
                        phone: record.Phone,
                        email: record.Email,
                        accountNumber: record.AccountNumber,
                        lastUpdated: new Date()
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Salesforce lookup error:', error);
            return null;
        }
    }

    async updateRecord(id: string, data: Partial<CustomerRecord>): Promise<boolean> {
        if (!this.accessToken) await this.connect();

        try {
            const response = await fetch(
                `${this.config.credentials.instanceUrl}/services/data/v58.0/sobjects/Contact/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        Name: data.name,
                        Phone: data.phone,
                        Email: data.email
                    })
                }
            );
            return response.ok;
        } catch (error) {
            console.error('Salesforce update error:', error);
            return false;
        }
    }

    async createRecord(data: Partial<CustomerRecord>): Promise<CustomerRecord> {
        if (!this.accessToken) await this.connect();

        const response = await fetch(
            `${this.config.credentials.instanceUrl}/services/data/v58.0/sobjects/Contact`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    FirstName: data.name?.split(' ')[0],
                    LastName: data.name?.split(' ').slice(1).join(' ') || 'Unknown',
                    Phone: data.phone,
                    Email: data.email
                })
            }
        );

        const result = await response.json();
        return {
            id: result.id,
            externalId: result.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email,
            lastUpdated: new Date()
        };
    }

    async getRecentActivity(customerId: string): Promise<unknown[]> {
        // Fetch recent tasks, cases, opportunities
        return [];
    }
}

// HubSpot Connector
class HubSpotConnector extends CRMConnector {
    async connect(): Promise<boolean> {
        // HubSpot uses private app tokens - simpler auth
        return !!this.config.credentials.accessToken;
    }

    async disconnect(): Promise<void> { }

    async lookupByPhone(phone: string): Promise<CustomerRecord | null> {
        try {
            const response = await fetch(
                `https://api.hubapi.com/crm/v3/objects/contacts/search`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.config.credentials.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        filterGroups: [{
                            filters: [{
                                propertyName: 'phone',
                                operator: 'CONTAINS_TOKEN',
                                value: phone.replace(/\D/g, '')
                            }]
                        }],
                        properties: ['firstname', 'lastname', 'email', 'phone']
                    })
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.results?.length > 0) {
                    const contact = data.results[0];
                    return {
                        id: contact.id,
                        externalId: contact.id,
                        name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
                        phone: contact.properties.phone || '',
                        email: contact.properties.email,
                        lastUpdated: new Date()
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('HubSpot lookup error:', error);
            return null;
        }
    }

    async lookupByEmail(email: string): Promise<CustomerRecord | null> {
        try {
            const response = await fetch(
                `https://api.hubapi.com/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email`,
                {
                    headers: { 'Authorization': `Bearer ${this.config.credentials.accessToken}` }
                }
            );

            if (response.ok) {
                const contact = await response.json();
                return {
                    id: contact.id,
                    externalId: contact.id,
                    name: `${contact.properties.firstname || ''} ${contact.properties.lastname || ''}`.trim(),
                    phone: contact.properties.phone || '',
                    email: contact.properties.email,
                    lastUpdated: new Date()
                };
            }
            return null;
        } catch (error) {
            console.error('HubSpot lookup error:', error);
            return null;
        }
    }

    async updateRecord(id: string, data: Partial<CustomerRecord>): Promise<boolean> {
        try {
            const nameParts = data.name?.split(' ') || [];
            const response = await fetch(
                `https://api.hubapi.com/crm/v3/objects/contacts/${id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${this.config.credentials.accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        properties: {
                            firstname: nameParts[0],
                            lastname: nameParts.slice(1).join(' '),
                            phone: data.phone,
                            email: data.email
                        }
                    })
                }
            );
            return response.ok;
        } catch (error) {
            console.error('HubSpot update error:', error);
            return false;
        }
    }

    async createRecord(data: Partial<CustomerRecord>): Promise<CustomerRecord> {
        const nameParts = data.name?.split(' ') || ['Unknown'];
        const response = await fetch(
            `https://api.hubapi.com/crm/v3/objects/contacts`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.config.credentials.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    properties: {
                        firstname: nameParts[0],
                        lastname: nameParts.slice(1).join(' ') || '',
                        phone: data.phone,
                        email: data.email
                    }
                })
            }
        );

        const result = await response.json();
        return {
            id: result.id,
            externalId: result.id,
            name: data.name || '',
            phone: data.phone || '',
            email: data.email,
            lastUpdated: new Date()
        };
    }

    async getRecentActivity(customerId: string): Promise<unknown[]> {
        return [];
    }
}

// Zendesk Connector
class ZendeskConnector extends CRMConnector {
    private get baseUrl(): string {
        return `https://${this.config.credentials.subdomain}.zendesk.com/api/v2`;
    }

    async connect(): Promise<boolean> {
        return !!this.config.credentials.apiKey;
    }

    async disconnect(): Promise<void> { }

    async lookupByPhone(phone: string): Promise<CustomerRecord | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/search.json?query=phone:${phone}`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.config.credentials.apiKey}/token:${this.config.credentials.apiKey}`).toString('base64')}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.users?.length > 0) {
                    const user = data.users[0];
                    return {
                        id: user.id.toString(),
                        externalId: user.id.toString(),
                        name: user.name,
                        phone: user.phone || phone,
                        email: user.email,
                        lastUpdated: new Date()
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Zendesk lookup error:', error);
            return null;
        }
    }

    async lookupByEmail(email: string): Promise<CustomerRecord | null> {
        try {
            const response = await fetch(
                `${this.baseUrl}/users/search.json?query=email:${email}`,
                {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${this.config.credentials.apiKey}/token:${this.config.credentials.apiKey}`).toString('base64')}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                if (data.users?.length > 0) {
                    const user = data.users[0];
                    return {
                        id: user.id.toString(),
                        externalId: user.id.toString(),
                        name: user.name,
                        phone: user.phone,
                        email: user.email,
                        lastUpdated: new Date()
                    };
                }
            }
            return null;
        } catch (error) {
            console.error('Zendesk lookup error:', error);
            return null;
        }
    }

    async updateRecord(id: string, data: Partial<CustomerRecord>): Promise<boolean> {
        return false; // Implement as needed
    }

    async createRecord(data: Partial<CustomerRecord>): Promise<CustomerRecord> {
        throw new Error('Not implemented');
    }

    async getRecentActivity(customerId: string): Promise<unknown[]> {
        // Fetch recent tickets
        return [];
    }
}

// Factory function
export function createCRMConnector(config: CRMConfig): CRMConnector {
    switch (config.type) {
        case 'salesforce':
            return new SalesforceConnector(config);
        case 'hubspot':
            return new HubSpotConnector(config);
        case 'zendesk':
            return new ZendeskConnector(config);
        default:
            throw new Error(`Unsupported CRM type: ${config.type}`);
    }
}

// Screen Pop Service
export class ScreenPopService {
    private connectors: Map<string, CRMConnector> = new Map();

    registerConnector(clientId: string, connector: CRMConnector) {
        this.connectors.set(clientId, connector);
    }

    async lookupCaller(clientId: string, phone: string): Promise<CustomerRecord | null> {
        const connector = this.connectors.get(clientId);
        if (!connector) return null;

        return connector.lookupByPhone(phone);
    }

    async getScreenPopData(clientId: string, phone: string): Promise<{
        customer: CustomerRecord | null;
        recentActivity: unknown[];
        suggestions: string[];
    }> {
        const connector = this.connectors.get(clientId);
        if (!connector) {
            return { customer: null, recentActivity: [], suggestions: [] };
        }

        const customer = await connector.lookupByPhone(phone);
        const recentActivity = customer
            ? await connector.getRecentActivity(customer.id)
            : [];

        // Generate AI suggestions based on customer data
        const suggestions = this.generateSuggestions(customer, recentActivity);

        return { customer, recentActivity, suggestions };
    }

    private generateSuggestions(customer: CustomerRecord | null, activity: unknown[]): string[] {
        if (!customer) {
            return ['New caller - collect customer information'];
        }

        const suggestions: string[] = [];

        // Add suggestions based on customer tier
        if (customer.tier === 'vip') {
            suggestions.push('VIP customer - prioritize resolution');
        }

        // Add suggestions based on recent activity
        if (activity.length === 0) {
            suggestions.push('First contact in a while - check for any issues');
        }

        return suggestions;
    }
}

// Export singleton
export const screenPopService = new ScreenPopService();
