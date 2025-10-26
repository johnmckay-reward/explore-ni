const sgMail = require('@sendgrid/mail');

// Configure SendGrid with API key from environment
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * Send a booking confirmation email to the customer
 * @param {Object} bookingDetails - The booking details
 * @returns {Promise<void>}
 */
const sendBookingConfirmation = async (bookingDetails) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('[Email Service] SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: bookingDetails.customerEmail,
      from: 'noreply@explore-ni.com', // Use your verified sender
      subject: `Booking Confirmed - ${bookingDetails.experienceTitle}`,
      html: `
        <h2>Your Booking is Confirmed!</h2>
        <p>Dear ${bookingDetails.customerName},</p>
        <p>Your booking has been confirmed for the following experience:</p>
        <ul>
          <li><strong>Experience:</strong> ${bookingDetails.experienceTitle}</li>
          <li><strong>Date:</strong> ${bookingDetails.bookingDate}</li>
          <li><strong>Quantity:</strong> ${bookingDetails.quantity}</li>
          <li><strong>Total Price:</strong> £${bookingDetails.totalPrice}</li>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        </ul>
        <p>Thank you for choosing Explore NI!</p>
      `,
    };

    await sgMail.send(msg);
    console.log('[Email Service] Booking confirmation email sent to', bookingDetails.customerEmail);
  } catch (error) {
    console.error('[Email Service] Error sending booking confirmation:', error);
    // Don't throw - we don't want email failures to break the booking flow
  }
};

/**
 * Send a payment receipt email to the customer
 * @param {Object} bookingDetails - The booking details
 * @returns {Promise<void>}
 */
const sendPaymentReceipt = async (bookingDetails) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('[Email Service] SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: bookingDetails.customerEmail,
      from: 'noreply@explore-ni.com', // Use your verified sender
      subject: `Payment Receipt - Booking #${bookingDetails.bookingId}`,
      html: `
        <h2>Payment Receipt</h2>
        <p>Dear ${bookingDetails.customerName},</p>
        <p>We have received your payment for the following booking:</p>
        <ul>
          <li><strong>Experience:</strong> ${bookingDetails.experienceTitle}</li>
          <li><strong>Date:</strong> ${bookingDetails.bookingDate}</li>
          <li><strong>Quantity:</strong> ${bookingDetails.quantity}</li>
          <li><strong>Total Amount:</strong> £${bookingDetails.totalPrice}</li>
          <li><strong>Transaction ID:</strong> ${bookingDetails.transactionId}</li>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        </ul>
        <p>Thank you for your payment!</p>
      `,
    };

    await sgMail.send(msg);
    console.log('[Email Service] Payment receipt email sent to', bookingDetails.customerEmail);
  } catch (error) {
    console.error('[Email Service] Error sending payment receipt:', error);
    // Don't throw - we don't want email failures to break the booking flow
  }
};

/**
 * Send a new booking request notification to the vendor
 * @param {Object} bookingDetails - The booking details
 * @returns {Promise<void>}
 */
const sendVendorNewRequest = async (bookingDetails) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('[Email Service] SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: bookingDetails.vendorEmail,
      from: 'noreply@explore-ni.com', // Use your verified sender
      subject: `New Booking Request - ${bookingDetails.experienceTitle}`,
      html: `
        <h2>New Booking Request</h2>
        <p>Dear ${bookingDetails.vendorName},</p>
        <p>You have received a new booking request for your experience:</p>
        <ul>
          <li><strong>Experience:</strong> ${bookingDetails.experienceTitle}</li>
          <li><strong>Customer:</strong> ${bookingDetails.customerName} (${bookingDetails.customerEmail})</li>
          <li><strong>Date:</strong> ${bookingDetails.bookingDate}</li>
          <li><strong>Quantity:</strong> ${bookingDetails.quantity}</li>
          <li><strong>Total Price:</strong> £${bookingDetails.totalPrice}</li>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        </ul>
        <p>Please log in to your dashboard to review and confirm this booking.</p>
        <p><a href="${process.env.UI_BASE_URL}/dashboard/bookings">Go to Dashboard</a></p>
      `,
    };

    await sgMail.send(msg);
    console.log('[Email Service] Vendor notification email sent to', bookingDetails.vendorEmail);
  } catch (error) {
    console.error('[Email Service] Error sending vendor notification:', error);
    // Don't throw - we don't want email failures to break the booking flow
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendVendorNewRequest,
};
