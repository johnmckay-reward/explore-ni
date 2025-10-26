const { Setting } = require('../models');

/**
 * Seed the Setting table with all required settings
 * This creates entries with empty values that can be populated by the admin
 */
const seedSettings = async () => {
  try {
    console.log('[Seed Settings] Starting...');

    const defaultSettings = [
      {
        key: 'STRIPE_SECRET_KEY',
        description: 'Stripe Secret Key for payment processing',
        value: null,
      },
      {
        key: 'STRIPE_WEBHOOK_SECRET',
        description: 'Stripe Webhook Secret for verifying webhook signatures',
        value: null,
      },
      {
        key: 'TWILIO_ACCOUNT_SID',
        description: 'Twilio Account SID for SMS messaging',
        value: null,
      },
      {
        key: 'TWILIO_AUTH_TOKEN',
        description: 'Twilio Auth Token for SMS messaging',
        value: null,
      },
      {
        key: 'TWILIO_PHONE_NUMBER',
        description: 'Twilio Phone Number (E.164 format, e.g., +1234567890)',
        value: null,
      },
      {
        key: 'SENDGRID_API_KEY',
        description: 'SendGrid API Key for email delivery',
        value: null,
      },
      {
        key: 'PAYPAL_CLIENT_ID',
        description: 'PayPal Client ID for PayPal payment processing',
        value: null,
      },
      {
        key: 'PAYPAL_CLIENT_SECRET',
        description: 'PayPal Client Secret for PayPal payment processing',
        value: null,
      },
    ];

    for (const setting of defaultSettings) {
      const [settingRecord, created] = await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting,
      });

      if (created) {
        console.log(`[Seed Settings] Created: ${setting.key}`);
      } else {
        console.log(`[Seed Settings] Already exists: ${setting.key}`);
      }
    }

    console.log('[Seed Settings] Completed');
  } catch (error) {
    console.error('[Seed Settings] Error:', error);
    throw error;
  }
};

module.exports = {
  seedSettings,
};
