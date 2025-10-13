import { NextRequest, NextResponse } from "next/server";
import type { AgentTemplate } from "@/types/ai-agent";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const language = searchParams.get("language") || "all";

    let templates = getAgentTemplates();

    // Filter by category
    if (category && category !== "all") {
      templates = templates.filter(
        (template) => template.category === category
      );
    }

    // Filter by language support
    if (language === "malayalam") {
      templates = templates.filter(
        (template) => template.configuration?.malayalamSupport?.enabled ?? false
      );
    }

    return NextResponse.json({
      templates,
      categories: getTemplateCategories(),
      totalCount: templates.length,
    });
  } catch (error: unknown) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

function getAgentTemplates(): AgentTemplate[] {
  return [
    // 1. Healthcare Malayalam Assistant
    {
      id: "template_healthcare_malayalam",
      name: "Healthcare Malayalam Assistant", 
      description: "Specialized medical assistant with Kerala healthcare knowledge and Malayalam cultural sensitivity",
      category: "healthcare",
      tags: ["healthcare", "malayalam", "medical", "kerala", "ayurveda", "telemedicine"],
      isPopular: true,
      usageCount: 245,
      useCases: ["Medical consultations", "Health advice", "Symptom assessment", "Appointment booking"],
      difficulty: "intermediate",
      industries: ["Healthcare", "Medical Services", "Telemedicine"],
      estimatedCost: 15,
      setupTime: "10-15 minutes",
      configuration: {
        persona: {
          name: "Dr. Priya",
          role: "Healthcare Assistant",
          personality: "caring, knowledgeable, culturally sensitive",
          expertise: ["general medicine", "ayurveda", "preventive care", "mental health", "women's health"],
          communicationStyle: "professional",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 2. Legal Advisory Bot
    {
      id: "template_legal_advisory",
      name: "Legal Advisory Bot",
      description: "Kerala law expert providing legal guidance in Malayalam and English",
      category: "legal",
      tags: ["legal", "malayalam", "kerala", "consultation", "advice"],
      isPopular: true,
      usageCount: 189,
      useCases: ["Legal consultations", "Document review", "Rights information", "Legal procedures"],
      difficulty: "advanced",
      industries: ["Legal Services", "Government", "NGO"],
      estimatedCost: 25,
      setupTime: "15-20 minutes",
      configuration: {
        persona: {
          name: "Advocate Krishnan",
          role: "Legal Advisor",
          personality: "professional, thorough, ethical",
          expertise: ["kerala law", "family law", "property law", "consumer rights", "civil matters"],
          communicationStyle: "professional",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 3. Education Counselor
    {
      id: "template_education_counselor",
      name: "Education Counselor",
      description: "Academic guidance with Kerala education system knowledge",
      category: "education", 
      tags: ["education", "malayalam", "kerala", "counseling", "career"],
      isPopular: true,
      usageCount: 156,
      useCases: ["Career guidance", "Academic planning", "Scholarship assistance", "Study abroad"],
      difficulty: "beginner",
      industries: ["Education", "Training", "Consultancy"],
      estimatedCost: 10,
      setupTime: "5-10 minutes",
      configuration: {
        persona: {
          name: "Teacher Lakshmi",
          role: "Education Counselor",
          personality: "patient, encouraging, knowledgeable",
          expertise: ["kerala education", "career guidance", "academic planning", "scholarship info"],
          communicationStyle: "friendly",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 4. Ecommerce Support
    {
      id: "template_ecommerce_support",
      name: "Ecommerce Support",
      description: "Shopping assistance with Kerala local preferences",
      category: "ecommerce",
      tags: ["ecommerce", "malayalam", "shopping", "kerala", "support"],
      isPopular: true,
      usageCount: 312,
      useCases: ["Product recommendations", "Order assistance", "Local shopping", "Gift suggestions"],
      difficulty: "beginner",
      industries: ["Retail", "Ecommerce", "Local Business"],
      estimatedCost: 8,
      setupTime: "5 minutes",
      configuration: {
        persona: {
          name: "Sales Associate Ravi",
          role: "Shopping Assistant",
          personality: "helpful, friendly, knowledgeable about local preferences",
          expertise: ["kerala products", "local brands", "festival shopping", "traditional items"],
          communicationStyle: "friendly",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: false,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 5. Financial Advisor
    {
      id: "template_financial_advisor",
      name: "Financial Advisor",
      description: "Banking and finance guidance with cultural awareness",
      category: "finance",
      tags: ["finance", "malayalam", "banking", "investment", "kerala"],
      isPopular: true,
      usageCount: 198,
      useCases: ["Investment advice", "Banking services", "Loan guidance", "Financial planning"],
      difficulty: "intermediate",
      industries: ["Banking", "Finance", "Insurance"],
      estimatedCost: 20,
      setupTime: "10-15 minutes",
      configuration: {
        persona: {
          name: "Financial Advisor Suresh",
          role: "Financial Consultant",
          personality: "trustworthy, knowledgeable, explains complex terms simply",
          expertise: ["banking", "investments", "insurance", "kerala financial schemes", "gold loans"],
          communicationStyle: "professional",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 6. Travel Concierge
    {
      id: "template_travel_concierge",
      name: "Travel Concierge",
      description: "Kerala tourism and travel planning expert",
      category: "travel",
      tags: ["travel", "malayalam", "kerala", "tourism", "planning"],
      isPopular: true,
      usageCount: 267,
      useCases: ["Trip planning", "Local attractions", "Cultural experiences", "Travel bookings"],
      difficulty: "beginner",
      industries: ["Tourism", "Hospitality", "Travel Agencies"],
      estimatedCost: 12,
      setupTime: "5-10 minutes",
      configuration: {
        persona: {
          name: "Travel Guide Maya",
          role: "Travel Concierge",
          personality: "enthusiastic, informative, storytelling",
          expertise: ["kerala tourism", "backwaters", "hill stations", "cultural sites", "local experiences"],
          communicationStyle: "friendly",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: false,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 7. Government Services
    {
      id: "template_government_services",
      name: "Government Services",
      description: "Citizen services with Malayalam support",
      category: "government",
      tags: ["government", "malayalam", "citizen services", "kerala", "procedures"],
      isPopular: false,
      usageCount: 134,
      useCases: ["Service information", "Document procedures", "Online applications", "Status tracking"],
      difficulty: "intermediate",
      industries: ["Government", "Public Services", "Administrative"],
      estimatedCost: 18,
      setupTime: "10-15 minutes",
      configuration: {
        persona: {
          name: "Officer Radhika",
          role: "Government Service Assistant",
          personality: "helpful, procedural, patient with complex requirements",
          expertise: ["government procedures", "citizen services", "documentation", "online services"],
          communicationStyle: "formal",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 8. Real Estate Agent
    {
      id: "template_real_estate_agent",
      name: "Real Estate Agent",
      description: "Property assistance with local knowledge",
      category: "real_estate",
      tags: ["real estate", "malayalam", "property", "kerala", "investment"],
      isPopular: false,
      usageCount: 98,
      useCases: ["Property search", "Market analysis", "Investment advice", "Legal guidance"],
      difficulty: "intermediate",
      industries: ["Real Estate", "Construction", "Investment"],
      estimatedCost: 22,
      setupTime: "10-15 minutes",
      configuration: {
        persona: {
          name: "Property Consultant Anil",
          role: "Real Estate Agent",
          personality: "professional, informative, honest about market realities",
          expertise: ["kerala property", "market trends", "legal procedures", "investment advice"],
          communicationStyle: "professional",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 9. Food Delivery Bot
    {
      id: "template_food_delivery_bot",
      name: "Food Delivery Bot",
      description: "Kerala cuisine and restaurant recommendations",
      category: "food",
      tags: ["food", "malayalam", "kerala cuisine", "delivery", "restaurants"],
      isPopular: true,
      usageCount: 389,
      useCases: ["Food ordering", "Restaurant recommendations", "Cuisine information", "Dietary advice"],
      difficulty: "beginner",
      industries: ["Food Delivery", "Restaurants", "Hospitality"],
      estimatedCost: 6,
      setupTime: "5 minutes",
      configuration: {
        persona: {
          name: "Food Expert Bindu",
          role: "Food Delivery Assistant",
          personality: "enthusiastic about food, understanding of dietary restrictions",
          expertise: ["kerala cuisine", "local restaurants", "traditional foods", "dietary preferences"],
          communicationStyle: "friendly",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: false,
          codeGeneration: false,
          translation: true,
          summarization: false,
          sentiment: true,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },

    // 10. Agriculture Assistant
    {
      id: "template_agriculture_assistant",
      name: "Agriculture Assistant",
      description: "Farming guidance for Kerala farmers",
      category: "agriculture",
      tags: ["agriculture", "malayalam", "farming", "kerala", "crops"],
      isPopular: false,
      usageCount: 87,
      useCases: ["Crop guidance", "Weather advice", "Pest control", "Market information"],
      difficulty: "intermediate",
      industries: ["Agriculture", "Farming", "Rural Development"],
      estimatedCost: 14,
      setupTime: "10 minutes",
      configuration: {
        persona: {
          name: "Agricultural Expert Prasad",
          role: "Agriculture Assistant",
          personality: "practical, knowledgeable, environmentally conscious",
          expertise: ["kerala agriculture", "rice cultivation", "spice farming", "organic methods", "weather patterns"],
          communicationStyle: "casual",
          languagePreference: "multilingual",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: true,
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
    },
  ];
}

function getTemplateCategories() {
  return [
    { id: "healthcare", name: "Healthcare", count: 1 },
    { id: "legal", name: "Legal", count: 1 },
    { id: "education", name: "Education", count: 1 },
    { id: "ecommerce", name: "Ecommerce", count: 1 },
    { id: "finance", name: "Finance", count: 1 },
    { id: "travel", name: "Travel", count: 1 },
    { id: "government", name: "Government", count: 1 },
    { id: "real_estate", name: "Real Estate", count: 1 },
    { id: "food", name: "Food", count: 1 },
    { id: "agriculture", name: "Agriculture", count: 1 },
  ];
}