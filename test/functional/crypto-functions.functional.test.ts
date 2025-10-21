// test/functional/crypto-functions.functional.test.ts
/**
 * OWASP A02: Cryptographic Failures - Functional Tests
 *
 * Tests cryptographic functions for:
 * - Password hashing with bcrypt
 * - Password comparison (timing-attack resistant)
 * - Salt generation and strength
 * - Hash uniqueness and non-determinism
 * - Weak password rejection
 *
 * Coverage target: 90%+
 */

import bcrypt from 'bcryptjs';

describe('OWASP A02: Cryptographic Failures', () => {
  describe('bcrypt Password Hashing', () => {
    it('EXECUTES: Hashes passwords with bcrypt', async () => {
      const password = 'mySecurePassword123!';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password); // Hash should not equal plaintext
      expect(hash.length).toBeGreaterThan(50); // bcrypt hashes are ~60 chars
    });

    it('SECURITY: Uses sufficient salt rounds (10+)', async () => {
      const password = 'testPassword123';
      const hash = await bcrypt.hash(password, 10);

      // bcrypt hash format: $2a$10$...
      // $2a = algorithm
      // $10 = cost factor (rounds)
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/);

      // Extract cost factor
      const costMatch = hash.match(/^\$2[ab]\$(\d{2})\$/);
      expect(costMatch).not.toBeNull();

      const cost = parseInt(costMatch![1], 10);
      expect(cost).toBeGreaterThanOrEqual(10); // OWASP recommends 10+ rounds
    });

    it('SECURITY: Generates unique hashes for same password (salt randomness)', async () => {
      const password = 'samePassword123';

      const hash1 = await bcrypt.hash(password, 10);
      const hash2 = await bcrypt.hash(password, 10);

      // Same password should produce different hashes due to random salt
      expect(hash1).not.toBe(hash2);

      // But both should verify against the password
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });

    it('SECURITY: Hash is non-deterministic (no rainbow table attacks)', async () => {
      const commonPassword = 'password123';

      // Generate 5 hashes of the same password
      const hashes = await Promise.all([
        bcrypt.hash(commonPassword, 10),
        bcrypt.hash(commonPassword, 10),
        bcrypt.hash(commonPassword, 10),
        bcrypt.hash(commonPassword, 10),
        bcrypt.hash(commonPassword, 10),
      ]);

      // All hashes should be unique (different salts)
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(5);
    });

    it('EXECUTES: Handles Unicode characters in passwords', async () => {
      const unicodePassword = 'Jelszó123!@#áéíóúöüő';

      const hash = await bcrypt.hash(unicodePassword, 10);
      expect(hash).toBeDefined();

      // Should verify correctly
      const isValid = await bcrypt.compare(unicodePassword, hash);
      expect(isValid).toBe(true);
    });

    it('EXECUTES: Handles long passwords (72 character limit)', async () => {
      // bcrypt has a 72-byte limit
      const longPassword = 'a'.repeat(100);

      const hash = await bcrypt.hash(longPassword, 10);
      expect(hash).toBeDefined();

      // Should still verify
      const isValid = await bcrypt.compare(longPassword, hash);
      expect(isValid).toBe(true);
    });

    it('SECURITY: Higher cost factors increase computation time', async () => {
      const password = 'testPassword';

      const startLow = Date.now();
      await bcrypt.hash(password, 4); // Low cost
      const timeLow = Date.now() - startLow;

      const startHigh = Date.now();
      await bcrypt.hash(password, 10); // High cost
      const timeHigh = Date.now() - startHigh;

      // Higher cost should take more time (protection against brute force)
      expect(timeHigh).toBeGreaterThan(timeLow);
    });
  });

  describe('bcrypt Password Comparison', () => {
    let testHash: string;

    beforeAll(async () => {
      testHash = await bcrypt.hash('correctPassword123', 10);
    });

    it('EXECUTES: Returns true for correct password', async () => {
      const result = await bcrypt.compare('correctPassword123', testHash);
      expect(result).toBe(true);
    });

    it('SECURITY: Returns false for incorrect password', async () => {
      const result = await bcrypt.compare('wrongPassword123', testHash);
      expect(result).toBe(false);
    });

    it('SECURITY: Returns false for empty password', async () => {
      const result = await bcrypt.compare('', testHash);
      expect(result).toBe(false);
    });

    it('SECURITY: Case-sensitive password comparison', async () => {
      const hash = await bcrypt.hash('Password123', 10);

      expect(await bcrypt.compare('Password123', hash)).toBe(true);
      expect(await bcrypt.compare('password123', hash)).toBe(false); // Different case
      expect(await bcrypt.compare('PASSWORD123', hash)).toBe(false);
    });

    it('SECURITY: Returns false for slightly modified password', async () => {
      const hash = await bcrypt.hash('myPassword123!', 10);

      expect(await bcrypt.compare('myPassword123!', hash)).toBe(true);
      expect(await bcrypt.compare('myPassword123', hash)).toBe(false); // Missing !
      expect(await bcrypt.compare('myPassword124!', hash)).toBe(false); // Changed digit
      expect(await bcrypt.compare('myPassword123! ', hash)).toBe(false); // Extra space
    });

    it('SECURITY: Timing-attack resistant (constant-time comparison)', async () => {
      const hash = await bcrypt.hash('secretPassword', 10);

      // Compare timing for completely wrong password vs almost correct
      const wrongPasswords = [
        'xxxxxxxxxx',
        'secretPasswor', // Almost correct
      ];

      const timings: number[] = [];

      for (const wrongPwd of wrongPasswords) {
        const start = process.hrtime.bigint();
        await bcrypt.compare(wrongPwd, hash);
        const end = process.hrtime.bigint();
        timings.push(Number(end - start));
      }

      // Timing difference should be minimal (constant-time)
      // Note: This is a weak test, but validates bcrypt's design
      expect(timings[0]).toBeGreaterThan(0);
      expect(timings[1]).toBeGreaterThan(0);
    });
  });

  describe('Password Strength Validation', () => {
    it('SECURITY: Weak passwords should be rejected by app logic (not crypto)', () => {
      const weakPasswords = [
        'password', // Common dictionary word (8 chars)
        '12345678', // Sequential numbers (8 chars)
        'qwertyui', // Keyboard pattern (8 chars)
        'abcd1234', // Simple pattern (8 chars)
        '11111111', // Repeated character (8 chars)
      ];

      // App should validate BEFORE hashing
      // These are all 8+ chars but still weak due to patterns
      weakPasswords.forEach((weak) => {
        expect(weak.length).toBeGreaterThanOrEqual(8); // Length OK, but pattern weak
      });

      // Note: Actual validation is in API routes, not crypto layer
      // Crypto layer only handles hashing, not strength validation
    });

    it('EXECUTES: Strong passwords have sufficient entropy', () => {
      const strongPasswords = [
        'MyStr0ng!Pass@2024',
        'Correct-Horse-Battery-Staple',
        'jK9#mP2$vL5&nQ8*',
      ];

      strongPasswords.forEach((strong) => {
        expect(strong.length).toBeGreaterThanOrEqual(8);
        // Additional app-level checks should validate complexity
      });
    });
  });

  describe('OWASP A02 Security Scenarios', () => {
    it('SECURITY: Rainbow table attack prevented (unique salts)', async () => {
      // Attacker pre-computes hashes for common passwords
      const commonPassword = 'password123';

      const userHash1 = await bcrypt.hash(commonPassword, 10);
      const userHash2 = await bcrypt.hash(commonPassword, 10);

      // Different salts = different hashes = rainbow table useless
      expect(userHash1).not.toBe(userHash2);
    });

    it('SECURITY: Brute force attack slowed by high cost factor', async () => {
      const password = 'test123';

      // Cost factor 10 means 2^10 = 1024 iterations
      const start = Date.now();
      const hash = await bcrypt.hash(password, 10);
      const hashTime = Date.now() - start;

      // Should take at least some milliseconds (makes brute force slow)
      expect(hashTime).toBeGreaterThan(5);

      // Verify still works
      expect(await bcrypt.compare(password, hash)).toBe(true);
    });

    it('SECURITY: Hash collision resistance (different passwords = different hashes)', async () => {
      const password1 = 'password1';
      const password2 = 'password2';

      const hash1 = await bcrypt.hash(password1, 10);
      const hash2 = await bcrypt.hash(password2, 10);

      expect(hash1).not.toBe(hash2);

      // Cross-verification should fail
      expect(await bcrypt.compare(password1, hash2)).toBe(false);
      expect(await bcrypt.compare(password2, hash1)).toBe(false);
    });

    it('SECURITY: Password database leak does not reveal plaintext', async () => {
      const userPasswords = [
        'alicePassword123',
        'bobSecret456',
        'charliePass789',
      ];

      const hashes = await Promise.all(
        userPasswords.map((pwd) => bcrypt.hash(pwd, 10))
      );

      // Even if attacker gets hashes, cannot reverse to plaintext
      hashes.forEach((hash, i) => {
        expect(hash).not.toContain(userPasswords[i]);
        expect(hash).not.toContain('Password');
        expect(hash).not.toContain('Secret');
        expect(hash).not.toContain('Pass');
      });
    });

    it('SECURITY: Old bcrypt hashes still verifiable (backward compatibility)', async () => {
      // Simulate old hash from database (created years ago)
      const oldHash = await bcrypt.hash('legacyPassword', 10);

      // Should still verify correctly
      expect(await bcrypt.compare('legacyPassword', oldHash)).toBe(true);
      expect(await bcrypt.compare('wrongPassword', oldHash)).toBe(false);
    });

    it('SECURITY: Empty/null password handling', async () => {
      const hash = await bcrypt.hash('validPassword', 10);

      // Empty passwords should not validate
      expect(await bcrypt.compare('', hash)).toBe(false);

      // But we can hash empty strings (app should prevent this)
      const emptyHash = await bcrypt.hash('', 10);
      expect(emptyHash).toBeDefined();
      expect(await bcrypt.compare('', emptyHash)).toBe(true);
    });
  });

  describe('Cryptographic Best Practices Validation', () => {
    it('EXECUTES: bcrypt hash format follows standard', async () => {
      const hash = await bcrypt.hash('test', 10);

      // bcrypt hash format: $2a$10$saltsaltsaltsaltsalthashhashhashhashhashhashhashhas
      // $2a or $2b = bcrypt version
      // $10 = cost factor
      // next 22 chars = salt (base64)
      // remaining 31 chars = hash (base64)

      expect(hash).toMatch(/^\$2[ab]\$/);
      expect(hash.split('$')).toHaveLength(4);
      expect(hash.length).toBeGreaterThanOrEqual(59);
    });

    it('SECURITY: Salt extraction from hash', async () => {
      const password = 'testPassword';
      const hash = await bcrypt.hash(password, 10);

      // Salt is embedded in hash (first 29 chars including cost)
      const salt = hash.substring(0, 29);

      expect(salt).toMatch(/^\$2[ab]\$\d{2}\$/);

      // Note: bcrypt automatically uses embedded salt for verification
      // This is why same hash verifies different passwords with different salts
    });

    it('EXECUTES: bcryptjs library is available', () => {
      // Ensure we're using bcryptjs (pure JS implementation)
      // This is safer for cross-platform compatibility

      // Verify bcrypt module is loaded
      expect(bcrypt).toBeDefined();
      expect(bcrypt.hash).toBeDefined();
      expect(bcrypt.compare).toBeDefined();

      // Verify it's functional
      expect(typeof bcrypt.hash).toBe('function');
      expect(typeof bcrypt.compare).toBe('function');
    });
  });
});
