'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
    Search,
    Filter,
    Bot,
    Star,
    Users,
    Globe,
    MessageSquare,
    Phone,
    Brain,
    Zap,
    ShoppingCart,
    HeadphonesIcon,
    GraduationCap,
    Heart,
    Building,
    Car,
    Utensils,
    Music,
    Camera,
    Code,
    Plus,
    Download,
    Eye,
    ThumbsUp,
    Clock,
    TrendingUp
} from 'lucide-react';

interface AgentTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    icon: any;
    rating: number;
    downloads: number;
    lastUpdated: Date;
    author: string;
    isPremium: boolean;
    tags: string[];
    capabilities: string[];
    languages: string[];
    preview?: {
        samplePrompts: string[];
        responseStyle: string;
        personality: string;
    };
}

export default function AgentTemplates() {
    const [templates, setTemplates] = useState<AgentTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<AgentTemplate[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    const categories = [
        { id: 'all', name: 'All Templates', count: 24 },
        { id: 'customer-service', name: 'Customer Service', count: 8 },
        { id: 'sales', name: 'Sales & Marketing', count: 6 },
        { id: 'education', name: 'Education', count: 4 },
        { id: 'healthcare', name: 'Healthcare', count: 3 },
        { id: 'business', name: 'Business', count: 3 }
    ];

    useEffect(() => {
        // Mock data - replace with API call
        const mockTemplates: AgentTemplate[] = [
            {
                id: 'temp-1',
                name: 'Malayalam Customer Support Agent',
                description: 'Specialized customer support agent with deep understanding of Malayalam culture and business practices',
                category: 'customer-service',
                icon: HeadphonesIcon,
                rating: 4.8,
                downloads: 1250,
                lastUpdated: new Date('2024-01-15'),
                author: 'FairGo IMOS',
                isPremium: false,
                tags: ['Malayalam', 'Customer Service', 'Cultural Intelligence', 'Kerala'],
                capabilities: ['Natural Language Processing', 'Sentiment Analysis', 'Cultural Context', 'Multi-lingual Support'],
                languages: ['Malayalam', 'English', 'Manglish'],
                preview: {
                    samplePrompts: [
                        'സാധാരണ പ്രശ്നങ്ങൾക്ക് എങ്ങനെ സഹായിക്കാം?',
                        'How can I help with billing inquiries?',
                        'Product return and refund policies'
                    ],
                    responseStyle: 'Friendly, culturally aware, professional',
                    personality: 'Helpful Malayalam native speaker with business knowledge'
                }
            },
            {
                id: 'temp-2',
                name: 'Sales Conversion Specialist',
                description: 'AI agent optimized for lead qualification and sales conversion with Kerala market expertise',
                category: 'sales',
                icon: TrendingUp,
                rating: 4.6,
                downloads: 890,
                lastUpdated: new Date('2024-01-10'),
                author: 'FairGo IMOS',
                isPremium: true,
                tags: ['Sales', 'Lead Generation', 'Kerala Market', 'Business'],
                capabilities: ['Lead Qualification', 'Product Recommendations', 'Objection Handling', 'Follow-up Automation'],
                languages: ['Malayalam', 'English'],
                preview: {
                    samplePrompts: [
                        'Tell me about your product requirements',
                        'What is your budget range for this solution?',
                        'When are you planning to make a decision?'
                    ],
                    responseStyle: 'Persuasive, consultative, value-focused',
                    personality: 'Professional sales consultant with local market knowledge'
                }
            },
            {
                id: 'temp-3',
                name: 'Educational Tutor Bot',
                description: 'Malayalam-native educational assistant for students with curriculum support',
                category: 'education',
                icon: GraduationCap,
                rating: 4.9,
                downloads: 2100,
                lastUpdated: new Date('2024-01-20'),
                author: 'Education Partner',
                isPremium: false,
                tags: ['Education', 'Malayalam Medium', 'CBSE', 'State Board'],
                capabilities: ['Subject Tutoring', 'Homework Help', 'Exam Preparation', 'Progress Tracking'],
                languages: ['Malayalam', 'English'],
                preview: {
                    samplePrompts: [
                        'Math problem solving assistance',
                        'Science concept explanations',
                        'Language grammar help'
                    ],
                    responseStyle: 'Patient, encouraging, educational',
                    personality: 'Knowledgeable tutor with teaching experience'
                }
            },
            {
                id: 'temp-4',
                name: 'Healthcare Assistant',
                description: 'Medical consultation and health information assistant with Malayalam support',
                category: 'healthcare',
                icon: Heart,
                rating: 4.7,
                downloads: 1450,
                lastUpdated: new Date('2024-01-18'),
                author: 'HealthTech Solutions',
                isPremium: true,
                tags: ['Healthcare', 'Medical', 'Consultation', 'Malayalam'],
                capabilities: ['Symptom Assessment', 'Health Information', 'Appointment Scheduling', 'Medication Reminders'],
                languages: ['Malayalam', 'English'],
                preview: {
                    samplePrompts: [
                        'Health symptom consultation',
                        'Medication information requests',
                        'Appointment scheduling assistance'
                    ],
                    responseStyle: 'Professional, caring, medically accurate',
                    personality: 'Experienced healthcare professional'
                }
            },
            {
                id: 'temp-5',
                name: 'Restaurant Booking Agent',
                description: 'Specialized agent for restaurant reservations with Kerala cuisine knowledge',
                category: 'business',
                icon: Utensils,
                rating: 4.5,
                downloads: 680,
                lastUpdated: new Date('2024-01-12'),
                author: 'Hospitality Solutions',
                isPremium: false,
                tags: ['Restaurant', 'Booking', 'Kerala Cuisine', 'Hospitality'],
                capabilities: ['Table Reservations', 'Menu Information', 'Special Requests', 'Event Planning'],
                languages: ['Malayalam', 'English'],
                preview: {
                    samplePrompts: [
                        'Table reservation for 4 people',
                        'What are today\'s special dishes?',
                        'Do you have vegetarian options?'
                    ],
                    responseStyle: 'Friendly, accommodating, knowledgeable',
                    personality: 'Experienced restaurant host'
                }
            },
            {
                id: 'temp-6',
                name: 'Travel Booking Assistant',
                description: 'Kerala tourism and travel booking specialist with local insights',
                category: 'business',
                icon: Car,
                rating: 4.4,
                downloads: 920,
                lastUpdated: new Date('2024-01-14'),
                author: 'Tourism Kerala',
                isPremium: false,
                tags: ['Travel', 'Tourism', 'Kerala', 'Booking'],
                capabilities: ['Travel Planning', 'Hotel Booking', 'Tour Packages', 'Local Recommendations'],
                languages: ['Malayalam', 'English', 'Hindi'],
                preview: {
                    samplePrompts: [
                        'Plan a Kerala backwater tour',
                        'Best time to visit Munnar',
                        'Budget travel packages available'
                    ],
                    responseStyle: 'Enthusiastic, informative, local expert',
                    personality: 'Knowledgeable travel guide with local expertise'
                }
            }
        ];

        setTemplates(mockTemplates);
        setFilteredTemplates(mockTemplates);
    }, []);

    useEffect(() => {
        let filtered = templates;

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(template => template.category === selectedCategory);
        }

        setFilteredTemplates(filtered);
    }, [searchQuery, selectedCategory, templates]);

    const handleUseTemplate = (template: AgentTemplate) => {
        // This would redirect to agent builder with template pre-filled
        console.log('Using template:', template.name);
        // router.push(`/ai-agents/builder?template=${template.id}`);
    };

    const handlePreview = (template: AgentTemplate) => {
        setSelectedTemplate(template);
        setShowPreview(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">AI Agent Templates</h1>
                    <p className="text-gray-600 mt-1">Pre-built AI agents optimized for Malayalam culture and Kerala business needs</p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Template
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-48">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name} ({category.count})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => {
                    const IconComponent = template.icon;
                    return (
                        <Card key={template.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <IconComponent className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{template.name}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm text-gray-600">{template.rating}</span>
                                                </div>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-sm text-gray-600">{template.downloads} downloads</span>
                                            </div>
                                        </div>
                                    </div>
                                    {template.isPremium && (
                                        <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                                            Premium
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="mb-4">{template.description}</CardDescription>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {template.tags.slice(0, 3).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                    {template.tags.length > 3 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{template.tags.length - 3} more
                                        </Badge>
                                    )}
                                </div>

                                {/* Languages */}
                                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                                    <Globe className="h-4 w-4" />
                                    <span>{template.languages.join(', ')}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        className="flex-1"
                                        onClick={() => handleUseTemplate(template)}
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Use Template
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePreview(template)}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Author and Date */}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                                    <span>by {template.author}</span>
                                    <span>Updated {template.lastUpdated.toLocaleDateString()}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Template Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {selectedTemplate && (
                                <>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <selectedTemplate.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    {selectedTemplate.name}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedTemplate?.description}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTemplate && (
                        <div className="space-y-6">
                            {/* Capabilities */}
                            <div>
                                <h4 className="font-medium mb-2">Capabilities</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedTemplate.capabilities.map((capability) => (
                                        <Badge key={capability} variant="secondary">
                                            {capability}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Preview */}
                            {selectedTemplate.preview && (
                                <div>
                                    <h4 className="font-medium mb-2">Preview</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700">Sample Prompts:</h5>
                                            <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                                {selectedTemplate.preview.samplePrompts.map((prompt, index) => (
                                                    <li key={index}>{prompt}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700">Response Style:</h5>
                                            <p className="text-sm text-gray-600">{selectedTemplate.preview.responseStyle}</p>
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-gray-700">Personality:</h5>
                                            <p className="text-sm text-gray-600">{selectedTemplate.preview.personality}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <Button
                                    className="flex-1"
                                    onClick={() => {
                                        handleUseTemplate(selectedTemplate);
                                        setShowPreview(false);
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Use This Template
                                </Button>
                                <Button variant="outline" onClick={() => setShowPreview(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}