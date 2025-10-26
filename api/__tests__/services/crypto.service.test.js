const crypto = require('crypto');
const cryptoService = require('../../services/crypto.service');

describe('Crypto Service', () => {
  const testSecret = crypto.randomBytes(32).toString('hex');

  describe('encrypt', () => {
    it('should encrypt a string', () => {
      const plaintext = 'test secret value';
      const encrypted = cryptoService.encrypt(plaintext, testSecret);

      expect(encrypted).toBeDefined();
      expect(typeof encrypted).toBe('string');
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted.split(':').length).toBe(4); // salt:iv:encrypted:tag
    });

    it('should throw error if plaintext is missing', () => {
      expect(() => cryptoService.encrypt('', testSecret)).toThrow();
      expect(() => cryptoService.encrypt(null, testSecret)).toThrow();
    });

    it('should throw error if secret is missing', () => {
      expect(() => cryptoService.encrypt('test', '')).toThrow();
      expect(() => cryptoService.encrypt('test', null)).toThrow();
    });

    it('should produce different encrypted values for the same plaintext', () => {
      const plaintext = 'test secret value';
      const encrypted1 = cryptoService.encrypt(plaintext, testSecret);
      const encrypted2 = cryptoService.encrypt(plaintext, testSecret);

      expect(encrypted1).not.toBe(encrypted2); // Due to random IV and salt
    });
  });

  describe('decrypt', () => {
    it('should decrypt an encrypted string', () => {
      const plaintext = 'test secret value';
      const encrypted = cryptoService.encrypt(plaintext, testSecret);
      const decrypted = cryptoService.decrypt(encrypted, testSecret);

      expect(decrypted).toBe(plaintext);
    });

    it('should decrypt complex strings', () => {
      const plaintext = 'sk_test_51abcd1234567890!@#$%^&*()';
      const encrypted = cryptoService.encrypt(plaintext, testSecret);
      const decrypted = cryptoService.decrypt(encrypted, testSecret);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw error if encrypted data is invalid', () => {
      expect(() => cryptoService.decrypt('invalid', testSecret)).toThrow();
      expect(() => cryptoService.decrypt('a:b:c', testSecret)).toThrow();
    });

    it('should throw error if secret is wrong', () => {
      const plaintext = 'test secret value';
      const encrypted = cryptoService.encrypt(plaintext, testSecret);
      const wrongSecret = crypto.randomBytes(32).toString('hex');

      expect(() => cryptoService.decrypt(encrypted, wrongSecret)).toThrow();
    });

    it('should throw error if encrypted data or secret is missing', () => {
      expect(() => cryptoService.decrypt('', testSecret)).toThrow();
      expect(() => cryptoService.decrypt(null, testSecret)).toThrow();
      expect(() => cryptoService.decrypt('test:test:test:test', '')).toThrow();
    });
  });

  describe('encryption/decryption roundtrip', () => {
    it('should handle various data types as strings', () => {
      const testCases = [
        'simple string',
        'string with spaces and special chars !@#$%',
        '{"json": "object"}',
        '12345',
        'very long string '.repeat(100),
      ];

      testCases.forEach(testCase => {
        const encrypted = cryptoService.encrypt(testCase, testSecret);
        const decrypted = cryptoService.decrypt(encrypted, testSecret);
        expect(decrypted).toBe(testCase);
      });
    });
  });
});
