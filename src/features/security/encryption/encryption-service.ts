import crypto from 'crypto';

export interface EncryptionKey {
  id: string;
  algorithm: string;
  key: Buffer;
  iv: Buffer;
  createdAt: Date;
  expiresAt: Date;
}

export interface EncryptedData {
  data: string;
  keyId: string;
  algorithm: string;
  iv: string;
  timestamp: number;
  tag?: string;
}

export class EncryptionService {
  private keys: Map<string, EncryptionKey> = new Map();
  private currentKeyId: string | null = null;
  private keyRotationInterval: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.initializeEncryption();
    this.startKeyRotation();
  }

  private initializeEncryption(): void {
    // Generate initial encryption key
    this.generateNewKey();
  }

  private generateNewKey(): void {
    const keyId = crypto.randomUUID();
    const algorithm = 'aes-256-gcm';
    const key = crypto.randomBytes(32); // 256 bits
    const iv = crypto.randomBytes(16); // 128 bits

    const encryptionKey: EncryptionKey = {
      id: keyId,
      algorithm,
      key,
      iv,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.keyRotationInterval)
    };

    this.keys.set(keyId, encryptionKey);
    this.currentKeyId = keyId;

    // Store key securely (in production, use HSM or key management service)
    this.storeKeySecurely(encryptionKey);
  }

  private storeKeySecurely(key: EncryptionKey): void {
    // In production, store in HSM or key management service
    // For now, store in memory with expiration
    setTimeout(() => {
      this.keys.delete(key.id);
      if (this.currentKeyId === key.id) {
        this.generateNewKey();
      }
    }, this.keyRotationInterval);
  }

  private startKeyRotation(): void {
    setInterval(() => {
      this.generateNewKey();
    }, this.keyRotationInterval);
  }

  async encryptText(text: string, keyId?: string): Promise<EncryptedData> {
    const encryptionKey = keyId ? this.keys.get(keyId) : this.keys.get(this.currentKeyId!);

    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    try {
      const cipher = crypto.createCipher(encryptionKey.algorithm, encryptionKey.key) as any;
      if (cipher.setAAD) cipher.setAAD(Buffer.from(encryptionKey.id)); // Additional authenticated data

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag ? cipher.getAuthTag() : null;

      const result: EncryptedData = {
        data: encrypted,
        keyId: encryptionKey.id,
        algorithm: encryptionKey.algorithm,
        iv: encryptionKey.iv.toString('hex'),
        timestamp: Date.now()
      };

      if (tag) result.tag = tag.toString('hex');
      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  async decryptText(encryptedData: EncryptedData): Promise<string> {
    const encryptionKey = this.keys.get(encryptedData.keyId);

    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    try {
      const decipher = crypto.createDecipher(encryptedData.algorithm, encryptionKey.key) as any;
      if (decipher.setAAD) decipher.setAAD(Buffer.from(encryptionKey.id));
      if (decipher.setAuthTag && encryptedData.tag) decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  async encryptAudio(audioBuffer: Buffer, keyId?: string): Promise<EncryptedData> {
    const encryptionKey = keyId ? this.keys.get(keyId) : this.keys.get(this.currentKeyId!);

    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    try {
      const cipher = crypto.createCipher(encryptionKey.algorithm, encryptionKey.key) as any;
      if (cipher.setAAD) cipher.setAAD(Buffer.from(encryptionKey.id));

      let encrypted = cipher.update(audioBuffer);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      const tag = cipher.getAuthTag ? cipher.getAuthTag() : null;

      const result: EncryptedData = {
        data: encrypted.toString('base64'),
        keyId: encryptionKey.id,
        algorithm: encryptionKey.algorithm,
        iv: encryptionKey.iv.toString('hex'),
        timestamp: Date.now()
      };

      if (tag) result.tag = tag.toString('hex');
      return result;
    } catch (error) {
      console.error('Audio encryption failed:', error);
      throw new Error('Failed to encrypt audio data');
    }
  }

  async decryptAudio(encryptedData: EncryptedData): Promise<Buffer> {
    const encryptionKey = this.keys.get(encryptedData.keyId);

    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    try {
      const decipher = crypto.createDecipher(encryptedData.algorithm, encryptionKey.key) as any;
      if (decipher.setAAD) decipher.setAAD(Buffer.from(encryptionKey.id));
      if (decipher.setAuthTag && encryptedData.tag) decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));

      const encryptedBuffer = Buffer.from(encryptedData.data, 'base64');
      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted;
    } catch (error) {
      console.error('Audio decryption failed:', error);
      throw new Error('Failed to decrypt audio data');
    }
  }

  async encryptFile(fileBuffer: Buffer, keyId?: string): Promise<EncryptedData> {
    // Similar to audio encryption but with file-specific optimizations
    return this.encryptAudio(fileBuffer, keyId);
  }

  async decryptFile(encryptedData: EncryptedData): Promise<Buffer> {
    return this.decryptAudio(encryptedData);
  }

  // Hashing for password and data integrity
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const passwordSalt = salt || crypto.randomBytes(32).toString('hex');

    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, passwordSalt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        else resolve({
          hash: derivedKey.toString('hex'),
          salt: passwordSalt
        });
      });
    });
  }

  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }

  // Data integrity verification
  async generateChecksum(data: Buffer | string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  async verifyChecksum(data: Buffer | string, expectedChecksum: string): Promise<boolean> {
    const actualChecksum = await this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }

  // Digital signatures
  async signData(data: string, privateKey: string): Promise<string> {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
  }

  async verifySignature(data: string, signature: string, publicKey: string): Promise<boolean> {
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'hex');
  }

  // Key management
  async rotateKey(): Promise<string> {
    this.generateNewKey();
    return this.currentKeyId!;
  }

  getCurrentKeyId(): string | null {
    return this.currentKeyId;
  }

  getKeyInfo(keyId: string): EncryptionKey | null {
    const key = this.keys.get(keyId);
    if (!key) return null;

    return {
      ...key,
      key: Buffer.alloc(0), // Don't expose the actual key
      iv: Buffer.alloc(0)   // Don't expose the actual IV
    };
  }

  // Secure random generation
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateSecureUUID(): string {
    return crypto.randomUUID();
  }

  // Key derivation for different purposes
  deriveKey(baseKey: string, purpose: string, salt?: string): Buffer {
    const keySalt = salt || crypto.randomBytes(16);
    return crypto.pbkdf2Sync(baseKey, keySalt, 100000, 32, 'sha256');
  }

  // API for secure communication
  async encryptAPIResponse(data: any): Promise<{ encrypted: EncryptedData; signature: string }> {
    const jsonString = JSON.stringify(data);
    const encrypted = await this.encryptText(jsonString);

    // Sign the encrypted data
    const signature = await this.signData(encrypted.data, process.env.API_PRIVATE_KEY!);

    return { encrypted, signature };
  }

  async decryptAPIRequest(encryptedData: EncryptedData, signature: string): Promise<any> {
    // Verify signature first
    const isValid = await this.verifySignature(
      encryptedData.data,
      signature,
      process.env.API_PUBLIC_KEY!
    );

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Decrypt the data
    const decrypted = await this.decryptText(encryptedData);
    return JSON.parse(decrypted);
  }

  // Database encryption helpers
  encryptDatabaseField(value: string): string {
    const encrypted = this.encryptTextSync(value);
    return JSON.stringify(encrypted);
  }

  decryptDatabaseField(encryptedValue: string): string {
    const encrypted = JSON.parse(encryptedValue) as EncryptedData;
    return this.decryptTextSync(encrypted);
  }

  private encryptTextSync(text: string): EncryptedData {
    const encryptionKey = this.keys.get(this.currentKeyId!);
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    const cipher = crypto.createCipher(encryptionKey.algorithm, encryptionKey.key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      data: encrypted,
      keyId: encryptionKey.id,
      algorithm: encryptionKey.algorithm,
      iv: encryptionKey.iv.toString('hex'),
      timestamp: Date.now()
    };
  }

  private decryptTextSync(encryptedData: EncryptedData): string {
    const encryptionKey = this.keys.get(encryptedData.keyId);
    if (!encryptionKey) {
      throw new Error('Encryption key not found');
    }

    const decipher = crypto.createDecipher(encryptedData.algorithm, encryptionKey.key);
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Cleanup expired keys
  cleanupExpiredKeys(): void {
    const now = Date.now();
    for (const [keyId, key] of this.keys.entries()) {
      if (key.expiresAt.getTime() < now) {
        this.keys.delete(keyId);
      }
    }
  }

  // Export/import keys for backup (encrypted)
  async exportKeys(): Promise<string> {
    const keysData = Array.from(this.keys.entries()).map(([id, key]) => ({
      id,
      algorithm: key.algorithm,
      key: key.key.toString('hex'),
      iv: key.iv.toString('hex'),
      createdAt: key.createdAt,
      expiresAt: key.expiresAt
    }));

    const jsonString = JSON.stringify(keysData);
    const encrypted = await this.encryptText(jsonString);
    return JSON.stringify(encrypted);
  }

  async importKeys(encryptedKeysData: string): Promise<void> {
    const keysData = await this.decryptText(JSON.parse(encryptedKeysData) as EncryptedData);
    const keys = JSON.parse(keysData);

    keys.forEach((keyData: any) => {
      const key: EncryptionKey = {
        id: keyData.id,
        algorithm: keyData.algorithm,
        key: Buffer.from(keyData.key, 'hex'),
        iv: Buffer.from(keyData.iv, 'hex'),
        createdAt: new Date(keyData.createdAt),
        expiresAt: new Date(keyData.expiresAt)
      };
      this.keys.set(key.id, key);
    });
  }
}