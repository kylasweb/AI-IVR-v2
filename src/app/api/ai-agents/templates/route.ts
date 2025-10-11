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
        (template) => template.configuration.malayalamSupport?.enabled ?? false
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
    {
      id: "template_customer_support",
      name: "Malayalam Customer Support Bot",
      description:
        "Intelligent customer support agent with Malayalam language expertise",
      category: "customer_service",
      tags: ["customer-service", "malayalam", "support", "kerala"],
      configuration: {
        persona: {
          name: "സപ്പോർട്ട് ബോട്ട്",
          role: "Customer Support Representative",
          personality:
            "Helpful, patient, and culturally aware. Understands Kerala customs and business practices.",
          expertise: [
            "Customer Service",
            "Product Knowledge",
            "Malayalam Culture",
            "Problem Solving",
          ],
          communicationStyle: "friendly",
          languagePreference: "malayalam",
        },
        model: {
          provider: "openai",
          modelId: "gpt-4",
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
        prompts: {
          systemPrompt: `You are a helpful customer support representative who speaks Malayalam and understands Kerala culture. 
You help customers with their queries in a friendly, professional manner. Always be respectful and culturally sensitive.
If responding in Malayalam, use proper Malayalam script. Be patient and thorough in your explanations.`,
          userPromptTemplate:
            "Customer Query: {input}\n\nPlease provide a helpful response in the customer's preferred language.",
          fallbackResponses: [
            "I apologize, could you please rephrase your question?",
            "Let me connect you with a senior support representative.",
            "ക്ഷമിക്കണം, നിങ്ങളുടെ ചോദ്യം വീണ്ടും പറയാമോ?",
          ],
          contextInstructions:
            "Always maintain a helpful and professional tone. Use Malayalam when appropriate.",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: false,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: false,
        },
        safety: {
          contentFiltering: true,
          toxicityThreshold: 0.8,
          piiDetection: true,
          biasMonitoring: true,
          adultContentFilter: true,
        },
        integrations: {
          apiEndpoints: [],
          externalTools: [
            {
              id: "kb-001",
              name: "Knowledge Base",
              type: "database" as const,
              endpoint: "/api/knowledge-base",
              authentication: { type: "none" as const },
              parameters: {}
            },
            {
              id: "ticket-001",
              name: "Ticketing System",
              type: "api" as const,
              endpoint: "/api/tickets",
              authentication: { type: "apiKey" as const },
              parameters: {}
            }
          ],
          databases: [
            {
              id: "customer-db",
              name: "Customer Database",
              type: "postgresql" as const,
              connectionString: "postgresql://localhost/customers",
              tables: ["customers", "orders"],
              queryTemplate: "SELECT * FROM {table} WHERE {condition}"
            },
            {
              id: "product-catalog",
              name: "Product Catalog",
              type: "mongodb" as const,
              connectionString: "mongodb://localhost/products",
              tables: ["products", "categories"],
              queryTemplate: "db.{collection}.find({query})"
            }
          ],
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
      useCases: [
        "Customer inquiry handling",
        "Product support in Malayalam",
        "Order status updates",
        "Technical troubleshooting",
        "Complaint resolution",
      ],
      industries: [
        "E-commerce",
        "Banking",
        "Telecom",
        "Healthcare",
        "Education",
      ],
      estimatedCost: 5,
      setupTime: "15 minutes",
      difficulty: "beginner",
      usageCount: 234,
      isPopular: true,
    },
    {
      id: "template_kerala_tourism",
      name: "Kerala Tourism Guide",
      description:
        "Expert travel assistant for Kerala tourism with local insights",
      category: "tourism",
      tags: ["tourism", "kerala", "travel", "culture", "malayalam"],
      configuration: {
        persona: {
          name: "Kerala Travel Guide",
          role: "Tourism Expert & Travel Guide",
          personality:
            "Enthusiastic, knowledgeable about Kerala, friendly, and culturally authentic",
          expertise: [
            "Kerala Tourism",
            "Local Culture",
            "Travel Planning",
            "Historical Sites",
            "Cuisine",
            "Festivals",
          ],
          communicationStyle: "friendly",
          languagePreference: "multilingual",
        },
        model: {
          provider: "openai",
          modelId: "gpt-4",
          temperature: 0.8,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
        prompts: {
          systemPrompt: `You are an expert Kerala tourism guide with deep knowledge of Kerala's culture, destinations, food, and traditions.
You help travelers plan their Kerala visit with authentic, local insights. You can communicate in Malayalam and English.
Focus on authentic experiences, local recommendations, and cultural sensitivity.`,
          userPromptTemplate:
            "Tourist Query: {input}\n\nProvide detailed, helpful travel advice with local insights.",
          fallbackResponses: [
            "Let me help you discover the beauty of Kerala!",
            "Kerala has so much to offer - what specific area interests you?",
            "കേരളത്തിന്റെ സൗന്ദര്യം കാണാൻ ഞാൻ സഹായിക്കാം!",
          ],
          contextInstructions:
            "Always provide authentic, local perspectives and practical travel advice.",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: true,
          documentAnalysis: true,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: false,
          voiceProcessing: false,
        },
        safety: {
          contentFiltering: true,
          toxicityThreshold: 0.9,
          piiDetection: true,
          biasMonitoring: true,
          adultContentFilter: true,
        },
        integrations: {
          apiEndpoints: ["weather-api", "maps-api"],
          externalTools: [
            {
              id: "booking-001",
              name: "Booking System",
              type: "api" as const,
              endpoint: "/api/bookings",
              authentication: { type: "apiKey" as const },
              parameters: {}
            },
            {
              id: "weather-001",
              name: "Weather Service",
              type: "service" as const,
              endpoint: "/api/weather",
              authentication: { type: "none" as const },
              parameters: {}
            }
          ],
          databases: [
            {
              id: "attractions-db",
              name: "Attractions Database",
              type: "postgresql" as const,
              connectionString: "postgresql://localhost/attractions",
              tables: ["attractions", "reviews"],
              queryTemplate: "SELECT * FROM {table} WHERE {condition}"
            },
            {
              id: "hotels-db",
              name: "Hotels Database",
              type: "mysql" as const,
              connectionString: "mysql://localhost/hotels",
              tables: ["hotels", "bookings"],
              queryTemplate: "SELECT * FROM {table} WHERE {condition}"
            }
          ],
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
      useCases: [
        "Travel itinerary planning",
        "Local attraction recommendations",
        "Cultural event information",
        "Restaurant and food suggestions",
        "Transportation guidance",
      ],
      industries: [
        "Tourism",
        "Hospitality",
        "Travel Agencies",
        "Hotels",
        "Government Tourism",
      ],
      estimatedCost: 8,
      setupTime: "20 minutes",
      difficulty: "intermediate",
      usageCount: 89,
      isPopular: true,
    },
    {
      id: "template_content_creator",
      name: "Malayalam Content Creator",
      description:
        "AI assistant for creating engaging Malayalam content for social media and marketing",
      category: "content_creation",
      tags: ["content", "malayalam", "social-media", "marketing", "creative"],
      configuration: {
        persona: {
          name: "Content Creator Assistant",
          role: "Content Creation Specialist",
          personality:
            "Creative, trend-aware, culturally connected, and engaging",
          expertise: [
            "Content Writing",
            "Social Media",
            "Malayalam Literature",
            "Digital Marketing",
            "Cultural Trends",
          ],
          communicationStyle: "creative",
          languagePreference: "malayalam",
        },
        model: {
          provider: "openai",
          modelId: "gpt-4-turbo",
          temperature: 0.9,
          maxTokens: 2500,
          topP: 1,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
        },
        prompts: {
          systemPrompt: `You are a creative Malayalam content creator who understands current trends, Malayalam culture, and digital marketing.
Create engaging, authentic content that resonates with Malayalam-speaking audiences. Keep content culturally relevant and trendy.
Use appropriate Malayalam expressions, cultural references, and contemporary language.`,
          userPromptTemplate:
            "Content Request: {input}\n\nCreate engaging Malayalam content that captures attention and drives engagement.",
          fallbackResponses: [
            "Let me create something amazing for you!",
            "I have some creative ideas for your content!",
            "നിങ്ങളുടെ കണ്ടന്റ് സൃഷ്ടിക്കാൻ ഞാൻ സഹായിക്കാം!",
          ],
          contextInstructions:
            "Keep content culturally relevant, engaging, and appropriate for the target audience.",
        },
        capabilities: {
          textGeneration: true,
          questionAnswering: false,
          documentAnalysis: false,
          codeGeneration: false,
          translation: true,
          summarization: true,
          sentiment: true,
          voiceProcessing: false,
        },
        safety: {
          contentFiltering: true,
          toxicityThreshold: 0.8,
          piiDetection: true,
          biasMonitoring: true,
          adultContentFilter: true,
        },
        integrations: {
          apiEndpoints: [],
          externalTools: [
            {
              id: "social-analytics-001",
              name: "Social Media Analytics",
              type: "api" as const,
              endpoint: "/api/social-analytics",
              authentication: { type: "oauth" as const },
              parameters: {}
            },
            {
              id: "trend-analysis-001",
              name: "Trend Analysis",
              type: "service" as const,
              endpoint: "/api/trends",
              authentication: { type: "apiKey" as const },
              parameters: {}
            }
          ],
          databases: [
            {
              id: "content-templates-db",
              name: "Content Templates",
              type: "mongodb" as const,
              connectionString: "mongodb://localhost/content",
              tables: ["templates", "categories"],
              queryTemplate: "db.{collection}.find({query})"
            },
            {
              id: "cultural-db",
              name: "Cultural Database",
              type: "postgresql" as const,
              connectionString: "postgresql://localhost/culture",
              tables: ["traditions", "festivals"],
              queryTemplate: "SELECT * FROM {table} WHERE {condition}"
            }
          ],
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central"],
          scriptSupport: "malayalam",
          culturalContext: true,
          regionalVariations: false,
        },
      },
      useCases: [
        "Social media post creation",
        "Marketing copy in Malayalam",
        "Blog content writing",
        "Campaign slogans and taglines",
        "Cultural event content",
      ],
      industries: [
        "Marketing",
        "Advertising",
        "Media",
        "Entertainment",
        "E-commerce",
      ],
      estimatedCost: 12,
      setupTime: "25 minutes",
      difficulty: "intermediate",
      usageCount: 156,
      isPopular: true,
    },
    {
      id: "template_education_tutor",
      name: "Malayalam Education Tutor",
      description:
        "Educational assistant for Malayalam language learning and Kerala studies",
      category: "education",
      tags: ["education", "malayalam", "tutor", "learning", "kerala-studies"],
      configuration: {
        persona: {
          name: "Malayalam Teacher",
          role: "Educational Tutor",
          personality:
            "Patient, encouraging, knowledgeable, and passionate about Malayalam language and culture",
          expertise: [
            "Malayalam Language",
            "Kerala History",
            "Literature",
            "Grammar",
            "Cultural Studies",
          ],
          communicationStyle: "professional",
          languagePreference: "multilingual",
        },
        model: {
          provider: "openai",
          modelId: "gpt-4",
          temperature: 0.6,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0,
        },
        prompts: {
          systemPrompt: `You are a patient and knowledgeable Malayalam language tutor. Help students learn Malayalam language, literature, and Kerala culture.
Provide clear explanations, examples, and encourage practice. Adapt your teaching style to the student's level.
Use both Malayalam and English to explain concepts clearly.`,
          userPromptTemplate:
            "Student Question: {input}\n\nProvide a clear, educational response with examples and encouragement.",
          fallbackResponses: [
            "That's a great question! Let me explain it step by step.",
            "Don't worry, Malayalam can be challenging but you're doing well!",
            "മലയാളം പഠിക്കാൻ കുറച്ച് സമയം എടുക്കും, പക്ഷേ നിങ്ങൾക്ക് കഴിയും!",
          ],
          contextInstructions:
            "Be encouraging, patient, and provide clear educational guidance.",
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
        safety: {
          contentFiltering: true,
          toxicityThreshold: 0.9,
          piiDetection: true,
          biasMonitoring: true,
          adultContentFilter: true,
        },
        integrations: {
          apiEndpoints: [],
          externalTools: [
            {
              id: "pronunciation-001",
              name: "Pronunciation Guide",
              type: "service" as const,
              endpoint: "/api/pronunciation",
              authentication: { type: "none" as const },
              parameters: {}
            },
            {
              id: "quiz-gen-001",
              name: "Quiz Generator",
              type: "api" as const,
              endpoint: "/api/quiz-generator",
              authentication: { type: "apiKey" as const },
              parameters: {}
            }
          ],
          databases: [
            {
              id: "curriculum-db",
              name: "Curriculum Database",
              type: "postgresql" as const,
              connectionString: "postgresql://localhost/curriculum",
              tables: ["lessons", "exercises"],
              queryTemplate: "SELECT * FROM {table} WHERE {condition}"
            },
            {
              id: "literature-db",
              name: "Literature Collection",
              type: "mongodb" as const,
              connectionString: "mongodb://localhost/literature",
              tables: ["books", "authors"],
              queryTemplate: "db.{collection}.find({query})"
            }
          ],
        },
        malayalamSupport: {
          enabled: true,
          dialectSupport: ["central", "northern", "southern"],
          scriptSupport: "both",
          culturalContext: true,
          regionalVariations: true,
        },
      },
      useCases: [
        "Malayalam language learning",
        "Grammar explanations",
        "Literature analysis",
        "Cultural education",
        "Pronunciation help",
      ],
      industries: [
        "Education",
        "E-learning",
        "Schools",
        "Universities",
        "Language Centers",
      ],
      estimatedCost: 6,
      setupTime: "20 minutes",
      difficulty: "beginner",
      usageCount: 312,
      isPopular: true,
    },
  ];
}

function getTemplateCategories() {
  return [
    { id: "customer_service", name: "Customer Service", count: 1 },
    { id: "tourism", name: "Tourism & Travel", count: 1 },
    { id: "content_creation", name: "Content Creation", count: 1 },
    { id: "education", name: "Education & Learning", count: 1 },
    { id: "healthcare", name: "Healthcare", count: 0 },
    { id: "finance", name: "Finance & Banking", count: 0 },
    { id: "ecommerce", name: "E-commerce", count: 0 },
    { id: "entertainment", name: "Entertainment", count: 0 },
  ];
}
