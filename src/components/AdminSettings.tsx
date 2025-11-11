'use client';

import { useState, useEffect } from 'react';

interface FeatureFlag {
    key: string;
    value: boolean;
    description: string;
    category: string;
}

interface AdminSettingsProps {
    billingServiceUrl: string;
}

export default function AdminSettings({ billingServiceUrl }: AdminSettingsProps) {
    const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFeatureFlags();
    }, []);

    const fetchFeatureFlags = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${billingServiceUrl}/api/v1/admin/settings`);
            if (!response.ok) {
                throw new Error('Failed to fetch feature flags');
            }
            const data = await response.json();
            setFeatureFlags(data.data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const updateFeatureFlag = async (key: string, value: boolean) => {
        try {
            setSaving(true);
            const response = await fetch(`${billingServiceUrl}/api/v1/admin/settings/${key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ value }),
            });

            if (!response.ok) {
                throw new Error('Failed to update feature flag');
            }

            // Update local state
            setFeatureFlags(flags =>
                flags.map(flag =>
                    flag.key === key ? { ...flag, value } : flag
                )
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSaving(false);
        }
    };

    const getFeaturesByCategory = (category: string) => {
        return featureFlags.filter(flag => flag.category === category);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading feature flags...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Error loading feature flags
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            {error}
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={fetchFeatureFlags}
                                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
                <p className="mt-2 text-gray-600">
                    Manage feature toggles for Project Saksham services
                </p>
            </div>

            {/* Telephony Features */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Telephony Features
                    </h3>
                    <div className="space-y-4">
                        {getFeaturesByCategory('telephony').map((flag) => (
                            <div key={flag.key} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        {flag.key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <p className="text-sm text-gray-500">{flag.description}</p>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => updateFeatureFlag(flag.key, !flag.value)}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${flag.value ? 'bg-indigo-600' : 'bg-gray-200'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.value ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Infrastructure Features */}
            <div className="bg-white shadow rounded-lg mb-6">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Infrastructure Features
                    </h3>
                    <div className="space-y-4">
                        {getFeaturesByCategory('infrastructure').map((flag) => (
                            <div key={flag.key} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        {flag.key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <p className="text-sm text-gray-500">{flag.description}</p>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => updateFeatureFlag(flag.key, !flag.value)}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${flag.value ? 'bg-indigo-600' : 'bg-gray-200'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.value ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Operations Features */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                        Operations Features
                    </h3>
                    <div className="space-y-4">
                        {getFeaturesByCategory('operations').map((flag) => (
                            <div key={flag.key} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-700">
                                        {flag.key.replace('enable', '').replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <p className="text-sm text-gray-500">{flag.description}</p>
                                </div>
                                <div className="ml-4">
                                    <button
                                        onClick={() => updateFeatureFlag(flag.key, !flag.value)}
                                        disabled={saving}
                                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${flag.value ? 'bg-indigo-600' : 'bg-gray-200'
                                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <span
                                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${flag.value ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}