'use client';

/**
 * BPO Client Onboarding Wizard
 * Quick setup for new BPO clients with minimal configuration
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Headphones,
    CreditCard,
    Heart,
    ShoppingCart,
    Users,
    Database,
    Phone,
    Upload,
    Check,
    ArrowRight,
    ArrowLeft,
    Loader2,
    Zap,
    Shield,
    Globe
} from 'lucide-react';

// Industry Templates
const INDUSTRY_TEMPLATES = [
    {
        id: 'collections',
        name: 'Debt Collections',
        icon: CreditCard,
        color: 'from-amber-500 to-orange-600',
        description: 'Optimized for payment reminders, soft collections, and account recovery',
        features: ['Payment Link Integration', 'Compliance Scripts', 'Skip Tracing', 'Promise to Pay Tracking'],
        workflows: ['soft_collection', 'payment_reminder', 'skip_trace']
    },
    {
        id: 'customer_support',
        name: 'Customer Support',
        icon: Headphones,
        color: 'from-blue-500 to-indigo-600',
        description: 'Full-service support with ticket management and escalation paths',
        features: ['Ticket Integration', 'Knowledge Base', 'Escalation Matrix', 'CSAT Surveys'],
        workflows: ['smart_triage', 'tier_routing', 'csat_survey']
    },
    {
        id: 'sales',
        name: 'Sales & Lead Gen',
        icon: ShoppingCart,
        color: 'from-emerald-500 to-teal-600',
        description: 'Outbound campaigns, lead qualification, and appointment setting',
        features: ['AMD Detection', 'Campaign Manager', 'Lead Scoring', 'Calendar Integration'],
        workflows: ['outbound_campaign', 'lead_qualification', 'appointment_booking']
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        icon: Heart,
        color: 'from-rose-500 to-pink-600',
        description: 'HIPAA-compliant communication for healthcare providers',
        features: ['HIPAA Compliance', 'Appointment Reminders', 'Prescription Refills', 'PII Redaction'],
        workflows: ['appointment_reminder', 'prescription_refill', 'patient_outreach']
    }
];

// CRM Options
const CRM_OPTIONS = [
    { id: 'salesforce', name: 'Salesforce', logo: '☁️', popular: true },
    { id: 'hubspot', name: 'HubSpot', logo: '🧡', popular: true },
    { id: 'zendesk', name: 'Zendesk', logo: '💚', popular: true },
    { id: 'freshdesk', name: 'Freshdesk', logo: '💙', popular: false },
    { id: 'zoho', name: 'Zoho CRM', logo: '🔴', popular: false },
    { id: 'custom', name: 'Custom API', logo: '⚙️', popular: false }
];

// Telephony Options
const TELEPHONY_OPTIONS = [
    { id: 'twilio', name: 'Twilio', description: 'Cloud communications platform' },
    { id: 'vonage', name: 'Vonage', description: 'Business cloud communications' },
    { id: 'byoc', name: 'Bring Your Own Carrier', description: 'Use your existing SIP trunks' }
];

interface OnboardingData {
    clientName: string;
    industry: string;
    crm: string;
    telephony: string;
    agents: Array<{ name: string; email: string; skill: string }>;
}

export default function BPOOnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<OnboardingData>({
        clientName: '',
        industry: '',
        crm: '',
        telephony: 'twilio',
        agents: []
    });

    const totalSteps = 5;

    // Step 1: Client Info & Industry
    const renderIndustryStep = () => (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Client/Company Name
                </label>
                <input
                    type="text"
                    value={data.clientName}
                    onChange={(e) => setData({ ...data, clientName: e.target.value })}
                    placeholder="Enter company name"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-4">
                    Select Industry Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INDUSTRY_TEMPLATES.map((template) => {
                        const Icon = template.icon;
                        const isSelected = data.industry === template.id;

                        return (
                            <button
                                key={template.id}
                                onClick={() => setData({ ...data, industry: template.id })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center flex-shrink-0`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white">{template.name}</h3>
                                        <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {template.features.slice(0, 2).map((f, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-700/50 rounded text-xs text-gray-300">
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    // Step 2: CRM Connection
    const renderCRMStep = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <Database className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Connect Your CRM</h3>
                <p className="text-gray-400 mt-2">Sync customer data for screen pops and context</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {CRM_OPTIONS.map((crm) => {
                    const isSelected = data.crm === crm.id;

                    return (
                        <button
                            key={crm.id}
                            onClick={() => setData({ ...data, crm: crm.id })}
                            className={`p-4 rounded-xl border-2 text-center transition-all relative ${isSelected
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            {crm.popular && (
                                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 rounded-full text-xs font-medium">
                                    Popular
                                </span>
                            )}
                            <div className="text-3xl mb-2">{crm.logo}</div>
                            <div className="font-medium">{crm.name}</div>
                            {isSelected && (
                                <Check className="w-4 h-4 text-blue-400 absolute top-2 left-2" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Shield className="w-4 h-4" />
                    <span>OAuth 2.0 secure connection • No passwords stored</span>
                </div>
            </div>

            <button
                onClick={() => setData({ ...data, crm: 'skip' })}
                className="w-full text-center text-gray-400 hover:text-gray-300 text-sm underline"
            >
                Skip for now - I'll connect later
            </button>
        </div>
    );

    // Step 3: Telephony Setup
    const renderTelephonyStep = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <Phone className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Telephony Integration</h3>
                <p className="text-gray-400 mt-2">Connect your voice infrastructure</p>
            </div>

            <div className="space-y-4">
                {TELEPHONY_OPTIONS.map((opt) => {
                    const isSelected = data.telephony === opt.id;

                    return (
                        <button
                            key={opt.id}
                            onClick={() => setData({ ...data, telephony: opt.id })}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${isSelected
                                    ? 'border-green-500 bg-green-500/10'
                                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500' : 'bg-gray-700'
                                }`}>
                                {isSelected ? <Check className="w-5 h-5 text-white" /> : <Phone className="w-5 h-5 text-gray-400" />}
                            </div>
                            <div>
                                <div className="font-medium">{opt.name}</div>
                                <div className="text-sm text-gray-400">{opt.description}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {data.telephony === 'twilio' && (
                <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-3">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Twilio Account SID</label>
                        <input
                            type="text"
                            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Auth Token</label>
                        <input
                            type="password"
                            placeholder="••••••••••••••••••••••••••••••••"
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-sm text-white placeholder-gray-500 focus:border-green-500 outline-none"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    // Step 4: Agent Import
    const renderAgentStep = () => (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <Users className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Import Your Agents</h3>
                <p className="text-gray-400 mt-2">Add your team members to the platform</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* CSV Upload */}
                <div className="p-6 border-2 border-dashed border-gray-700 rounded-xl text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <div className="font-medium">Upload CSV</div>
                    <div className="text-sm text-gray-400 mt-1">Bulk import agents from spreadsheet</div>
                    <input type="file" accept=".csv" className="hidden" />
                </div>

                {/* Manual Entry */}
                <div className="p-6 border-2 border-gray-700 rounded-xl text-center hover:border-purple-500 transition-colors cursor-pointer">
                    <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <div className="font-medium">Add Manually</div>
                    <div className="text-sm text-gray-400 mt-1">Enter agents one by one</div>
                </div>
            </div>

            {/* Sample Data */}
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-medium text-gray-300 mb-2">CSV Format Example:</div>
                <code className="text-xs text-gray-400">
                    name,email,skill<br />
                    John Doe,john@example.com,collections<br />
                    Jane Smith,jane@example.com,support
                </code>
            </div>

            {/* Demo Agents */}
            <div className="border border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-800/50 px-4 py-2 text-sm font-medium text-gray-300 flex items-center justify-between">
                    <span>Demo Agents (for testing)</span>
                    <button
                        onClick={() => setData({
                            ...data, agents: [
                                { name: 'Demo Agent 1', email: 'agent1@demo.com', skill: 'collections' },
                                { name: 'Demo Agent 2', email: 'agent2@demo.com', skill: 'support' }
                            ]
                        })}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                        + Add Demo Agents
                    </button>
                </div>
                {data.agents.length > 0 && (
                    <div className="divide-y divide-gray-700">
                        {data.agents.map((agent, i) => (
                            <div key={i} className="px-4 py-2 flex items-center justify-between">
                                <div>
                                    <div className="text-sm font-medium">{agent.name}</div>
                                    <div className="text-xs text-gray-400">{agent.email}</div>
                                </div>
                                <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">{agent.skill}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Step 5: Review & Launch
    const renderReviewStep = () => {
        const selectedTemplate = INDUSTRY_TEMPLATES.find(t => t.id === data.industry);
        const selectedCRM = CRM_OPTIONS.find(c => c.id === data.crm);

        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold">Ready to Launch!</h3>
                    <p className="text-gray-400 mt-2">Review your configuration and go live</p>
                </div>

                <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-400">Client</div>
                            <div className="font-semibold">{data.clientName || 'Not set'}</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-400">Industry</div>
                            <div className="font-semibold">{selectedTemplate?.name || 'Not selected'}</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-400">CRM</div>
                            <div className="font-semibold">{selectedCRM?.name || 'Skipped'}</div>
                        </div>
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <div className="text-sm text-gray-400">Agents</div>
                            <div className="font-semibold">{data.agents.length} configured</div>
                        </div>
                    </div>

                    {/* What Will Be Created */}
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
                        <div className="font-medium mb-2">What will be set up:</div>
                        <ul className="text-sm text-gray-300 space-y-1">
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                BPO client account with branding
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                {selectedTemplate?.workflows.length || 0} pre-configured workflows
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                Agent seats with skill assignments
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-green-400" />
                                Real-time KPI dashboard
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            handleLaunch();
        }
    };

    const handleLaunch = async () => {
        setIsLoading(true);

        try {
            // Create BPO client via API
            const response = await fetch('/api/v1/bpo/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientName: data.clientName,
                    configSettings: {
                        industry: data.industry,
                        telephony: data.telephony
                    },
                    crmType: data.crm !== 'skip' ? data.crm : undefined
                })
            });

            if (response.ok) {
                router.push('/bpo-management?onboarding=complete');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1: return data.clientName && data.industry;
            case 2: return true; // CRM is optional
            case 3: return data.telephony;
            case 4: return true; // Agents optional
            case 5: return true;
            default: return false;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 text-white">
            <div className="max-w-3xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Building2 className="w-8 h-8 text-blue-400" />
                        <h1 className="text-2xl font-bold">BPO Setup Wizard</h1>
                    </div>
                    <p className="text-gray-400">Get your contact center running in minutes</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <div
                            key={s}
                            className={`w-10 h-1 rounded-full transition-colors ${s <= step ? 'bg-blue-500' : 'bg-gray-700'
                                }`}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-gray-800/30 backdrop-blur rounded-2xl border border-gray-700 p-8">
                    {step === 1 && renderIndustryStep()}
                    {step === 2 && renderCRMStep()}
                    {step === 3 && renderTelephonyStep()}
                    {step === 4 && renderAgentStep()}
                    {step === 5 && renderReviewStep()}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="text-sm text-gray-500">
                        Step {step} of {totalSteps}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed() || isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : step === totalSteps ? (
                            <>
                                <Zap className="w-4 h-4" />
                                Launch
                            </>
                        ) : (
                            <>
                                Next
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
