'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { toast } from '@/hooks/use-toast';
import {
    IVRConfig,
    IVRTemplate,
    IVRFormData,
    DEFAULT_FORM_DATA,
    DEFAULT_ADVANCED_SETTINGS
} from '@/components/ivr/management/types';

/**
 * Central hook for IVR Management state and operations.
 * Handles CRUD operations for IVR configurations and templates.
 */
export function useIVRManagement() {
    const [configs, setConfigs] = useState<IVRConfig[]>([]);
    const [templates, setTemplates] = useState<IVRTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConfig, setSelectedConfig] = useState<IVRConfig | null>(null);
    const [editingConfig, setEditingConfig] = useState<IVRConfig | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [formData, setFormData] = useState<IVRFormData>(DEFAULT_FORM_DATA);

    // Load configurations on mount
    useEffect(() => {
        loadConfigurations();
        loadTemplates();
    }, []);

    const loadConfigurations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.getIVRConfigurations();
            if (response.success && response.data) {
                setConfigs(response.data.configs || []);
            }
        } catch (error) {
            console.error('Error loading IVR configurations:', error);
            toast({
                title: "Error",
                description: "Failed to load IVR configurations",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const loadTemplates = useCallback(async () => {
        try {
            const response = await api.getIVRConfigurationTemplates();
            if (response.success && response.data) {
                setTemplates(response.data.templates || []);
            }
        } catch (error) {
            console.error('Error loading IVR templates:', error);
        }
    }, []);

    const createConfiguration = useCallback(async () => {
        try {
            const response = await api.createIVRConfiguration(formData);
            if (response.success) {
                await loadConfigurations();
                setShowCreateForm(false);
                resetForm();
                toast({
                    title: "Success",
                    description: "IVR configuration created successfully"
                });
            }
        } catch (error) {
            console.error('Error creating configuration:', error);
            toast({
                title: "Error",
                description: "Failed to create configuration",
                variant: "destructive"
            });
        }
    }, [formData, loadConfigurations]);

    const updateConfiguration = useCallback(async (configId: string) => {
        try {
            const response = await api.updateIVRConfiguration(configId, formData);
            if (response.success) {
                await loadConfigurations();
                setEditingConfig(null);
                resetForm();
                toast({
                    title: "Success",
                    description: "Configuration updated successfully"
                });
            }
        } catch (error) {
            console.error('Error updating configuration:', error);
            toast({
                title: "Error",
                description: "Failed to update configuration",
                variant: "destructive"
            });
        }
    }, [formData, loadConfigurations]);

    const deleteConfiguration = useCallback(async (configId: string) => {
        if (!confirm('Are you sure you want to delete this IVR configuration?')) {
            return;
        }

        try {
            const response = await api.deleteIVRConfiguration(configId);
            if (response.success) {
                await loadConfigurations();
                toast({
                    title: "Deleted",
                    description: "Configuration deleted successfully"
                });
            }
        } catch (error) {
            console.error('Error deleting configuration:', error);
            toast({
                title: "Error",
                description: "Failed to delete configuration",
                variant: "destructive"
            });
        }
    }, [loadConfigurations]);

    const toggleConfigurationStatus = useCallback(async (config: IVRConfig) => {
        try {
            const response = await api.updateIVRConfiguration(config.id, { is_active: !config.is_active });
            if (response.success) {
                await loadConfigurations();
                toast({
                    title: config.is_active ? "Deactivated" : "Activated",
                    description: `Configuration is now ${config.is_active ? 'inactive' : 'active'}`
                });
            }
        } catch (error) {
            console.error('Error toggling configuration status:', error);
        }
    }, [loadConfigurations]);

    const createFromTemplate = useCallback(async (templateId: string) => {
        try {
            const template = templates.find(t => t.id === templateId);
            const templateData = {
                template_id: templateId,
                name: `New Config from ${template?.name}`,
                customizations: {}
            };
            const response = await api.createIVRConfigurationTemplate(templateData);
            if (response.success) {
                await loadConfigurations();
                toast({
                    title: "Success",
                    description: "Configuration created from template"
                });
            }
        } catch (error) {
            console.error('Error creating from template:', error);
        }
    }, [templates, loadConfigurations]);

    const testConfiguration = useCallback(async (configId: string) => {
        try {
            const response = await api.testIVRConfiguration(configId);
            if (response.success && response.data) {
                const results = response.data.test_results.results;
                toast({
                    title: "Test Complete",
                    description: `${results.passed} passed, ${results.failed} failed`
                });
            }
        } catch (error) {
            console.error('Error testing configuration:', error);
            toast({
                title: "Test Failed",
                description: "Failed to run configuration test",
                variant: "destructive"
            });
        }
    }, []);

    const resetForm = useCallback(() => {
        setFormData(DEFAULT_FORM_DATA);
    }, []);

    const startEditing = useCallback((config: IVRConfig) => {
        setEditingConfig(config);
        setFormData({
            name: config.name,
            description: config.description,
            flow_type: config.flow_type,
            language: config.language,
            dialect: config.dialect || 'central_kerala',
            is_active: config.is_active,
            cultural_settings: {},
            flow_data: { nodes: [], connections: [] },
            advanced_settings: DEFAULT_ADVANCED_SETTINGS
        });
        setShowCreateForm(true);
    }, []);

    const cancelEditing = useCallback(() => {
        setShowCreateForm(false);
        setEditingConfig(null);
        resetForm();
    }, [resetForm]);

    return {
        // Data
        configs,
        templates,
        loading,
        selectedConfig,
        editingConfig,
        showCreateForm,
        formData,

        // Setters
        setSelectedConfig,
        setShowCreateForm,
        setFormData,

        // Operations
        loadConfigurations,
        loadTemplates,
        createConfiguration,
        updateConfiguration,
        deleteConfiguration,
        toggleConfigurationStatus,
        createFromTemplate,
        testConfiguration,
        resetForm,
        startEditing,
        cancelEditing
    };
}

export default useIVRManagement;
