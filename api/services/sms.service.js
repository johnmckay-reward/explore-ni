const twilio = require('twilio');

// Initialize Twilio client only if credentials are available
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send an SMS message
 * @param {string} toPhoneNumber - The recipient's phone number (E.164 format)
 * @param {string} messageBody - The message content
 * @returns {Promise<void>}
 */
const sendSms = async (toPhoneNumber, messageBody) => {
  try {
    if (!twilioClient) {
      console.log('[SMS Service] Twilio not configured, skipping SMS');
      return;
    }

    if (!process.env.TWILIO_PHONE_NUMBER) {
      console.log('[SMS Service] TWILIO_PHONE_NUMBER not configured, skipping SMS');
      return;
    }

    const message = await twilioClient.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: toPhoneNumber,
    });

    console.log('[SMS Service] SMS sent successfully:', message.sid);
  } catch (error) {
    console.error('[SMS Service] Error sending SMS:', error);
    // Don't throw - we don't want SMS failures to break the booking flow
  }
};

/**
 * Send a new booking request SMS to the vendor
 * @param {Object} vendor - The vendor user object
 * @param {Object} bookingDetails - The booking details
 * @returns {Promise<void>}
 */
const sendVendorNewRequestSms = async (vendor, bookingDetails) => {
  try {
    if (!vendor.phoneNumber) {
      console.log('[SMS Service] Vendor has no phone number, skipping SMS');
      return;
    }

    const messageBody = `NI Experiences: New booking request for ${bookingDetails.experienceTitle}. Please log in to confirm.`;

    await sendSms(vendor.phoneNumber, messageBody);
  } catch (error) {
    console.error('[SMS Service] Error sending vendor notification SMS:', error);
    // Don't throw - we don't want SMS failures to break the booking flow
  }
};

module.exports = {
  sendSms,
  sendVendorNewRequestSms,
};
