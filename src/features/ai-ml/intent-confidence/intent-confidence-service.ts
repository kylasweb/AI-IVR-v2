export interface IntentResult {
  intent: string;
  confidence: number;
  entities: any;
  language: string;
  alternatives: {
    intent: string;
    confidence: number;
  }[];
}

export interface ConfidenceThreshold {
  intent: string;
  highThreshold: number;
  mediumThreshold: number;
  lowThreshold: number;
}

export interface FallbackAction {
  trigger: 'low_confidence' | 'no_match' | 'multiple_matches';
  action: 'ask_clarification' | 'transfer_to_human' | 'suggest_alternatives';
  message: string;
}

export class IntentConfidenceService {
  private confidenceThresholds: Map<string, ConfidenceThreshold> = new Map();
  private fallbackActions: Map<string, FallbackAction[]> = new Map();
  private intentHistory: Map<string, IntentResult[]> = new Map();

  constructor() {
    this.initializeThresholds();
    this.initializeFallbackActions();
  }

  async analyzeIntentWithConfidence(
    text: string,
    language: string = 'en',
    userId?: string
  ): Promise<IntentResult> {
    try {
      // Get primary intent analysis
      const primaryResult = await this.getPrimaryIntent(text, language);

      // Get alternative intents
      const alternatives = await this.getAlternativeIntents(text, language, primaryResult.intent);

      // Calculate confidence score
      const confidence = await this.calculateConfidenceScore(
        text,
        primaryResult,
        alternatives,
        language,
        userId
      );

      const result: IntentResult = {
        intent: primaryResult.intent,
        confidence,
        entities: primaryResult.entities,
        language,
        alternatives: alternatives.map(alt => ({
          intent: alt.intent,
          confidence: alt.confidence
        }))
      };

      // Store in history for learning
      this.storeIntentHistory(userId || 'anonymous', result);

      return result;
    } catch (error) {
      console.error('Intent confidence analysis failed:', error);
      return this.getDefaultIntentResult(language);
    }
  }

  async getFallbackAction(result: IntentResult): Promise<FallbackAction | null> {
    const threshold = this.confidenceThresholds.get(result.intent);

    if (!threshold) {
      return null;
    }

    // Check confidence level
    if (result.confidence < threshold.lowThreshold) {
      return {
        trigger: 'low_confidence',
        action: 'ask_clarification',
        message: this.getClarificationMessage(result)
      };
    }

    // Check for multiple close matches
    const closeAlternatives = result.alternatives.filter(
      alt => Math.abs(alt.confidence - result.confidence) < 0.1
    );

    if (closeAlternatives.length > 1) {
      return {
        trigger: 'multiple_matches',
        action: 'suggest_alternatives',
        message: this.getSuggestionMessage(result, closeAlternatives)
      };
    }

    return null;
  }

  async shouldTransferToHuman(result: IntentResult, context: any): Promise<boolean> {
    // Check for conditions that require human intervention
    const conditions = [
      this.isEmergencyIntent(result.intent),
      this.isComplexQuery(result, context),
      this.hasLowConfidence(result),
      this.isRepeatedFailure(context),
      this.isVIPUser(context)
    ];

    return conditions.some(condition => condition);
  }

  private async getPrimaryIntent(text: string, language: string): Promise<any> {
    // Integrate with existing NLP service
    try {
      const response = await fetch('/api/nlp/analyze-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, language })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Primary intent analysis failed:', error);
      return { intent: 'unknown', entities: {}, confidence: 0 };
    }
  }

