const crypto = require('crypto');

// AES-256-GCM encryption parameters
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * Encrypt a string value using AES-256-GCM
 * @param {string} plaintext - The string to encrypt
 * @param {string} secret - The encryption secret key
 * @returns {string} - The encrypted value as base64 string with format: salt:iv:encrypted:tag
 */
const encrypt = (plaintext, secret) => {
  if (!plaintext || !secret) {
    throw new Error('Plaintext and secret are required for encryption');
  }

  // Generate a random salt
  const salt = crypto.randomBytes(SALT_LENGTH);

  // Derive a key from the secret using PBKDF2
  const key = crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, 'sha256');

  // Generate a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);

  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the plaintext
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Get the authentication tag
  const tag = cipher.getAuthTag();

  // Return format: salt:iv:encrypted:tag (all in base64)
  return `${salt.toString('base64')}:${iv.toString('base64')}:${encrypted}:${tag.toString('base64')}`;
};

/**
 * Decrypt an encrypted string value using AES-256-GCM
 * @param {string} encryptedData - The encrypted value in format: salt:iv:encrypted:tag
 * @param {string} secret - The encryption secret key
 * @returns {string} - The decrypted plaintext
 */
const decrypt = (encryptedData, secret) => {
  if (!encryptedData || !secret) {
    throw new Error('Encrypted data and secret are required for decryption');
  }

  // Parse the encrypted data
  const parts = encryptedData.split(':');
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }

  const salt = Buffer.from(parts[0], 'base64');
  const iv = Buffer.from(parts[1], 'base64');
  const encrypted = parts[2];
  const tag = Buffer.from(parts[3], 'base64');

  // Derive the key from the secret using the same salt
  const key = crypto.pbkdf2Sync(secret, salt, 100000, KEY_LENGTH, 'sha256');

  // Create decipher
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  // Decrypt the data
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

module.exports = {
  encrypt,
  decrypt,
};
