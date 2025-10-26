const { Setting } = require('../models');
const cryptoService = require('./crypto.service');

// Global settings cache
global.appSettings = {};

/**
 * Load all settings from the database and decrypt them
 * This should be called on application startup
 */
const loadSettings = async () => {
  try {
    const encryptionSecret = process.env.SETTINGS_ENCRYPTION_SECRET;
    
    if (!encryptionSecret) {
      console.warn('[Settings Service] SETTINGS_ENCRYPTION_SECRET not configured. Settings will not be loaded.');
      return;
    }

    const settings = await Setting.findAll();
    
    console.log(`[Settings Service] Loading ${settings.length} settings...`);

    // Clear existing settings
    global.appSettings = {};

    // Decrypt and load each setting
    for (const setting of settings) {
      try {
        if (setting.value) {
          const decryptedValue = cryptoService.decrypt(setting.value, encryptionSecret);
          global.appSettings[setting.key] = decryptedValue;
        } else {
          // Setting not yet configured, leave as undefined
          global.appSettings[setting.key] = undefined;
        }
      } catch (error) {
        console.error(`[Settings Service] Error decrypting setting ${setting.key}:`, error);
        global.appSettings[setting.key] = undefined;
      }
    }

    console.log('[Settings Service] Settings loaded successfully');
    console.log('[Settings Service] Available settings:', Object.keys(global.appSettings));
  } catch (error) {
    console.error('[Settings Service] Error loading settings:', error);
    throw error;
  }
};

/**
 * Get a setting value from the cache
 * @param {string} key - The setting key
 * @returns {string|undefined} - The setting value or undefined if not found
 */
const getSetting = (key) => {
  return global.appSettings[key];
};

/**
 * Update a setting value in the database and cache
 * @param {string} key - The setting key
 * @param {string} value - The new value (will be encrypted)
 */
const updateSetting = async (key, value) => {
  try {
    const encryptionSecret = process.env.SETTINGS_ENCRYPTION_SECRET;
    
    if (!encryptionSecret) {
      throw new Error('SETTINGS_ENCRYPTION_SECRET not configured');
    }

    // Find the setting
    const setting = await Setting.findOne({ where: { key } });
    
    if (!setting) {
      throw new Error(`Setting with key '${key}' not found`);
    }

    // Encrypt the new value
    const encryptedValue = cryptoService.encrypt(value, encryptionSecret);

    // Update the database
    setting.value = encryptedValue;
    await setting.save();

    // Update the cache
    global.appSettings[key] = value;

    console.log(`[Settings Service] Updated setting: ${key}`);
  } catch (error) {
    console.error(`[Settings Service] Error updating setting ${key}:`, error);
    throw error;
  }
};

/**
 * Get all setting keys and descriptions (but NOT values)
 * @returns {Array} - Array of setting objects with key and description
 */
const getAllSettings = async () => {
  try {
    const settings = await Setting.findAll({
      attributes: ['key', 'description'],
      order: [['key', 'ASC']],
    });

    return settings.map(s => ({
      key: s.key,
      description: s.description,
    }));
  } catch (error) {
    console.error('[Settings Service] Error getting all settings:', error);
    throw error;
  }
};

module.exports = {
  loadSettings,
  getSetting,
  updateSetting,
  getAllSettings,
};
