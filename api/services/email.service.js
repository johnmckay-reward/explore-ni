const sgMail = require('@sendgrid/mail');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

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

/**
 * Send a booking declined notification email to the customer
 * @param {Object} bookingDetails - The booking details
 * @returns {Promise<void>}
 */
const sendBookingDeclined = async (bookingDetails) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('[Email Service] SendGrid API key not configured, skipping email');
      return;
    }

    const msg = {
      to: bookingDetails.customerEmail,
      from: 'noreply@explore-ni.com', // Use your verified sender
      subject: `Booking Declined - ${bookingDetails.experienceTitle}`,
      html: `
        <h2>Booking Declined</h2>
        <p>Dear ${bookingDetails.customerName},</p>
        <p>We regret to inform you that your booking request has been declined by the vendor:</p>
        <ul>
          <li><strong>Experience:</strong> ${bookingDetails.experienceTitle}</li>
          <li><strong>Date:</strong> ${bookingDetails.bookingDate}</li>
          <li><strong>Quantity:</strong> ${bookingDetails.quantity}</li>
          <li><strong>Total Price:</strong> £${bookingDetails.totalPrice}</li>
          <li><strong>Booking ID:</strong> ${bookingDetails.bookingId}</li>
        </ul>
        <p>A full refund has been processed and will appear in your account within 5-10 business days.</p>
        <p>We apologize for any inconvenience. Please browse our other experiences at <a href="${process.env.UI_BASE_URL}">Explore NI</a>.</p>
      `,
    };

    await sgMail.send(msg);
    console.log('[Email Service] Booking declined email sent to', bookingDetails.customerEmail);
  } catch (error) {
    console.error('[Email Service] Error sending booking declined email:', error);
    // Don't throw - we don't want email failures to break the booking flow
  }
};

/**
 * Generate a PDF voucher
 * @param {Object} voucher - The voucher details
 * @returns {Promise<Buffer>} - The PDF as a buffer
 */
const generateVoucherPDF = async (voucher) => {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 400]);
    const { width, height } = page.getSize();
    
    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw header
    page.drawText('NI Experiences', {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.4, 0.6),
    });

    // Draw title
    page.drawText('Gift Voucher', {
      x: 50,
      y: height - 100,
      size: 32,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw voucher code
    page.drawText('Voucher Code:', {
      x: 50,
      y: height - 150,
      size: 14,
      font: regularFont,
      color: rgb(0, 0, 0),
    });
    page.drawText(voucher.code, {
      x: 50,
      y: height - 175,
      size: 20,
      font: boldFont,
      color: rgb(0.8, 0, 0),
    });

    // Draw value
    let valueText = '';
    if (voucher.type === 'fixed_amount') {
      valueText = `Value: £${parseFloat(voucher.initialValue).toFixed(2)}`;
    } else if (voucher.experienceTitle) {
      valueText = `Experience: ${voucher.experienceTitle}`;
    }
    
    page.drawText(valueText, {
      x: 50,
      y: height - 215,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Draw sender info if available
    if (voucher.senderName) {
      page.drawText(`From: ${voucher.senderName}`, {
        x: 50,
        y: height - 255,
        size: 12,
        font: regularFont,
        color: rgb(0, 0, 0),
      });
    }

    // Draw message if available
    if (voucher.message) {
      page.drawText('Message:', {
        x: 50,
        y: height - 285,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      // Simple text wrapping for message
      const maxWidth = 500;
      const words = voucher.message.split(' ');
      let line = '';
      let yPosition = height - 305;
      
      for (const word of words) {
        const testLine = line + word + ' ';
        const testWidth = regularFont.widthOfTextAtSize(testLine, 11);
        
        if (testWidth > maxWidth && line !== '') {
          page.drawText(line, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
            color: rgb(0, 0, 0),
          });
          line = word + ' ';
          yPosition -= 15;
        } else {
          line = testLine;
        }
      }
      
      if (line !== '') {
        page.drawText(line, {
          x: 50,
          y: yPosition,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        });
      }
    }

    // Draw footer
    page.drawText('Visit explore-ni.com to redeem this voucher', {
      x: 50,
      y: 50,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  } catch (error) {
    console.error('[Email Service] Error generating PDF:', error);
    throw error;
  }
};

/**
 * Send a voucher email with PDF attachment to the recipient
 * @param {Object} voucher - The voucher details
 * @returns {Promise<void>}
 */
const sendVoucherEmail = async (voucher) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('[Email Service] SendGrid API key not configured, skipping email');
      return;
    }

    // Generate PDF
    const pdfBuffer = await generateVoucherPDF(voucher);

    // Prepare email content
    let valueDescription = '';
    if (voucher.type === 'fixed_amount') {
      valueDescription = `£${parseFloat(voucher.initialValue).toFixed(2)}`;
    } else if (voucher.experienceTitle) {
      valueDescription = `1x ${voucher.experienceTitle}`;
    }

    const msg = {
      to: voucher.recipientEmail,
      from: 'noreply@explore-ni.com',
      subject: `You've Received a Gift Voucher from ${voucher.senderName || 'NI Experiences'}!`,
      html: `
        <h2>You've Received a Gift Voucher!</h2>
        <p>Dear ${voucher.recipientName || 'Valued Customer'},</p>
        ${voucher.senderName ? `<p><strong>${voucher.senderName}</strong> has sent you a gift voucher for NI Experiences!</p>` : '<p>You have received a gift voucher for NI Experiences!</p>'}
        ${voucher.message ? `<p><em>"${voucher.message}"</em></p>` : ''}
        <p><strong>Voucher Details:</strong></p>
        <ul>
          <li><strong>Code:</strong> ${voucher.code}</li>
          <li><strong>Value:</strong> ${valueDescription}</li>
        </ul>
        <p>Your gift voucher is attached to this email as a PDF. You can print it or save it for your records.</p>
        <p>To redeem your voucher, visit our website at <a href="${process.env.UI_BASE_URL || 'https://explore-ni.com'}">${process.env.UI_BASE_URL || 'explore-ni.com'}</a> and enter your voucher code at checkout.</p>
        <p>We hope you enjoy your NI Experience!</p>
        <p>Best regards,<br>The NI Experiences Team</p>
      `,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: `voucher-${voucher.code}.pdf`,
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    console.log('[Email Service] Voucher email sent to', voucher.recipientEmail);
  } catch (error) {
    console.error('[Email Service] Error sending voucher email:', error);
    // Don't throw - we don't want email failures to break the voucher creation flow
  }
};

module.exports = {
  sendBookingConfirmation,
  sendPaymentReceipt,
  sendVendorNewRequest,
  sendBookingDeclined,
  sendVoucherEmail,
};
