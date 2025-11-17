'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Phone,
    Bot,
    Users,
    BarChart3,
    Shield,
    Globe,
    Mic,
    MessageSquare,
    Zap,
    Activity,
    Database,
    Headphones,
    Camera,
    Brain,
    Cloud,
    CheckCircle,
    Star,
    ArrowRight,
    Play,
    Volume2,
    Languages,
    Smartphone,
    Clock,
    TrendingUp
} from 'lucide-react';

export default function LandingPage() {
    const features = [
        {
            icon: Phone,
            title: 'Advanced IVR Management',
            description: 'Intelligent Interactive Voice Response system with AI-powered call routing and natural language processing.',
            benefits: ['24/7 Automated Support', 'Multi-language Support', 'Smart Call Routing']
        },
        {
            icon: Bot,
            title: 'AI Voice Agents',
            description: 'Conversational AI agents that understand context, handle complex queries, and provide personalized responses.',
            benefits: ['Natural Conversations', 'Context Awareness', 'Learning Capabilities']
        },
        {
            icon: Mic,
            title: 'Voice Cloning & Synthesis',
            description: 'Create realistic voice clones and generate high-quality speech synthesis for personalized communication.',
            benefits: ['Authentic Voice Replication', 'Multiple Languages', 'Real-time Generation']
        },
        {
            icon: Headphones,
            title: 'Voice Biometrics',
            description: 'Advanced voice authentication and verification using unique vocal characteristics.',
            benefits: ['Secure Authentication', 'Fraud Prevention', 'User Verification']
        },
        {
            icon: Globe,
            title: 'Cultural AI Adaptation',
            description: 'AI models trained on regional languages and cultural contexts for authentic communication.',
            benefits: ['Malayalam Language Support', 'Cultural Context', 'Regional Adaptation']
        },
        {
            icon: MessageSquare,
            title: 'Real-time Call Management',
            description: 'Monitor, manage, and analyze live calls with comprehensive dashboard and reporting tools.',
            benefits: ['Live Monitoring', 'Call Analytics', 'Performance Metrics']
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive analytics and insights for call performance, user behavior, and system optimization.',
            benefits: ['Performance Insights', 'Usage Analytics', 'Optimization Reports']
        },
        {
            icon: Shield,
            title: 'Enterprise Security',
            description: 'Bank-grade security with encryption, access controls, and compliance monitoring.',
            benefits: ['Data Encryption', 'Access Control', 'Compliance Ready']
        }
    ];

    const stats = [
        { number: '99.9%', label: 'Uptime', icon: Activity },
        { number: '50+', label: 'Languages', icon: Languages },
        { number: '1M+', label: 'Calls Handled', icon: Phone },
        { number: '24/7', label: 'Support', icon: Clock }
    ];

    const testimonials = [
        {
            name: 'Rajesh Kumar',
            role: 'CTO, TechCorp',
            content: 'FAIRGO IVR has transformed our customer service operations. The AI voice agents handle complex queries with remarkable accuracy.',
            rating: 5
        },
        {
            name: 'Priya Menon',
            role: 'Operations Manager, ServicePlus',
            content: 'The Malayalam language support and cultural adaptation features make this perfect for our regional market.',
            rating: 5
        },
        {
            name: 'Arun Nair',
            role: 'CEO, CommTech Solutions',
            content: 'Outstanding voice quality and real-time analytics. Our customer satisfaction has improved by 40% since implementation.',
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Navigation Header */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Bot className="h-8 w-8 text-blue-600 mr-3" />
                            <span className="text-xl font-bold text-gray-900">FAIRGO IVR</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
                            <a href="#benefits" className="text-gray-600 hover:text-blue-600 transition-colors">Benefits</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 transition-colors">Testimonials</a>
                            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => window.location.href = '/dashboard'}>
                                Dashboard
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                    <div className="text-center">
                        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
                            🚀 Next-Generation AI Communication Platform
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            FAIRGO IVR
                            <span className="block text-blue-600">Malayalam AI Communication</span>
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            Revolutionize customer interactions with our advanced AI-powered Interactive Voice Response system.
                            Featuring voice cloning, biometrics, cultural AI adaptation, and real-time analytics.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                                Get Started
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3">
                                <Play className="mr-2 h-5 w-5" />
                                Watch Demo
                            </Button>
                            <Button size="lg" variant="ghost" className="text-gray-600 hover:text-blue-600 px-8 py-3" onClick={() => window.location.href = '/dashboard'}>
                                Dashboard Login
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="flex justify-center mb-2">
                                <stat.icon className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                            <div className="text-gray-600">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
            </section >

        {/* Features Section */}
        <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Powerful Features for Modern Communication
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Experience the future of customer service with our comprehensive suite of AI-powered communication tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                        <feature.icon className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                </div>
                                <CardDescription className="text-gray-600">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {feature.benefits.map((benefit, benefitIndex) => (
                                        <li key={benefitIndex} className="flex items-center text-sm text-gray-700">
                                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            </section >

        {/* Benefits Section */}
        <section id="benefits" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                            Why Choose FAIRGO IVR?
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="p-2 bg-green-100 rounded-lg mr-4 mt-1">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Increase Efficiency</h3>
                                    <p className="text-gray-600">Automate routine inquiries and reduce response times by up to 80% with intelligent AI agents.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-blue-100 rounded-lg mr-4 mt-1">
                                    <Globe className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Relevance</h3>
                                    <p className="text-gray-600">Native Malayalam support with cultural context awareness for authentic customer experiences.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-purple-100 rounded-lg mr-4 mt-1">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                                    <p className="text-gray-600">Bank-grade security with voice biometrics, encryption, and compliance monitoring.</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="p-2 bg-orange-100 rounded-lg mr-4 mt-1">
                                    <BarChart3 className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                                    <p className="text-gray-600">Comprehensive analytics and reporting for continuous optimization and performance monitoring.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Communication?</h3>
                            <p className="mb-6 opacity-90">
                                Join thousands of businesses already using FAIRGO IVR to deliver exceptional customer experiences.
                            </p>
                            <Button className="bg-white text-blue-600 hover:bg-gray-100">
                                Start Free Trial
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            </section >

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        Trusted by Industry Leaders
                    </h2>
                    <p className="text-xl text-gray-600">
                        See what our customers say about their experience with FAIRGO IVR.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                            <CardContent className="p-6">
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                                <div>
                                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            </section >

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Ready to Revolutionize Your Customer Service?
                </h2>
                <p className="text-xl text-blue-100 mb-8">
                    Join the future of AI-powered communication. Start your free trial today and experience the difference.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3">
                        Start Free Trial
                    </Button>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3">
                        Schedule Demo
                    </Button>
                </div>
                <p className="text-blue-200 mt-4 text-sm">
                    No credit card required • 14-day free trial • Cancel anytime
                </p>
            </div>
            </section >

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center mb-4">
                            <Bot className="h-8 w-8 text-blue-400 mr-3" />
                            <span className="text-2xl font-bold">FAIRGO IVR</span>
                        </div>
                        <p className="text-gray-400 mb-4">
                            Next-generation AI communication platform for Malayalam-speaking markets.
                            Revolutionizing customer service with advanced voice AI technology.
                        </p>
                        <div className="flex space-x-4">
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-sm">📘</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-sm">🐦</span>
                            </div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-sm">💼</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Product</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Company</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 FAIRGO IVR. All rights reserved. Built with ❤️ for better communication.</p>
                </div>
            </div>
            </footer >
        </div >
    );
}