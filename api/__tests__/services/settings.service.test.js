// Mock the models before requiring settings service
jest.mock('../../models', () => ({
  Setting: {
    findAll: jest.fn(),
    findOne: jest.fn(),
  },
}));

const crypto = require('crypto');
const settingsService = require('../../services/settings.service');
const { Setting } = require('../../models');
const cryptoService = require('../../services/crypto.service');

describe('Settings Service', () => {
  const testSecret = crypto.randomBytes(32).toString('hex');

  beforeEach(() => {
    // Clear global.appSettings before each test
    global.appSettings = {};
    jest.clearAllMocks();
    
    // Set test encryption secret
    process.env.SETTINGS_ENCRYPTION_SECRET = testSecret;
  });

  afterEach(() => {
    delete process.env.SETTINGS_ENCRYPTION_SECRET;
  });

  describe('loadSettings', () => {
    it('should load and decrypt settings from database', async () => {
      const encryptedValue = cryptoService.encrypt('test-api-key', testSecret);
      
      Setting.findAll.mockResolvedValue([
        {
          key: 'STRIPE_SECRET_KEY',
          value: encryptedValue,
          description: 'Stripe Secret Key',
        },
      ]);

      await settingsService.loadSettings();

      expect(Setting.findAll).toHaveBeenCalled();
      expect(global.appSettings.STRIPE_SECRET_KEY).toBe('test-api-key');
    });

    it('should handle settings with null values', async () => {
      Setting.findAll.mockResolvedValue([
        {
          key: 'STRIPE_SECRET_KEY',
          value: null,
          description: 'Stripe Secret Key',
        },
      ]);

      await settingsService.loadSettings();

      expect(global.appSettings.STRIPE_SECRET_KEY).toBeUndefined();
    });

    it('should handle multiple settings', async () => {
      const encryptedStripe = cryptoService.encrypt('stripe-key', testSecret);
      const encryptedTwilio = cryptoService.encrypt('twilio-sid', testSecret);

      Setting.findAll.mockResolvedValue([
        {
          key: 'STRIPE_SECRET_KEY',
          value: encryptedStripe,
          description: 'Stripe Secret Key',
        },
        {
          key: 'TWILIO_ACCOUNT_SID',
          value: encryptedTwilio,
          description: 'Twilio Account SID',
        },
      ]);

      await settingsService.loadSettings();

      expect(global.appSettings.STRIPE_SECRET_KEY).toBe('stripe-key');
      expect(global.appSettings.TWILIO_ACCOUNT_SID).toBe('twilio-sid');
    });

    it('should not load settings if SETTINGS_ENCRYPTION_SECRET is not configured', async () => {
      delete process.env.SETTINGS_ENCRYPTION_SECRET;

      await settingsService.loadSettings();

      expect(Setting.findAll).not.toHaveBeenCalled();
      expect(global.appSettings).toEqual({});
    });

    it('should handle decryption errors gracefully', async () => {
      Setting.findAll.mockResolvedValue([
        {
          key: 'STRIPE_SECRET_KEY',
          value: 'invalid-encrypted-data',
          description: 'Stripe Secret Key',
        },
      ]);

      await settingsService.loadSettings();

      expect(global.appSettings.STRIPE_SECRET_KEY).toBeUndefined();
    });
  });

  describe('getSetting', () => {
    it('should return setting value from cache', () => {
      global.appSettings.STRIPE_SECRET_KEY = 'test-key';

      const value = settingsService.getSetting('STRIPE_SECRET_KEY');

      expect(value).toBe('test-key');
    });

    it('should return undefined for non-existent setting', () => {
      const value = settingsService.getSetting('NON_EXISTENT');

      expect(value).toBeUndefined();
    });
  });

  describe('updateSetting', () => {
    it('should encrypt and save setting', async () => {
      const mockSetting = {
        key: 'STRIPE_SECRET_KEY',
        value: null,
        save: jest.fn(),
      };

      Setting.findOne.mockResolvedValue(mockSetting);

      await settingsService.updateSetting('STRIPE_SECRET_KEY', 'new-api-key');

      expect(Setting.findOne).toHaveBeenCalledWith({
        where: { key: 'STRIPE_SECRET_KEY' },
      });
      expect(mockSetting.value).toBeDefined();
      expect(mockSetting.value).not.toBe('new-api-key'); // Should be encrypted
      expect(mockSetting.save).toHaveBeenCalled();
      expect(global.appSettings.STRIPE_SECRET_KEY).toBe('new-api-key');
    });

    it('should throw error if setting not found', async () => {
      Setting.findOne.mockResolvedValue(null);

      await expect(
        settingsService.updateSetting('NON_EXISTENT', 'value')
      ).rejects.toThrow("Setting with key 'NON_EXISTENT' not found");
    });

    it('should throw error if SETTINGS_ENCRYPTION_SECRET not configured', async () => {
      delete process.env.SETTINGS_ENCRYPTION_SECRET;

      await expect(
        settingsService.updateSetting('STRIPE_SECRET_KEY', 'value')
      ).rejects.toThrow('SETTINGS_ENCRYPTION_SECRET not configured');
    });
  });

  describe('getAllSettings', () => {
    it('should return all settings keys and descriptions', async () => {
      Setting.findAll.mockResolvedValue([
        {
          key: 'STRIPE_SECRET_KEY',
          description: 'Stripe Secret Key',
        },
        {
          key: 'TWILIO_ACCOUNT_SID',
          description: 'Twilio Account SID',
        },
      ]);

      const settings = await settingsService.getAllSettings();

      expect(settings).toHaveLength(2);
      expect(settings[0]).toEqual({
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe Secret Key',
      });
      expect(settings[1]).toEqual({
        key: 'TWILIO_ACCOUNT_SID',
        description: 'Twilio Account SID',
      });
      expect(Setting.findAll).toHaveBeenCalledWith({
        attributes: ['key', 'description'],
        order: [['key', 'ASC']],
      });
    });
  });
});