  private async getAlternativeIntents(
    text: string,
    language: string,
    primaryIntent: string
  ): Promise<any[]> {
    try {
      const response = await fetch('/api/nlp/alternative-intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          language,
          excludeIntent: primaryIntent
        })
      });

      const data = await response.json();
      return data.alternatives || [];
    } catch (error) {
      console.error('Alternative intent analysis failed:', error);
      return [];
    }
  }

  private async calculateConfidenceScore(
    text: string,
    primaryResult: any,
    alternatives: any[],
    language: string,
    userId?: string
  ): Promise<number> {
    let confidence = primaryResult.confidence || 0;

    // Adjust confidence based on various factors
    confidence = this.adjustForTextLength(confidence, text);
    confidence = this.adjustForLanguageComplexity(confidence, text, language);
    confidence = this.adjustForContext(confidence, userId);
    confidence = this.adjustForAlternatives(confidence, alternatives);
    confidence = this.adjustForHistory(confidence, userId, primaryResult.intent);

    return Math.min(Math.max(confidence, 0), 1);
  }

  private adjustForTextLength(confidence: number, text: string): number {
    const length = text.length;

    // Very short texts have lower confidence
    if (length < 10) return confidence * 0.7;

    // Very long texts might have multiple intents
    if (length > 200) return confidence * 0.9;

    return confidence;
  }

  private adjustForLanguageComplexity(confidence: number, text: string, language: string): number {
    // Adjust confidence based on language complexity
    if (language === 'ml') {
      // Malayalam might have lower confidence due to complexity
      return confidence * 0.95;
    }

    if (language === 'manglish') {
      // Manglish (code-switching) might have lower confidence
      return confidence * 0.9;
    }

    return confidence;
  }

  private adjustForContext(confidence: number, userId?: string): number {
    if (!userId) return confidence;

    // Adjust based on user's historical interaction patterns
    const userHistory = this.intentHistory.get(userId);
    if (!userHistory || userHistory.length === 0) return confidence;

    // If user has good history, increase confidence
    const avgConfidence = userHistory.reduce((sum, result) => sum + result.confidence, 0) / userHistory.length;
    if (avgConfidence > 0.8) {
      return Math.min(confidence * 1.1, 1.0);
    }

    return confidence;
  }

  private adjustForAlternatives(confidence: number, alternatives: any[]): number {
    if (alternatives.length === 0) return confidence;

    // If there are close alternatives, reduce confidence
    const closestAlternative = alternatives.reduce((closest, alt) => {
      return alt.confidence > closest.confidence ? alt : closest;
    }, alternatives[0]);

    const difference = confidence - closestAlternative.confidence;

    if (difference < 0.1) {
      return confidence * 0.8; // Reduce confidence if alternatives are close
    }

    return confidence;
  }

  private adjustForHistory(confidence: number, userId?: string, intent?: string): number {
    if (!userId || !intent) return confidence;

    const userHistory = this.intentHistory.get(userId);
    if (!userHistory) return confidence;

    // Check if user has successfully used this intent before
    const previousUses = userHistory.filter(result => result.intent === intent);
    if (previousUses.length > 0) {
      const avgPreviousConfidence = previousUses.reduce((sum, result) => sum + result.confidence, 0) / previousUses.length;

      // Boost confidence if user has successfully used this intent before
      if (avgPreviousConfidence > 0.8) {
        return Math.min(confidence * 1.05, 1.0);
      }
    }

    return confidence;
  }

  private storeIntentHistory(userId: string, result: IntentResult): void {
    const history = this.intentHistory.get(userId) || [];
    history.push(result);

    // Keep only last 50 interactions per user
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    this.intentHistory.set(userId, history);
  }

  private initializeThresholds(): void {
    const defaultThresholds: ConfidenceThreshold[] = [
      { intent: 'greeting', highThreshold: 0.9, mediumThreshold: 0.7, lowThreshold: 0.5 },
      { intent: 'goodbye', highThreshold: 0.9, mediumThreshold: 0.7, lowThreshold: 0.5 },
      { intent: 'help', highThreshold: 0.8, mediumThreshold: 0.6, lowThreshold: 0.4 },
      { intent: 'book_ride', highThreshold: 0.85, mediumThreshold: 0.7, lowThreshold: 0.5 },
      { intent: 'ride_status', highThreshold: 0.8, mediumThreshold: 0.6, lowThreshold: 0.4 },
      { intent: 'cancel_ride', highThreshold: 0.85, mediumThreshold: 0.7, lowThreshold: 0.5 },
      { intent: 'emergency', highThreshold: 0.7, mediumThreshold: 0.5, lowThreshold: 0.3 },
      { intent: 'payment_issue', highThreshold: 0.8, mediumThreshold: 0.6, lowThreshold: 0.4 },
      { intent: 'complaint', highThreshold: 0.8, mediumThreshold: 0.6, lowThreshold: 0.4 },
      { intent: 'information', highThreshold: 0.7, mediumThreshold: 0.5, lowThreshold: 0.3 }
    ];

    defaultThresholds.forEach(threshold => {
      this.confidenceThresholds.set(threshold.intent, threshold);
    });
  }

  private initializeFallbackActions(): void {
    const defaultActions: FallbackAction[] = [
      {
        trigger: 'low_confidence',
        action: 'ask_clarification',
        message: "I'm not sure I understood. Could you please rephrase that?"
      },
      {
        trigger: 'multiple_matches',
        action: 'suggest_alternatives',
        message: "Did you mean one of these?"
      },
      {
        trigger: 'no_match',
        action: 'transfer_to_human',
        message: "I'm having trouble understanding. Let me connect you with a human agent."
      }
    ];

    this.fallbackActions.set('default', defaultActions);
  }

  private getClarificationMessage(result: IntentResult): string {
    const clarificationMessages = {
      en: "I'm not completely sure what you need. Could you tell me more about that?",
      ml: "ഞാൻ നിങ്ങൾക്ക് എന്താണ് ആവശ്യമെന്ന് പൂർണ്ണമായും ഉറപ്പില്ല. അതിനെക്കുറിച്ച് കൂടുതൽ പറയാമോ?",
      manglish: "I'm not sure what you want. Can you explain more?"
    };

    return clarificationMessages[result.language as keyof typeof clarificationMessages] ||
      clarificationMessages.en;
  }

  private getSuggestionMessage(result: IntentResult, alternatives: any[]): string {
    const alternativeTexts = alternatives.slice(0, 3).map(alt => alt.intent).join(', ');

    const suggestionMessages = {
      en: `Did you mean: ${alternativeTexts}?`,
      ml: `നിങ്ങൾക്ക് ഉദ്ദേശിച്ചത്: ${alternativeTexts}?`,
      manglish: `Did you mean: ${alternativeTexts}?`
    };

    return suggestionMessages[result.language as keyof typeof suggestionMessages] ||
      suggestionMessages.en;
  }

  private isEmergencyIntent(intent: string): boolean {
    const emergencyIntents = ['emergency', 'accident', 'medical_emergency', 'police', 'fire'];
    return emergencyIntents.includes(intent);
  }

  private isComplexQuery(result: IntentResult, context: any): boolean {
    // Check if the query is complex and requires human intervention
    const complexIntents = ['complaint', 'dispute', 'legal_issue', 'complex_booking'];
    return complexIntents.includes(result.intent);
  }

  private hasLowConfidence(result: IntentResult): boolean {
    const threshold = this.confidenceThresholds.get(result.intent);
    return threshold ? result.confidence < threshold.lowThreshold : result.confidence < 0.4;
  }

  private isRepeatedFailure(context: any): boolean {
    // Check if user has had multiple failed attempts
    return context.failedAttempts > 2;
  }

  private isVIPUser(context: any): boolean {
    // Check if user is VIP and should get human assistance
    return context.userType === 'vip' || context.priority === 'high';
  }

  private getDefaultIntentResult(language: string): IntentResult {
    return {
      intent: 'unknown',
      confidence: 0,
      entities: {},
      language,
      alternatives: []
    };
  }

  // Learning and improvement methods
  async updateThresholds(intent: string, newThresholds: Partial<ConfidenceThreshold>): Promise<void> {
    const current = this.confidenceThresholds.get(intent);
    if (current) {
      const updated = { ...current, ...newThresholds };
      this.confidenceThresholds.set(intent, updated);
    }
  }

  async getConfidenceMetrics(): Promise<{
    totalAnalyses: number;
    averageConfidence: number;
    lowConfidenceRate: number;
    humanTransferRate: number;
    intentDistribution: { [intent: string]: number };
  }> {
    const allResults = Array.from(this.intentHistory.values()).flat();

    const totalAnalyses = allResults.length;
    const averageConfidence = allResults.reduce((sum, result) => sum + result.confidence, 0) / totalAnalyses || 0;
    const lowConfidenceRate = allResults.filter(result => result.confidence < 0.5).length / totalAnalyses || 0;

    // Calculate intent distribution
    const intentDistribution: { [intent: string]: number } = {};
    allResults.forEach(result => {
      intentDistribution[result.intent] = (intentDistribution[result.intent] || 0) + 1;
    });

    return {
      totalAnalyses,
      averageConfidence,
      lowConfidenceRate,
      humanTransferRate: 0.1, // This would be calculated from actual transfer data
      intentDistribution
    };
  }

  async exportConfidenceData(): Promise<any> {
    return {
      thresholds: Object.fromEntries(this.confidenceThresholds),
      fallbackActions: Object.fromEntries(this.fallbackActions),
      metrics: await this.getConfidenceMetrics()
    };
  }
}