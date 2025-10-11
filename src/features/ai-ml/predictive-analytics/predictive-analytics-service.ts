export interface CallVolumePrediction {
  date: Date;
  predictedVolume: number;
  confidence: number;
  factors: string[];
}

export interface PeakHourPrediction {
  hour: number;
  predictedCalls: number;
  confidence: number;
  dayOfWeek: string;
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  recommendations: string[];
}

export interface LeadScoring {
  leadId: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  factors: {
    factor: string;
    weight: number;
    value: number;
  }[];
}

export class PredictiveAnalyticsService {
  private historicalData: any[] = [];
  private modelVersion: string = '1.0';

  constructor() {
    this.loadHistoricalData();
  }

  async predictCallVolume(daysAhead: number = 7): Promise<CallVolumePrediction[]> {
    try {
      const predictions: CallVolumePrediction[] = [];
      const today = new Date();

      // Use time series forecasting
      const seasonalFactors = this.calculateSeasonalFactors();
      const trendFactors = this.calculateTrendFactors();

      for (let i = 1; i <= daysAhead; i++) {
        const predictionDate = new Date(today);
        predictionDate.setDate(today.getDate() + i);

        const dayOfWeek = predictionDate.getDay();
        const month = predictionDate.getMonth();
        const isHoliday = this.isHoliday(predictionDate);

        // Base prediction on historical patterns
        const historicalAverage = this.getHistoricalAverageForDate(predictionDate);
        const seasonalFactor = seasonalFactors[month] || 1.0;
        const trendFactor = trendFactors[i] || 1.0;
        const holidayFactor = isHoliday ? 0.3 : 1.0;

        const predictedVolume = Math.round(
          historicalAverage * seasonalFactor * trendFactor * holidayFactor
        );

        const confidence = this.calculatePredictionConfidence(predictionDate);

        const factors = [
          `Day of week: ${this.getDayName(dayOfWeek)}`,
          `Month: ${this.getMonthName(month)}`,
          `Seasonal factor: ${seasonalFactor.toFixed(2)}`,
          `Trend factor: ${trendFactor.toFixed(2)}`,
          isHoliday ? 'Holiday effect' : 'Regular day'
        ];

        predictions.push({
          date: predictionDate,
          predictedVolume,
          confidence,
          factors
        });
      }

      return predictions;
    } catch (error) {
      console.error('Call volume prediction failed:', error);
      return this.getDefaultPredictions(daysAhead);
    }
  }

