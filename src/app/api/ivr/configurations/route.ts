/**
 * IVR Configuration CRUD API
 * Complete management of IVR flow configurations, settings, and templates
 * Supports Malayalam-first configurations with cultural intelligence
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface CreateIVRConfigRequest {
    name: string;
    description?: string;
    flow_type: 'customer_service' | 'sales' | 'support' | 'survey' | 'custom';
    language: string;
    dialect?: string;
    cultural_settings?: Record<string, any>;
    flow_data: Record<string, any>;
    is_active?: boolean;
    is_template?: boolean;
}

interface UpdateIVRConfigRequest {
    name?: string;
    description?: string;
    flow_data?: Record<string, any>;
    cultural_settings?: Record<string, any>;
    is_active?: boolean;
    performance_settings?: Record<string, any>;
    metadata?: Record<string, any>;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const configId = searchParams.get('config_id');
        const action = searchParams.get('action') || 'configs';

        switch (action) {
            case 'configs':
                if (configId) {
                    return await getIVRConfig(configId);
                }
                return await listIVRConfigs(searchParams);

            case 'templates':
                return await getIVRTemplates(searchParams);

            case 'cultural_settings':
                return await getCulturalSettings(searchParams);

            case 'performance':
                return await getConfigPerformance(searchParams);

            case 'validate':
                if (!configId) {
                    return NextResponse.json(
                        { error: 'config_id is required for validation' },
                        { status: 400 }
                    );
                }
                return await validateConfig(configId);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in IVR config GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action') || 'create';
        const body = await request.json();

        switch (action) {
            case 'create':
                return await createIVRConfig(body);

            case 'clone':
                return await cloneIVRConfig(body);

            case 'template':
                return await createFromTemplate(body);

            case 'import':
                return await importIVRConfig(body);

            case 'test':
                return await testIVRConfig(body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in IVR config POST:', error);
        return NextResponse.json(
            { error: 'Failed to create configuration' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const configId = searchParams.get('config_id');
        const action = searchParams.get('action') || 'update';

        if (!configId) {
            return NextResponse.json(
                { error: 'config_id is required' },
                { status: 400 }
            );
        }

        const body = await request.json();

        switch (action) {
            case 'update':
                return await updateIVRConfig(configId, body);

            case 'activate':
                return await activateConfig(configId);

            case 'deactivate':
                return await deactivateConfig(configId);

            case 'cultural_settings':
                return await updateCulturalSettings(configId, body);

            case 'performance':
                return await updatePerformanceSettings(configId, body);

            default:
                return NextResponse.json(
                    { error: 'Invalid action parameter' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error in IVR config PUT:', error);
        return NextResponse.json(
            { error: 'Failed to update configuration' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const configId = searchParams.get('config_id');
        const permanent = searchParams.get('permanent') === 'true';

        if (!configId) {
            return NextResponse.json(
                { error: 'config_id is required' },
                { status: 400 }
            );
        }

        return await deleteIVRConfig(configId, permanent);
    } catch (error) {
        console.error('Error in IVR config DELETE:', error);
        return NextResponse.json(
            { error: 'Failed to delete configuration' },
            { status: 500 }
        );
    }
}

// Implementation functions

async function createIVRConfig(data: CreateIVRConfigRequest) {
    // Validate required fields
    if (!data.name || !data.flow_data) {
        return NextResponse.json(
            { error: 'name and flow_data are required' },
            { status: 400 }
        );
    }

    // Create configuration in EngineConfiguration table
    const config = await db.engineConfiguration.create({
        data: {
            engineType: 'ivr_flow',
            version: '1.0.0',
            config: JSON.stringify({
                name: data.name,
                description: data.description,
                flow_type: data.flow_type || 'custom',
                language: data.language || 'ml',
                dialect: data.dialect || 'central_kerala',
                flow_data: data.flow_data,
                is_template: data.is_template || false,
                created_by: 'system',
                created_at: new Date().toISOString()
            }),
            status: data.is_active ? 'active' : 'disabled',
            isDefault: false,
            culturalSettings: JSON.stringify(data.cultural_settings || {
                malayalam_priority: true,
                cultural_greetings: true,
                respect_markers: true,
                festival_awareness: true,
                dialect_adaptation: data.dialect || 'central_kerala'
            }),
            performanceThresholds: JSON.stringify({
                response_time_ms: 2000,
                confidence_threshold: 0.8,
                malayalam_accuracy_threshold: 0.85,
                cultural_alignment_threshold: 0.8
            })
        }
    });

    // Create associated workflow if flow_data contains nodes
    if (data.flow_data.nodes && Array.isArray(data.flow_data.nodes)) {
        const workflow = await db.workflow.create({
            data: {
                name: data.name,
                description: data.description,
                category: data.flow_type?.toUpperCase() || 'CUSTOM',
                isActive: data.is_active ?? true
            }
        });

        // Create workflow nodes
        for (let i = 0; i < data.flow_data.nodes.length; i++) {
            const nodeData = data.flow_data.nodes[i];
            await db.workflowNode.create({
                data: {
                    workflowId: workflow.id,
                    type: nodeData.type || 'action',
                    config: JSON.stringify(nodeData.config || {}),
                    position: i,
                    label: nodeData.label || `Node ${i + 1}`,
                    description: nodeData.description
                }
            });
        }
    }

    return NextResponse.json({
        success: true,
        config: {
            id: config.id,
            name: data.name,
            flow_type: data.flow_type,
            language: data.language,
            dialect: data.dialect,
            status: config.status,
            is_active: config.status === 'active',
            created_at: config.createdAt.toISOString(),
            cultural_enabled: !!data.cultural_settings
        }
    }, { status: 201 });
}

async function getIVRConfig(configId: string) {
    const config = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    // Parse configuration data
    const configData = JSON.parse(config.config);
    const culturalSettings = JSON.parse(config.culturalSettings || '{}');
    const performanceThresholds = JSON.parse(config.performanceThresholds || '{}');

    // Get associated workflow if exists
    const associatedWorkflow = await db.workflow.findFirst({
        where: { name: configData.name },
        include: {
            nodes: {
                include: {
                    sourceConnections: true,
                    targetConnections: true
                }
            }
        }
    });

    // Get usage statistics
    const usageStats = await db.engineExecution.aggregate({
        where: {
            engineType: 'ivr_flow',
            inputData: {
                contains: configId
            }
        },
        _count: { id: true },
        _avg: {
            executionTime: true,
            culturalAlign: true,
            responseTime: true
        }
    });

    return NextResponse.json({
        success: true,
        config: {
            id: config.id,
            name: configData.name,
            description: configData.description,
            flow_type: configData.flow_type,
            language: configData.language,
            dialect: configData.dialect,
            version: config.version,
            status: config.status,
            is_active: config.status === 'active',
            is_default: config.isDefault,
            is_template: configData.is_template,

            // Configuration data
            flow_data: configData.flow_data,
            cultural_settings: culturalSettings,
            performance_thresholds: performanceThresholds,

            // Associated workflow
            workflow: associatedWorkflow ? {
                id: associatedWorkflow.id,
                name: associatedWorkflow.name,
                node_count: associatedWorkflow.nodes.length,
                connection_count: associatedWorkflow.nodes.reduce(
                    (acc, node) => acc + node.sourceConnections.length,
                    0
                )
            } : null,

            // Usage statistics
            usage_stats: {
                total_executions: usageStats._count.id,
                avg_execution_time: usageStats._avg.executionTime || 0,
                avg_cultural_alignment: usageStats._avg.culturalAlign || 0,
                avg_response_time: usageStats._avg.responseTime || 0
            },

            // Metadata
            created_at: config.createdAt.toISOString(),
            updated_at: config.updatedAt.toISOString(),
            activated_at: config.activatedAt?.toISOString()
        }
    });
}

async function listIVRConfigs(searchParams: URLSearchParams) {
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const flow_type = searchParams.get('flow_type');
    const language = searchParams.get('language');
    const is_template = searchParams.get('is_template');
    const search = searchParams.get('search');

    const whereClause: any = {
        engineType: 'ivr_flow'
    };

    if (status) {
        whereClause.status = status;
    }

    const [configs, totalCount] = await Promise.all([
        db.engineConfiguration.findMany({
            where: whereClause,
            orderBy: { updatedAt: 'desc' },
            take: limit,
            skip: offset
        }),
        db.engineConfiguration.count({ where: whereClause })
    ]);

    // Filter and format configs
    const formattedConfigs = configs
        .map(config => {
            const configData = JSON.parse(config.config);
            const culturalSettings = JSON.parse(config.culturalSettings || '{}');

            return {
                id: config.id,
                name: configData.name,
                description: configData.description,
                flow_type: configData.flow_type,
                language: configData.language,
                dialect: configData.dialect,
                version: config.version,
                status: config.status,
                is_active: config.status === 'active',
                is_default: config.isDefault,
                is_template: configData.is_template,
                cultural_enabled: Object.keys(culturalSettings).length > 0,
                malayalam_priority: culturalSettings.malayalam_priority,
                created_at: config.createdAt.toISOString(),
                updated_at: config.updatedAt.toISOString()
            };
        })
        .filter(config => {
            // Apply client-side filters
            if (flow_type && config.flow_type !== flow_type) return false;
            if (language && config.language !== language) return false;
            if (is_template !== null && config.is_template !== (is_template === 'true')) return false;
            if (search && !config.name.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        });

    return NextResponse.json({
        success: true,
        configs: formattedConfigs,
        pagination: {
            total_count: totalCount,
            limit,
            offset,
            has_more: offset + limit < totalCount
        }
    });
}

async function updateIVRConfig(configId: string, updates: UpdateIVRConfigRequest) {
    const existingConfig = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!existingConfig) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    const existingConfigData = JSON.parse(existingConfig.config);
    const existingCulturalSettings = JSON.parse(existingConfig.culturalSettings || '{}');
    const existingPerformanceSettings = JSON.parse(existingConfig.performanceThresholds || '{}');

    // Prepare updated configuration
    const updatedConfigData = {
        ...existingConfigData,
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.flow_data && { flow_data: updates.flow_data }),
        updated_at: new Date().toISOString(),
        updated_by: 'system'
    };

    const updatedCulturalSettings = {
        ...existingCulturalSettings,
        ...updates.cultural_settings
    };

    const updatedPerformanceSettings = {
        ...existingPerformanceSettings,
        ...updates.performance_settings
    };

    // Update configuration
    const updatedConfig = await db.engineConfiguration.update({
        where: { id: configId },
        data: {
            config: JSON.stringify(updatedConfigData),
            culturalSettings: JSON.stringify(updatedCulturalSettings),
            performanceThresholds: JSON.stringify(updatedPerformanceSettings),
            status: updates.is_active !== undefined
                ? (updates.is_active ? 'active' : 'disabled')
                : undefined,
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        config: {
            id: updatedConfig.id,
            name: updatedConfigData.name,
            status: updatedConfig.status,
            updated_at: updatedConfig.updatedAt.toISOString()
        }
    });
}

async function deleteIVRConfig(configId: string, permanent: boolean = false) {
    const config = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    if (permanent) {
        // Check for dependencies
        const executionCount = await db.engineExecution.count({
            where: {
                inputData: {
                    contains: configId
                }
            }
        });

        if (executionCount > 0) {
            return NextResponse.json(
                { error: 'Cannot delete configuration with execution history' },
                { status: 400 }
            );
        }

        // Delete associated workflows
        const configData = JSON.parse(config.config);
        await db.workflow.deleteMany({
            where: { name: configData.name }
        });

        // Delete configuration
        await db.engineConfiguration.delete({
            where: { id: configId }
        });

        return NextResponse.json({
            success: true,
            message: 'Configuration permanently deleted'
        });
    } else {
        // Soft delete - mark as disabled
        await db.engineConfiguration.update({
            where: { id: configId },
            data: {
                status: 'disabled',
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Configuration disabled'
        });
    }
}

async function getIVRTemplates(searchParams: URLSearchParams) {
    const language = searchParams.get('language') || 'ml';
    const flow_type = searchParams.get('flow_type');

    const templates = [
        {
            id: 'malayalam_customer_service',
            name: 'Malayalam Customer Service',
            description: 'Complete customer service flow with Malayalam cultural intelligence',
            flow_type: 'customer_service',
            language: 'ml',
            dialect: 'central_kerala',
            cultural_features: [
                'Cultural greetings',
                'Respect markers',
                'Festival awareness',
                'Dialect adaptation'
            ],
            flow_data: {
                nodes: [
                    {
                        type: 'greeting',
                        label: 'Malayalam Greeting',
                        config: {
                            message: 'നമസ്‌കാരം, ഞങ്ങളുടെ സേവനത്തിലേക്ക് സ്വാഗതം',
                            cultural_tone: 'respectful',
                            dialect_adaptive: true
                        }
                    },
                    {
                        type: 'language_detect',
                        label: 'Language Detection',
                        config: {
                            supported_languages: ['ml', 'en'],
                            fallback_language: 'ml'
                        }
                    },
                    {
                        type: 'menu',
                        label: 'Service Menu',
                        config: {
                            options: [
                                { key: '1', label: 'ഉൽപ്പാദന സഹായം', value: 'product_support' },
                                { key: '2', label: 'ബില്ലിംഗ് അന്വേഷണം', value: 'billing' },
                                { key: '3', label: 'പുതിയ കണക്ഷൻ', value: 'new_connection' },
                                { key: '0', label: 'ഓപ്പറേറ്ററുമായി സംസാരിക്കുക', value: 'operator' }
                            ]
                        }
                    }
                ]
            }
        },
        {
            id: 'malayalam_sales',
            name: 'Malayalam Sales Flow',
            description: 'Sales and lead generation flow with cultural sensitivity',
            flow_type: 'sales',
            language: 'ml',
            dialect: 'malabar',
            cultural_features: [
                'Regional dialects',
                'Business etiquette',
                'Trust building',
                'Cultural references'
            ],
            flow_data: {
                nodes: [
                    {
                        type: 'greeting',
                        label: 'Sales Greeting',
                        config: {
                            message: 'വന്ദനങ്ങൾ, നിങ്ങളുടെ വ്യാപാര ആവശ്യങ്ങൾക്ക് ഞങ്ങൾ എങ്ങനെ സഹായിക്കും?',
                            tone: 'professional_friendly'
                        }
                    }
                ]
            }
        },
        {
            id: 'multilingual_support',
            name: 'Multilingual Support Flow',
            description: 'Supports Malayalam, English, and Hindi with code-switching',
            flow_type: 'support',
            language: 'ml',
            cultural_features: [
                'Multi-language support',
                'Code-switching detection',
                'Cultural context preservation',
                'Language preference learning'
            ],
            flow_data: {
                nodes: [
                    {
                        type: 'language_selection',
                        label: 'Language Choice',
                        config: {
                            prompt: 'Please select your preferred language / നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക / कृपया अपनी भाषा चुनें',
                            options: [
                                { key: '1', label: 'മലയാളം', value: 'ml' },
                                { key: '2', label: 'English', value: 'en' },
                                { key: '3', label: 'हिंदी', value: 'hi' }
                            ]
                        }
                    }
                ]
            }
        }
    ];

    // Filter templates
    const filteredTemplates = templates.filter(template => {
        if (language && template.language !== language) return false;
        if (flow_type && template.flow_type !== flow_type) return false;
        return true;
    });

    return NextResponse.json({
        success: true,
        templates: filteredTemplates
    });
}

async function createFromTemplate(data: { template_id: string; name: string; customizations?: any }) {
    const templates = await getIVRTemplates(new URLSearchParams());
    const templatesData = await templates.json();

    const template = templatesData.templates.find((t: any) => t.id === data.template_id);
    if (!template) {
        return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
        );
    }

    // Create configuration from template
    const configData: CreateIVRConfigRequest = {
        name: data.name,
        description: `${template.description} (from template)`,
        flow_type: template.flow_type,
        language: template.language,
        dialect: template.dialect,
        cultural_settings: {
            malayalam_priority: true,
            cultural_greetings: true,
            respect_markers: true,
            festival_awareness: true,
            dialect_adaptation: template.dialect,
            ...data.customizations?.cultural_settings
        },
        flow_data: {
            ...template.flow_data,
            ...data.customizations?.flow_data
        },
        is_active: true,
        is_template: false
    };

    return await createIVRConfig(configData);
}

async function cloneIVRConfig(data: { source_config_id: string; name: string; modifications?: any }) {
    const sourceConfig = await db.engineConfiguration.findUnique({
        where: { id: data.source_config_id }
    });

    if (!sourceConfig) {
        return NextResponse.json(
            { error: 'Source configuration not found' },
            { status: 404 }
        );
    }

    const sourceConfigData = JSON.parse(sourceConfig.config);
    const sourceCulturalSettings = JSON.parse(sourceConfig.culturalSettings || '{}');

    // Create cloned configuration
    const clonedConfigData: CreateIVRConfigRequest = {
        name: data.name,
        description: `${sourceConfigData.description} (cloned)`,
        flow_type: sourceConfigData.flow_type,
        language: sourceConfigData.language,
        dialect: sourceConfigData.dialect,
        cultural_settings: {
            ...sourceCulturalSettings,
            ...data.modifications?.cultural_settings
        },
        flow_data: {
            ...sourceConfigData.flow_data,
            ...data.modifications?.flow_data
        },
        is_active: false, // Start as inactive
        is_template: false
    };

    return await createIVRConfig(clonedConfigData);
}

async function validateConfig(configId: string) {
    if (!configId) {
        return NextResponse.json(
            { error: 'config_id is required' },
            { status: 400 }
        );
    }

    const config = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    const configData = JSON.parse(config.config);
    const validation = {
        is_valid: true,
        errors: [] as string[],
        warnings: [] as string[],
        suggestions: [] as string[]
    };

    // Validate flow data
    if (!configData.flow_data || !configData.flow_data.nodes) {
        validation.is_valid = false;
        validation.errors.push('Flow data must contain nodes');
    }

    // Check for Malayalam cultural settings
    if (configData.language === 'ml') {
        const culturalSettings = JSON.parse(config.culturalSettings || '{}');
        if (!culturalSettings.malayalam_priority) {
            validation.warnings.push('Malayalam priority not enabled for Malayalam language configuration');
        }
        if (!culturalSettings.dialect_adaptation) {
            validation.warnings.push('Dialect adaptation not configured');
        }
    }

    // Check performance thresholds
    const performanceSettings = JSON.parse(config.performanceThresholds || '{}');
    if (!performanceSettings.response_time_ms || performanceSettings.response_time_ms > 3000) {
        validation.suggestions.push('Consider setting response time threshold under 3000ms for better user experience');
    }

    return NextResponse.json({
        success: true,
        config_id: configId,
        validation
    });
}

// Additional missing functions

async function getCulturalSettings(searchParams: URLSearchParams) {
    const language = searchParams.get('language') || 'ml';

    const culturalSettings = {
        language: language,
        dialect_support: {
            central_kerala: true,
            northern_kerala: true,
            southern_kerala: true,
            malabar: true
        },
        respect_levels: {
            formal: 'avar/ningal forms',
            respectful: 'standard polite forms',
            casual: 'intimate/peer forms'
        },
        cultural_contexts: {
            festivals: ['onam', 'vishu', 'eid', 'christmas'],
            seasons: ['monsoon', 'summer', 'winter'],
            regional_customs: true
        },
        code_switching: {
            malayalam_english: true,
            manglish_support: true,
            technical_terms: 'english_preferred'
        }
    };

    return NextResponse.json({
        success: true,
        cultural_settings: culturalSettings
    });
}

async function getConfigPerformance(searchParams: URLSearchParams) {
    const configId = searchParams.get('config_id');
    const timeframe = searchParams.get('timeframe') || '7d';

    // Mock performance data
    const performance = {
        config_id: configId,
        timeframe: timeframe,
        metrics: {
            total_calls: 1200,
            success_rate: 0.89,
            average_completion_time: 180,
            cultural_accuracy: 0.87,
            user_satisfaction: 4.2
        },
        trending: {
            success_rate: 'improving',
            completion_time: 'stable',
            cultural_accuracy: 'improving'
        },
        bottlenecks: [
            { step: 'speech_recognition', avg_time: 2.3, issue: 'dialect_processing' },
            { step: 'cultural_analysis', avg_time: 1.8, issue: 'context_lookup' }
        ]
    };

    return NextResponse.json({
        success: true,
        performance: performance
    });
}

async function importIVRConfig(data: { config_data: any; name?: string }) {
    const importedConfig = {
        name: data.name || data.config_data.name || 'Imported Configuration',
        description: data.config_data.description || 'Imported from external source',
        category: data.config_data.category || 'GENERAL',
        flow_type: data.config_data.flow_type || 'standard',
        language: data.config_data.language || 'ml',
        flow_data: data.config_data.flow_data || {},
        cultural_settings: data.config_data.cultural_settings || {},
        is_active: false // Always import as inactive for safety
    };

    return await createIVRConfig(importedConfig);
}

async function testIVRConfig(data: { config_id: string; test_scenarios?: any[] }) {
    const config = await db.engineConfiguration.findUnique({
        where: { id: data.config_id }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    // Mock test execution
    const testResults = {
        config_id: data.config_id,
        test_executed_at: new Date().toISOString(),
        scenarios_tested: data.test_scenarios?.length || 3,
        results: {
            passed: 2,
            failed: 1,
            warnings: 0
        },
        details: [
            { scenario: 'basic_greeting', status: 'passed', time: 1.2 },
            { scenario: 'cultural_context', status: 'passed', time: 2.1 },
            { scenario: 'error_handling', status: 'failed', time: 0.8, error: 'Timeout on fallback' }
        ]
    };

    return NextResponse.json({
        success: true,
        test_results: testResults
    });
}

async function activateConfig(configId: string) {
    const updated = await db.engineConfiguration.update({
        where: { id: configId },
        data: {
            isActive: true,
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        config_id: configId,
        status: 'activated',
        updated_at: updated.updatedAt.toISOString()
    });
}

async function deactivateConfig(configId: string) {
    const updated = await db.engineConfiguration.update({
        where: { id: configId },
        data: {
            isActive: false,
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        config_id: configId,
        status: 'deactivated',
        updated_at: updated.updatedAt.toISOString()
    });
}

async function updateCulturalSettings(configId: string, data: any) {
    const config = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    const currentConfig = JSON.parse(config.config || '{}');
    const updatedConfig = {
        ...currentConfig,
        cultural_settings: {
            ...currentConfig.cultural_settings,
            ...data.cultural_settings
        }
    };

    const updated = await db.engineConfiguration.update({
        where: { id: configId },
        data: {
            config: JSON.stringify(updatedConfig),
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        config_id: configId,
        cultural_settings_updated: true
    });
}

async function updatePerformanceSettings(configId: string, data: any) {
    const config = await db.engineConfiguration.findUnique({
        where: { id: configId }
    });

    if (!config) {
        return NextResponse.json(
            { error: 'Configuration not found' },
            { status: 404 }
        );
    }

    const currentConfig = JSON.parse(config.config || '{}');
    const updatedConfig = {
        ...currentConfig,
        performance_settings: {
            ...currentConfig.performance_settings,
            ...data.performance_settings
        }
    };

    const updated = await db.engineConfiguration.update({
        where: { id: configId },
        data: {
            config: JSON.stringify(updatedConfig),
            updatedAt: new Date()
        }
    });

    return NextResponse.json({
        success: true,
        config_id: configId,
        performance_settings_updated: true
    });
}