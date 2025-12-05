'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import { useMockData } from '@/hooks/use-mock-data';
import { Volume2, Mic, Globe, Shield, Database, Clock } from 'lucide-react';
import {
    SystemSetting,
    SettingCategory,
    GitCommit,
    GitRelease
} from '../settings/types';

/**
 * Mock settings data generator
 */
function generateMockSettings(): SettingCategory[] {
    return [
        {
            name: 'Voice & Speech',
            icon: Volume2,
            description: 'Configure voice synthesis and speech recognition settings',
            settings: [
                { id: '1', key: 'default_voice', value: 'ml-IN-Standard-A', type: 'string', category: 'Voice & Speech', description: 'Default voice for TTS', isEncrypted: false },
                { id: '2', key: 'speech_rate', value: '1.0', type: 'number', category: 'Voice & Speech', description: 'Speech rate multiplier', isEncrypted: false },
                { id: '3', key: 'enable_ssml', value: 'true', type: 'boolean', category: 'Voice & Speech', description: 'Enable SSML processing', isEncrypted: false },
            ]
        },
        {
            name: 'Audio Processing',
            icon: Mic,
            description: 'Audio input and processing configuration',
            settings: [
                { id: '4', key: 'noise_reduction', value: 'true', type: 'boolean', category: 'Audio Processing', description: 'Enable noise reduction', isEncrypted: false },
                { id: '5', key: 'sample_rate', value: '16000', type: 'number', category: 'Audio Processing', description: 'Audio sample rate in Hz', isEncrypted: false },
            ]
        },
        {
            name: 'Cultural & Language',
            icon: Globe,
            description: 'Malayalam cultural and language settings',
            settings: [
                { id: '6', key: 'default_dialect', value: 'central_kerala', type: 'string', category: 'Cultural & Language', description: 'Default Malayalam dialect', isEncrypted: false },
                { id: '7', key: 'cultural_awareness', value: 'true', type: 'boolean', category: 'Cultural & Language', description: 'Enable cultural context awareness', isEncrypted: false },
            ]
        },
        {
            name: 'Security',
            icon: Shield,
            description: 'Security and authentication settings',
            settings: [
                { id: '8', key: 'api_key', value: '********', type: 'string', category: 'Security', description: 'API authentication key', isEncrypted: true },
                { id: '9', key: 'enable_audit', value: 'true', type: 'boolean', category: 'Security', description: 'Enable audit logging', isEncrypted: false },
            ]
        },
        {
            name: 'Database',
            icon: Database,
            description: 'Database connection and caching',
            settings: [
                { id: '10', key: 'cache_ttl', value: '3600', type: 'number', category: 'Database', description: 'Cache TTL in seconds', isEncrypted: false },
            ]
        },
        {
            name: 'Performance',
            icon: Clock,
            description: 'Performance and timing settings',
            settings: [
                { id: '11', key: 'request_timeout', value: '30', type: 'number', category: 'Performance', description: 'API request timeout in seconds', isEncrypted: false },
                { id: '12', key: 'max_retries', value: '3', type: 'number', category: 'Performance', description: 'Maximum API retry attempts', isEncrypted: false },
            ]
        }
    ];
}

/**
 * Central hook for System Settings state and operations.
 */