  async predictPeakHours(daysAhead: number = 7): Promise<PeakHourPrediction[]> {
    try {
      const predictions: PeakHourPrediction[] = [];
      const today = new Date();

      for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
        const predictionDate = new Date(today);
        predictionDate.setDate(today.getDate() + dayOffset);
        const dayOfWeek = this.getDayName(predictionDate.getDay());

        // Analyze historical peak hours for this day of week
        const hourlyPatterns = this.getHourlyPatternsForDay(predictionDate.getDay());

        for (let hour = 0; hour < 24; hour++) {
          const baseVolume = hourlyPatterns[hour] || 0;
          const seasonalAdjustment = this.getSeasonalHourlyAdjustment(predictionDate, hour);
          const predictedCalls = Math.round(baseVolume * seasonalAdjustment);

          if (predictedCalls > 0) {
            predictions.push({
              hour,
              predictedCalls,
              confidence: 0.8,
              dayOfWeek
            });
          }
        }
      }

      return predictions.sort((a, b) => b.predictedCalls - a.predictedCalls);
    } catch (error) {
      console.error('Peak hours prediction failed:', error);
      return [];
    }
  }

  async predictChurn(userId: string): Promise<ChurnPrediction> {
    try {
      // Get user data
      const userData = await this.getUserData(userId);
      if (!userData) {
        throw new Error('User not found');
      }

      // Calculate churn probability based on various factors
      const factors = this.calculateChurnFactors(userData);
      const churnProbability = this.calculateChurnProbability(factors);

      const riskLevel = this.getRiskLevel(churnProbability);
      const recommendations = this.getChurnRecommendations(factors, riskLevel);

      return {
        userId,
        churnProbability,
        riskLevel,
        factors: Object.keys(factors),
        recommendations
      };
    } catch (error) {
      console.error('Churn prediction failed:', error);
      return {
        userId,
        churnProbability: 0.5,
        riskLevel: 'medium',
        factors: ['Insufficient data'],
        recommendations: ['Collect more user interaction data']
      };
    }
  }

  async scoreLead(leadId: string): Promise<LeadScoring> {
    try {
      const leadData = await this.getLeadData(leadId);
      if (!leadData) {
        throw new Error('Lead not found');
      }

      // Calculate lead score based on various factors
      const factors = [
        { factor: 'Company Size', weight: 0.2, value: this.scoreCompanySize(leadData.companySize) },
        { factor: 'Industry', weight: 0.15, value: this.scoreIndustry(leadData.industry) },
        { factor: 'Budget', weight: 0.25, value: this.scoreBudget(leadData.budget) },
        { factor: 'Timeline', weight: 0.2, value: this.scoreTimeline(leadData.timeline) },
        { factor: 'Engagement', weight: 0.15, value: this.scoreEngagementForLead(leadData.engagement) },
        { factor: 'Source', weight: 0.05, value: this.scoreSource(leadData.source) }
      ];

      const totalScore = factors.reduce((sum, f) => sum + (f.value * f.weight), 0);
      const grade = this.getLeadGrade(totalScore);

      return {
        leadId,
        score: Math.round(totalScore * 100),
        grade,
        factors
      };
    } catch (error) {
      console.error('Lead scoring failed:', error);
      return {
        leadId,
        score: 50,
        grade: 'C',
        factors: []
      };
    }
  }

  private async loadHistoricalData(): Promise<void> {
    try {
      // Load historical call data, user interactions, etc.
      const response = await fetch('/api/analytics/historical-data');
      const data = await response.json();
      this.historicalData = data.data || [];
    } catch (error) {
      console.error('Failed to load historical data:', error);
      this.historicalData = [];
    }
  }

  private calculateSeasonalFactors(): { [month: number]: number } {
    // Calculate seasonal factors based on historical data
    const monthlyAverages = this.calculateMonthlyAverages();
    const overallAverage = Object.values(monthlyAverages).reduce((sum, avg) => sum + avg, 0) / 12;

    const factors: { [month: number]: number } = {};
    for (let month = 0; month < 12; month++) {
      factors[month] = monthlyAverages[month] / overallAverage;
    }

    return factors;
  }

  private calculateTrendFactors(): { [day: number]: number } {
    // Calculate trend factors using linear regression
    const recentData = this.historicalData.slice(-30); // Last 30 days

    if (recentData.length < 7) {
      return Array.from({ length: 7 }, () => 1.0);
    }

    // Simple linear regression
    const n = recentData.length;
    const sumX = recentData.reduce((sum, _, index) => sum + index, 0);
    const sumY = recentData.reduce((sum, data) => sum + data.callVolume, 0);
    const sumXY = recentData.reduce((sum, data, index) => sum + (index * data.callVolume), 0);
    const sumX2 = recentData.reduce((sum, _, index) => sum + (index * index), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Predict next 7 days
    const factors: { [day: number]: number } = {};
    for (let day = 1; day <= 7; day++) {
      const predictedValue = slope * (n + day) + intercept;
      const averageValue = sumY / n;
      factors[day] = predictedValue / averageValue;
    }

    return factors;
  }

  private calculateMonthlyAverages(): { [month: number]: number } {
    const monthlyTotals: { [month: number]: number } = {};
    const monthlyCounts: { [month: number]: number } = {};

    this.historicalData.forEach(data => {
      const month = new Date(data.date).getMonth();
      monthlyTotals[month] = (monthlyTotals[month] || 0) + data.callVolume;
      monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const averages: { [month: number]: number } = {};
    for (let month = 0; month < 12; month++) {
      averages[month] = monthlyCounts[month] ? monthlyTotals[month] / monthlyCounts[month] : 0;
    }

    return averages;
  }

  private getHistoricalAverageForDate(date: Date): number {
    const dayOfWeek = date.getDay();
    const month = date.getMonth();

    // Get historical data for same day of week and month
    const relevantData = this.historicalData.filter(data => {
      const dataDate = new Date(data.date);
      return dataDate.getDay() === dayOfWeek && dataDate.getMonth() === month;
    });

    if (relevantData.length === 0) {
      return this.historicalData.reduce((sum, data) => sum + data.callVolume, 0) / this.historicalData.length || 50;
    }

    return relevantData.reduce((sum, data) => sum + data.callVolume, 0) / relevantData.length;
  }

  private calculatePredictionConfidence(date: Date): number {
    // Calculate confidence based on data availability and patterns
    const daysFromNow = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    // Confidence decreases as we predict further into the future
    const baseConfidence = 0.9;
    const confidenceDecay = 0.05 * daysFromNow;

    return Math.max(baseConfidence - confidenceDecay, 0.5);
  }

  private isHoliday(date: Date): boolean {
    // Check if date is a holiday (simplified)
    const holidays = [
      '01-01', '01-26', '08-15', '10-02', '12-25' // Indian holidays
    ];

    const dateStr = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return holidays.includes(dateStr);
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek];
  }

  private getMonthName(month: number): string {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
  }

  private getHourlyPatternsForDay(dayOfWeek: number): { [hour: number]: number } {
    // Get historical hourly patterns for specific day of week
    const dayData = this.historicalData.filter(data => new Date(data.date).getDay() === dayOfWeek);
    const hourlyPatterns: { [hour: number]: number } = {};

    for (let hour = 0; hour < 24; hour++) {
      const hourData = dayData.filter(data => data.hour === hour);
      if (hourData.length > 0) {
        hourlyPatterns[hour] = hourData.reduce((sum, data) => sum + data.callVolume, 0) / hourData.length;
      }
    }

    return hourlyPatterns;
  }

  private getSeasonalHourlyAdjustment(date: Date, hour: number): number {
    // Adjust hourly predictions based on season
    const month = date.getMonth();
    const seasonalFactors = {
      winter: [11, 0, 1], // Dec, Jan, Feb
      spring: [2, 3, 4], // Mar, Apr, May
      summer: [5, 6, 7], // Jun, Jul, Aug
      monsoon: [8, 9, 10] // Sep, Oct, Nov
    };

    let season = 'summer';
    Object.entries(seasonalFactors).forEach(([s, months]) => {
      if (months.includes(month)) season = s;
    });

    // Seasonal hourly adjustments
    const adjustments = {
      winter: { morning: 0.8, afternoon: 1.1, evening: 1.2 },
      spring: { morning: 0.9, afternoon: 1.0, evening: 1.1 },
      summer: { morning: 0.7, afternoon: 0.9, evening: 1.3 },
      monsoon: { morning: 1.0, afternoon: 1.2, evening: 0.8 }
    };

    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const seasonAdj = adjustments[season as keyof typeof adjustments];
    if (!seasonAdj) return 1.0;
    const value = (seasonAdj as Record<string, number>)[timeOfDay];
    return typeof value === 'number' ? value : 1.0;
  }

  private async getUserData(userId: string): Promise<any> {
    try {
      const response = await fetch(`/api/users/${userId}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  private calculateChurnFactors(userData: any): { [factor: string]: number } {
    return {
      callFrequency: this.scoreCallFrequency(userData.callFrequency),
      callDuration: this.scoreCallDuration(userData.avgCallDuration),
      satisfaction: userData.satisfactionScore || 0.5,
      lastInteraction: this.scoreLastInteraction(userData.lastInteractionDate),
      complaints: userData.complaintCount || 0,
      payments: this.scorePaymentHistory(userData.paymentHistory),
      engagement: this.scoreEngagementForChurn(userData.engagementScore)
    };
  }

  private scoreCallFrequency(frequency: number): number {
    // Higher frequency = lower churn risk
    if (frequency > 10) return 0.1;
    if (frequency > 5) return 0.3;
    if (frequency > 2) return 0.6;
    return 0.9;
  }

  private scoreCallDuration(duration: number): number {
    // Longer calls = higher engagement = lower churn risk
    if (duration > 300) return 0.1; // > 5 minutes
    if (duration > 120) return 0.3; // > 2 minutes
    if (duration > 60) return 0.6; // > 1 minute
    return 0.9;
  }

  private scoreLastInteraction(lastInteraction: string): number {
    const daysSince = Math.ceil((new Date().getTime() - new Date(lastInteraction).getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince <= 7) return 0.1;
    if (daysSince <= 30) return 0.3;
    if (daysSince <= 90) return 0.6;
    return 0.9;
  }

  private scorePaymentHistory(paymentHistory: any[]): number {
    if (!paymentHistory || paymentHistory.length === 0) return 0.8;

    const onTimePayments = paymentHistory.filter(p => p.status === 'on-time').length;
    const onTimeRate = onTimePayments / paymentHistory.length;

    return 1 - onTimeRate;
  }

  private scoreEngagementForChurn(engagementScore: number): number {
    // For churn scoring, higher engagement reduces churn risk
    return 1 - (engagementScore || 0.5);
  }

  private calculateChurnProbability(factors: { [factor: string]: number }): number {
    const weights = {
      callFrequency: 0.2,
      callDuration: 0.15,
      satisfaction: 0.25,
      lastInteraction: 0.2,
      complaints: 0.1,
      payments: 0.05,
      engagement: 0.05
    };

    let weightedSum = 0;
    Object.entries(factors).forEach(([factor, value]) => {
      weightedSum += value * (weights[factor as keyof typeof weights] || 0);
    });

    return Math.min(Math.max(weightedSum, 0), 1);
  }

  private getRiskLevel(probability: number): 'low' | 'medium' | 'high' {
    if (probability < 0.3) return 'low';
    if (probability < 0.7) return 'medium';
    return 'high';
  }

  private getChurnRecommendations(factors: { [factor: string]: number }, riskLevel: string): string[] {
    const recommendations: string[] = [];

    if (factors.callFrequency > 0.6) {
      recommendations.push('Increase engagement through regular check-ins');
    }

    if (factors.satisfaction > 0.6) {
      recommendations.push('Address satisfaction issues with personalized support');
    }

    if (factors.lastInteraction > 0.6) {
      recommendations.push('Re-engage with special offers or updates');
    }

    if (riskLevel === 'high') {
      recommendations.push('Assign dedicated account manager');
      recommendations.push('Offer retention incentives');
    }

    return recommendations;
  }

  private async getLeadData(leadId: string): Promise<any> {
    try {
      const response = await fetch(`/api/leads/${leadId}`);
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  private scoreCompanySize(size: string): number {
    const sizeScores = {
      'enterprise': 1.0,
      'large': 0.8,
      'medium': 0.6,
      'small': 0.4,
      'startup': 0.3
    };

    return sizeScores[size as keyof typeof sizeScores] || 0.5;
  }

  private scoreIndustry(industry: string): number {
    const highValueIndustries = ['finance', 'healthcare', 'technology', 'manufacturing'];
    const mediumValueIndustries = ['retail', 'education', 'government'];

    if (highValueIndustries.includes(industry.toLowerCase())) return 1.0;
    if (mediumValueIndustries.includes(industry.toLowerCase())) return 0.7;
    return 0.5;
  }

  private scoreBudget(budget: string): number {
    const budgetRanges = {
      '100000+': 1.0,
      '50000-100000': 0.8,
      '25000-50000': 0.6,
      '10000-25000': 0.4,
      '5000-10000': 0.2,
      '0-5000': 0.1
    };

    return budgetRanges[budget as keyof typeof budgetRanges] || 0.3;
  }

  private scoreTimeline(timeline: string): number {
    const timelineScores = {
      'immediate': 1.0,
      '1-2 weeks': 0.8,
      '1 month': 0.6,
      '2-3 months': 0.4,
      '3+ months': 0.2
    };

    return timelineScores[timeline as keyof typeof timelineScores] || 0.5;
  }

  private scoreEngagementForLead(engagement: number): number {
    // For lead scoring, higher engagement increases lead value
    return engagement || 0.5;
  }

  private scoreSource(source: string): number {
    const sourceScores = {
      'referral': 1.0,
      'website': 0.8,
      'email': 0.6,
      'social': 0.5,
      'cold': 0.3
    };

    return sourceScores[source as keyof typeof sourceScores] || 0.5;
  }

  private getLeadGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 80) return 'A';
    if (score >= 60) return 'B';
    if (score >= 40) return 'C';
    if (score >= 20) return 'D';
    return 'F';
  }

  private getDefaultPredictions(daysAhead: number): CallVolumePrediction[] {
    const predictions: CallVolumePrediction[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const predictionDate = new Date(today);
      predictionDate.setDate(today.getDate() + i);

      predictions.push({
        date: predictionDate,
        predictedVolume: 50,
        confidence: 0.5,
        factors: ['Default prediction - insufficient data']
      });
    }

    return predictions;
  }
}