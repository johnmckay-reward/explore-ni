const settingsService = require('./settings.service');

/**
 * Get Stripe client configured with settings
 * @returns {object|null} - Stripe client or null if not configured
 */
const getStripeClient = () => {
  const secretKey = settingsService.getSetting('STRIPE_SECRET_KEY');
  
  if (secretKey) {
    return require('stripe')(secretKey);
  }
  return null;
};

/**
 * Get Stripe webhook secret from settings
 * @returns {string|null} - Webhook secret or null if not configured
 */
const getWebhookSecret = () => {
  return settingsService.getSetting('STRIPE_WEBHOOK_SECRET');
};

module.exports = {
  getStripeClient,
  getWebhookSecret,
};
