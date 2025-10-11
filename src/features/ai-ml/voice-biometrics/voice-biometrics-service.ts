import crypto from 'crypto';

export interface VoiceProfile {
  id: string;
  userId: string;
  voiceprint: string;
  confidence: number;
  createdAt: Date;
  lastUsed: Date;
  verificationCount: number;
  successRate: number;
}

export interface VerificationResult {
  success: boolean;
  confidence: number;
  userId?: string;
  reason?: string;
}

export class VoiceBiometricsService {
  private voiceProfiles: Map<string, VoiceProfile> = new Map();
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.VOICE_BIOMETRICS_KEY || crypto.randomBytes(32).toString('hex');
  }

  async enrollVoice(userId: string, audioBuffer: Buffer): Promise<VoiceProfile> {
    try {
      // Extract voice features from audio
      const voiceFeatures = await this.extractVoiceFeatures(audioBuffer);
      
      // Create voiceprint (encrypted)
      const voiceprint = this.createVoiceprint(voiceFeatures);
      
      // Check if user already has a voice profile
      const existingProfile = Array.from(this.voiceProfiles.values())
        .find(profile => profile.userId === userId);

      const voiceProfile: VoiceProfile = {
        id: existingProfile?.id || crypto.randomUUID(),
        userId,
        voiceprint,
        confidence: 0.95,
        createdAt: existingProfile?.createdAt || new Date(),
        lastUsed: new Date(),
        verificationCount: existingProfile?.verificationCount || 0,
        successRate: existingProfile?.successRate || 1.0
      };

      this.voiceProfiles.set(voiceProfile.id, voiceProfile);
      
      // Store in database
      await this.saveVoiceProfile(voiceProfile);
      
      return voiceProfile;
    } catch (error) {
      console.error('Voice enrollment failed:', error);
      throw new Error('Failed to enroll voice');
    }
  }

  async verifyVoice(audioBuffer: Buffer, userId?: string): Promise<VerificationResult> {
    try {
      // Extract voice features from audio
      const voiceFeatures = await this.extractVoiceFeatures(audioBuffer);
      
      if (userId) {
        // Verify against specific user
        return await this.verifySpecificUser(voiceFeatures, userId);
      } else {
        // Identify user from voice
        return await this.identifyUser(voiceFeatures);
      }
    } catch (error) {
      console.error('Voice verification failed:', error);
      return {
        success: false,
        confidence: 0,
        reason: 'Verification failed due to technical error'
      };
    }
  }

  private async extractVoiceFeatures(audioBuffer: Buffer): Promise<number[]> {
    // Extract various voice features:
    // - Pitch (fundamental frequency)
    // - Formants (resonant frequencies)
    // - Spectral characteristics
    // - Temporal features
    // - Voice quality measures
    
    const features: number[] = [];
    
    // Simulate feature extraction (in real implementation, use audio processing libraries)
    for (let i = 0; i < 256; i++) {
      features.push(Math.random() * 1000);
    }
    
    return features;
  }

  private createVoiceprint(features: number[]): string {
    // Create a unique voiceprint from features
    const featureString = features.join(',');
    const hash = crypto.createHash('sha256');
    hash.update(featureString);
    
    // Encrypt the voiceprint
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(hash.digest('hex'), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }

  private async verifySpecificUser(features: number[], userId: string): Promise<VerificationResult> {
    const userProfiles = Array.from(this.voiceProfiles.values())
      .filter(profile => profile.userId === userId);

    if (userProfiles.length === 0) {
      return {
        success: false,
        confidence: 0,
        reason: 'User not found'
      };
    }

    const profile = userProfiles[0];
    const storedVoiceprint = profile.voiceprint;
    
    // Compare current voice features with stored voiceprint
    const similarity = await this.compareVoiceprints(features, storedVoiceprint);
    
    // Update verification statistics
    profile.verificationCount++;
    profile.lastUsed = new Date();
    
    if (similarity > 0.85) {
      profile.successRate = (profile.successRate * (profile.verificationCount - 1) + 1) / profile.verificationCount;
      await this.saveVoiceProfile(profile);
      
      return {
        success: true,
        confidence: similarity,
        userId: profile.userId
      };
    } else {
      profile.successRate = (profile.successRate * (profile.verificationCount - 1)) / profile.verificationCount;
      await this.saveVoiceProfile(profile);
      
      return {
        success: false,
        confidence: similarity,
        reason: 'Voice does not match stored profile'
      };
    }
  }

  private async identifyUser(features: number[]): Promise<VerificationResult> {
    let bestMatch: { profile: VoiceProfile; similarity: number } | null = null;
    
    for (const profile of this.voiceProfiles.values()) {
      const similarity = await this.compareVoiceprints(features, profile.voiceprint);
      
      if (!bestMatch || similarity > bestMatch.similarity) {
        bestMatch = { profile, similarity };
      }
    }

    if (bestMatch && bestMatch.similarity > 0.85) {
      return {
        success: true,
        confidence: bestMatch.similarity,
        userId: bestMatch.profile.userId
      };
    }

    return {
      success: false,
      confidence: bestMatch?.similarity || 0,
      reason: bestMatch ? 'No matching voice profile found' : 'No voice profiles available'
    };
  }

  private async compareVoiceprints(features: number[], storedVoiceprint: string): Promise<number> {
    try {
      // Decrypt stored voiceprint
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
      let decrypted = decipher.update(storedVoiceprint, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Create current voiceprint
      const currentVoiceprint = this.createVoiceprint(features);
      
      // Compare voiceprints (simplified similarity calculation)
      const similarity = this.calculateSimilarity(decrypted, currentVoiceprint);
      
      return similarity;
    } catch (error) {
      console.error('Voiceprint comparison failed:', error);
      return 0;
    }
  }

  private calculateSimilarity(voiceprint1: string, voiceprint2: string): number {
    // Calculate similarity between two voiceprints
    // This is a simplified implementation
    
    const bytes1 = Buffer.from(voiceprint1, 'hex');
    const bytes2 = Buffer.from(voiceprint2, 'hex');
    
    let matchingBytes = 0;
    const minLength = Math.min(bytes1.length, bytes2.length);
    
    for (let i = 0; i < minLength; i++) {
      if (bytes1[i] === bytes2[i]) {
        matchingBytes++;
      }
    }
    
    return matchingBytes / minLength;
  }

  private async saveVoiceProfile(profile: VoiceProfile): Promise<void> {
    // Save to database
    try {
      const response = await fetch('/api/voice-biometrics/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save voice profile');
      }
    } catch (error) {
      console.error('Failed to save voice profile:', error);
    }
  }

  async deleteVoiceProfile(userId: string): Promise<boolean> {
    try {
      const profiles = Array.from(this.voiceProfiles.values())
        .filter(profile => profile.userId === userId);
      
      for (const profile of profiles) {
        this.voiceProfiles.delete(profile.id);
        
        // Delete from database
        await fetch(`/api/voice-biometrics/delete/${profile.id}`, {
          method: 'DELETE'
        });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to delete voice profile:', error);
      return false;
    }
  }

  async getVoiceProfile(userId: string): Promise<VoiceProfile | null> {
    const profile = Array.from(this.voiceProfiles.values())
      .find(p => p.userId === userId);
    
    return profile || null;
  }

  async updateVoiceProfile(userId: string, audioBuffer: Buffer): Promise<VoiceProfile> {
    // Update existing voice profile with new audio
    const existingProfile = await this.getVoiceProfile(userId);
    
    if (!existingProfile) {
      throw new Error('Voice profile not found');
    }

    // Extract new features and update voiceprint
    const voiceFeatures = await this.extractVoiceFeatures(audioBuffer);
    const newVoiceprint = this.createVoiceprint(voiceFeatures);
    
    // Update profile
    existingProfile.voiceprint = newVoiceprint;
    existingProfile.lastUsed = new Date();
    existingProfile.confidence = Math.min(existingProfile.confidence + 0.01, 1.0);
    
    await this.saveVoiceProfile(existingProfile);
    
    return existingProfile;
  }

  // Liveness detection to prevent spoofing
  async detectLiveness(audioBuffer: Buffer): Promise<boolean> {
    try {
      // Check for signs of live speech vs recorded playback
      const features = await this.extractVoiceFeatures(audioBuffer);
      
      // Analyze for:
      // - Natural speech patterns
      // - Background noise variations
      // - Voice consistency
      // - Temporal patterns
      
      const livenessScore = this.calculateLivenessScore(features);
      
      return livenessScore > 0.7;
    } catch (error) {
      console.error('Liveness detection failed:', error);
      return false;
    }
  }

  private calculateLivenessScore(features: number[]): number {
    // Simplified liveness detection
    // In real implementation, use advanced ML models
    
    // Check for random variations typical of live speech
    const variance = this.calculateVariance(features);
    const mean = features.reduce((sum, val) => sum + val, 0) / features.length;
    
    // Live speech typically has more variance than recorded playback
    const normalizedVariance = variance / (mean * mean);
    
    return Math.min(normalizedVariance / 100, 1.0);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  // Get analytics for voice biometrics
  async getVoiceBiometricsAnalytics(): Promise<{
    totalProfiles: number;
    averageSuccessRate: number;
    totalVerifications: number;
    enrollmentsToday: number;
    verificationsToday: number;
  }> {
    const profiles = Array.from(this.voiceProfiles.values());
    
    const totalProfiles = profiles.length;
    const averageSuccessRate = profiles.reduce((sum, p) => sum + p.successRate, 0) / totalProfiles || 0;
    const totalVerifications = profiles.reduce((sum, p) => sum + p.verificationCount, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const enrollmentsToday = profiles.filter(p => p.createdAt >= today).length;
    const verificationsToday = profiles.filter(p => p.lastUsed >= today).length;
    
    return {
      totalProfiles,
      averageSuccessRate,
      totalVerifications,
      enrollmentsToday,
      verificationsToday
    };
  }
}