export function useSystemSettings() {
    const { isMockMode } = useMockData();

    const [categories, setCategories] = useState<SettingCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [commits, setCommits] = useState<GitCommit[]>([]);
    const [releases, setReleases] = useState<GitRelease[]>([]);
    const [activeCategory, setActiveCategory] = useState('Voice & Speech');
    const [editingSettings, setEditingSettings] = useState<Set<string>>(new Set());

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
        fetchCommits();
        fetchReleases();
    }, []);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            if (isMockMode) {
                // Use mock data
                await new Promise(resolve => setTimeout(resolve, 500));
                setCategories(generateMockSettings());
            } else {
                const response = await api.getSystemSettings();
                if (response.success && response.data) {
                    setCategories(response.data.categories || []);
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            // Fallback to mock data on error
            setCategories(generateMockSettings());
        } finally {
            setLoading(false);
        }
    }, [isMockMode]);

    const fetchCommits = useCallback(async () => {
        try {
            if (isMockMode) {
                setCommits([
                    { sha: 'abc123', message: 'feat: Add TTS integration', author: 'Developer', date: new Date().toISOString(), url: '#' },
                    { sha: 'def456', message: 'fix: Improve voice quality', author: 'Developer', date: new Date().toISOString(), url: '#' },
                ]);
            } else {
                const response = await api.getRecentCommits?.();
                if (response?.success && response.data) {
                    setCommits(response.data.commits || []);
                }
            }
        } catch (error) {
            console.error('Error fetching commits:', error);
        }
    }, [isMockMode]);

    const fetchReleases = useCallback(async () => {
        try {
            if (isMockMode) {
                setReleases([
                    { tag: 'v1.0.0', name: 'Initial Release', body: 'First production release', date: new Date().toISOString(), url: '#', isPrerelease: false },
                ]);
            } else {
                const response = await api.getReleases?.();
                if (response?.success && response.data) {
                    setReleases(response.data.releases || []);
                }
            }
        } catch (error) {
            console.error('Error fetching releases:', error);
        }
    }, [isMockMode]);

    const updateSetting = useCallback((settingId: string, newValue: string) => {
        setCategories(prev => prev.map(category => ({
            ...category,
            settings: category.settings.map(setting =>
                setting.id === settingId ? { ...setting, value: newValue } : setting
            )
        })));
        setHasChanges(true);
    }, []);

    const toggleEditMode = useCallback((settingId: string) => {
        setEditingSettings(prev => {
            const next = new Set(prev);
            if (next.has(settingId)) {
                next.delete(settingId);
            } else {
                next.add(settingId);
            }
            return next;
        });
    }, []);

    const saveAllSettings = useCallback(async () => {
        try {
            setSaving(true);

            // Collect all settings
            const allSettings = categories.flatMap(cat => cat.settings);

            if (isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast({
                    title: "Settings Saved",
                    description: `${allSettings.length} settings saved successfully (mock mode)`,
                });
            } else {
                const response = await api.updateSystemSettings(allSettings);
                if (response.success) {
                    toast({
                        title: "Settings Saved",
                        description: "All settings have been saved successfully",
                    });
                }
            }

            setHasChanges(false);
            setEditingSettings(new Set());
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({
                title: "Error",
                description: "Failed to save settings",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    }, [categories, isMockMode]);

    const resetToDefaults = useCallback(async () => {
        if (!confirm('Are you sure you want to reset all settings to defaults?')) {
            return;
        }

        try {
            setLoading(true);
            if (isMockMode) {
                await new Promise(resolve => setTimeout(resolve, 500));
                setCategories(generateMockSettings());
            } else {
                await api.resetSystemSettings?.();
                await fetchSettings();
            }
            toast({
                title: "Settings Reset",
                description: "All settings have been reset to defaults",
            });
            setHasChanges(false);
        } catch (error) {
            console.error('Error resetting settings:', error);
        } finally {
            setLoading(false);
        }
    }, [isMockMode, fetchSettings]);

    const reorderSettings = useCallback((categoryName: string, oldIndex: number, newIndex: number) => {
        setCategories(prev => prev.map(category => {
            if (category.name !== categoryName) return category;

            const newSettings = [...category.settings];
            const [removed] = newSettings.splice(oldIndex, 1);
            newSettings.splice(newIndex, 0, removed);

            return { ...category, settings: newSettings };
        }));
        setHasChanges(true);
    }, []);

    return {
        // State
        categories,
        loading,
        saving,
        hasChanges,
        commits,
        releases,
        activeCategory,
        editingSettings,

        // Setters
        setActiveCategory,

        // Operations
        fetchSettings,
        updateSetting,
        toggleEditMode,
        saveAllSettings,
        resetToDefaults,
        reorderSettings,
    };
}

export default useSystemSettings;
