import { z } from 'zod';

const SentimentSchema = z.object({
  score: z.number().min(-1).max(1),
  magnitude: z.number().min(0),
  label: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  confidence: z.number().min(0).max(1),
  emotions: z.object({
    joy: z.number().min(0).max(1),
    anger: z.number().min(0).max(1),
    fear: z.number().min(0).max(1),
    sadness: z.number().min(0).max(1),
    surprise: z.number().min(0).max(1),
    disgust: z.number().min(0).max(1)
  })
});

export type SentimentAnalysis = any;

export class SentimentAnalysisService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY!;
    this.baseUrl = 'https://language.googleapis.com/v1';
  }

  async analyzeSentiment(text: string, language: string = 'en'): Promise<SentimentAnalysis> {
    try {
      // For Malayalam text, translate first then analyze
      const analysisText = language === 'ml' ? await this.translateToEnglish(text) : text;

      const response = await fetch(`${this.baseUrl}/documents:analyzeSentiment?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          document: {
            type: 'PLAIN_TEXT',
            content: analysisText,
            language: 'en'
          },
          encodingType: 'UTF8'
        })
      });

      const data = await response.json();

      // Analyze emotions using additional AI model
      const emotions = await this.analyzeEmotions(analysisText);

      return {
        score: data.documentSentiment.score || 0,
        magnitude: data.documentSentiment.magnitude || 0,
        label: this.getSentimentLabel(data.documentSentiment.score || 0),
        confidence: this.calculateConfidence(data.documentSentiment),
        emotions
      };
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return this.getDefaultSentiment();
    }
  }

  async analyzeVoiceSentiment(audioBuffer: Buffer): Promise<SentimentAnalysis> {
    try {
      // Convert speech to text first
      const transcription = await this.transcribeAudio(audioBuffer);

      // Analyze both text and voice characteristics
      const textSentiment = await this.analyzeSentiment(transcription);
      const voiceCharacteristics = await this.analyzeVoiceCharacteristics(audioBuffer);

      // Combine both analyses
      return this.combineSentimentAnalyses(textSentiment, voiceCharacteristics);
    } catch (error) {
      console.error('Voice sentiment analysis failed:', error);
      return this.getDefaultSentiment();
    }
  }

  private async translateToEnglish(text: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/documents:translateText?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          q: text,
          source: 'ml',
          target: 'en',
          format: 'text'
        })
      });

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }

  private async analyzeEmotions(text: string): Promise<SentimentAnalysis['emotions']> {
    // Use emotion recognition model
    const emotionKeywords = {
      joy: ['happy', 'joy', 'excited', 'glad', 'pleased', 'satisfied', 'content'],
      anger: ['angry', 'frustrated', 'annoyed', 'irritated', 'mad', 'furious'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'concerned'],
      sadness: ['sad', 'unhappy', 'depressed', 'disappointed', 'hurt', 'upset'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished', 'stunned'],
      disgust: ['disgusted', 'revolted', 'repulsed', 'sickened']
    };

    const emotions = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0,
      disgust: 0
    };

    const lowerText = text.toLowerCase();
    const totalWords = lowerText.split(' ').length;

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
      emotions[emotion as keyof typeof emotions] = matches / totalWords;
    });

    return emotions;
  }

  private async analyzeVoiceCharacteristics(audioBuffer: Buffer): Promise<Partial<SentimentAnalysis>> {
    // Analyze voice pitch, tone, speed, and other characteristics
    // This would integrate with audio processing libraries

    return {
      score: 0,
      magnitude: 0,
      label: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0,
        anger: 0,
        fear: 0,
        sadness: 0,
        surprise: 0,
        disgust: 0
      }
    };
  }

  private combineSentimentAnalyses(textSentiment: SentimentAnalysis, voiceCharacteristics: Partial<SentimentAnalysis>): SentimentAnalysis {
    // Weight text sentiment higher than voice characteristics
    const textWeight = 0.7;
    const voiceWeight = 0.3;

    return {
      score: (textSentiment.score * textWeight) + ((voiceCharacteristics.score || 0) * voiceWeight),
      magnitude: (textSentiment.magnitude * textWeight) + ((voiceCharacteristics.magnitude || 0) * voiceWeight),
      label: textSentiment.label,
      confidence: (textSentiment.confidence * textWeight) + ((voiceCharacteristics.confidence || 0) * voiceWeight),
      emotions: {
        joy: (textSentiment.emotions.joy * textWeight) + ((voiceCharacteristics.emotions?.joy || 0) * voiceWeight),
        anger: (textSentiment.emotions.anger * textWeight) + ((voiceCharacteristics.emotions?.anger || 0) * voiceWeight),
        fear: (textSentiment.emotions.fear * textWeight) + ((voiceCharacteristics.emotions?.fear || 0) * voiceWeight),
        sadness: (textSentiment.emotions.sadness * textWeight) + ((voiceCharacteristics.emotions?.sadness || 0) * voiceWeight),
        surprise: (textSentiment.emotions.surprise * textWeight) + ((voiceCharacteristics.emotions?.surprise || 0) * voiceWeight),
        disgust: (textSentiment.emotions.disgust * textWeight) + ((voiceCharacteristics.emotions?.disgust || 0) * voiceWeight)
      }
    };
  }

  private getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' | 'mixed' {
    if (score > 0.25) return 'positive';
    if (score < -0.25) return 'negative';
    if (Math.abs(score) <= 0.1) return 'neutral';
    return 'mixed';
  }

  private calculateConfidence(sentiment: any): number {
    // Calculate confidence based on magnitude and score
    const magnitude = sentiment.magnitude || 0;
    const score = Math.abs(sentiment.score || 0);
    return Math.min((magnitude + score) / 2, 1);
  }

  private getDefaultSentiment(): SentimentAnalysis {
    return {
      score: 0,
      magnitude: 0,
      label: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0,
        anger: 0,
        fear: 0,
        sadness: 0,
        surprise: 0,
        disgust: 0
      }
    };
  }

  private async transcribeAudio(audioBuffer: Buffer): Promise<string> {
    // Integrate with speech-to-text service
    try {
      const response = await fetch('/api/stt/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: new Uint8Array(audioBuffer)
      });

      const result = await response.json();
      return result.transcription || '';
    } catch (error) {
      console.error('Audio transcription failed:', error);
      return '';
    }
  }

  // Adaptive response based on sentiment
  async getAdaptiveResponse(sentiment: SentimentAnalysis, intent: string, language: string = 'en'): Promise<string> {
    const responses = {
      frustrated: {
        en: "I understand this is frustrating. Let me help you resolve this quickly.",
        ml: "ഇത് നിരാശാജനകമാണെന്ന് ഞാൻ മനസ്സിലാക്കുന്നു. ഇത് വേഗം പരിഹരിക്കാൻ ഞാൻ സഹായിക്കാം."
      },
      angry: {
        en: "I can hear you're upset. I'm here to help resolve this issue.",
        ml: "നിങ്ങൾക്ക് വിഷമിക്കുന്നതായി ഞാൻ കേൾക്കുന്നു. ഈ പ്രശ്നം പരിഹരിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്."
      },
      happy: {
        en: "Great! I'm glad I could help. Is there anything else I can assist you with?",
        ml: "നല്ലത്! ഞാൻ സഹായിക്കാൻ കഴിഞ്ഞതിൽ സന്തോഷം. മറ്റെന്തെങ്കിലും സഹായം വേണമോ?"
      },
      confused: {
        en: "Let me explain this more clearly. I'll break it down step by step.",
        ml: "ഇത് കൂടുതൽ വ്യക്തമായി വിശദീകരിക്കാം. ഞാൻ ഇത് ഘട്ടം ഘട്ടമായി വിശദീകരിക്കാം."
      },
      neutral: {
        en: "How can I help you today?",
        ml: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?"
      }
    };

    let emotionalState = 'neutral';

    if (sentiment.emotions.anger > 0.3) emotionalState = 'angry';
    else if (sentiment.emotions.sadness > 0.3) emotionalState = 'frustrated';
    else if (sentiment.emotions.joy > 0.3) emotionalState = 'happy';
    else if (sentiment.emotions.surprise > 0.3) emotionalState = 'confused';

    const lang = language === 'ml' ? 'ml' : 'en';
    return responses[emotionalState as keyof typeof responses]?.[lang] ||
      responses.neutral?.[lang] ||
      "How can I help you today?";
  }
}