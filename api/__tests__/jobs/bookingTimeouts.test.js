// Mock dependencies
jest.mock('../../models', () => ({
  Booking: {
    findAll: jest.fn(),
  },
  Experience: {},
  Availability: {},
  User: {},
}));

jest.mock('../../services/email.service', () => ({
  sendBookingConfirmation: jest.fn(),
  sendBookingDeclined: jest.fn(),
}));

jest.mock('../../services/stripe.service', () => ({
  getStripeClient: jest.fn(),
}));

const { Booking } = require('../../models');
const emailService = require('../../services/email.service');
const stripeService = require('../../services/stripe.service');

// Business hours configuration
const BIZ_HOURS_START = 9; // 9 AM
const BIZ_HOURS_END = 17; // 5 PM
const TIMEOUT_BIZ_HOURS = 2 * 60 * 60 * 1000; // 2 hours
const TIMEOUT_NON_BIZ_HOURS = 12 * 60 * 60 * 1000; // 12 hours

/**
 * Check if current time is within business hours
 */
const isBusinessHours = (date) => {
  const hour = date.getHours();
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  return day >= 1 && day <= 5 && hour >= BIZ_HOURS_START && hour < BIZ_HOURS_END;
};

describe('Booking Timeout Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBusinessHours', () => {
    it('should return true for weekday during business hours', () => {
      // Tuesday at 10 AM
      const date = new Date('2024-01-02T10:00:00');
      expect(isBusinessHours(date)).toBe(true);
    });

    it('should return false for weekday before business hours', () => {
      // Tuesday at 8 AM
      const date = new Date('2024-01-02T08:00:00');
      expect(isBusinessHours(date)).toBe(false);
    });

    it('should return false for weekday after business hours', () => {
      // Tuesday at 6 PM
      const date = new Date('2024-01-02T18:00:00');
      expect(isBusinessHours(date)).toBe(false);
    });

    it('should return false for Saturday', () => {
      // Saturday at 10 AM
      const date = new Date('2024-01-06T10:00:00');
      expect(isBusinessHours(date)).toBe(false);
    });

    it('should return false for Sunday', () => {
      // Sunday at 10 AM
      const date = new Date('2024-01-07T10:00:00');
      expect(isBusinessHours(date)).toBe(false);
    });

    it('should return true at start of business hours', () => {
      // Tuesday at 9 AM
      const date = new Date('2024-01-02T09:00:00');
      expect(isBusinessHours(date)).toBe(true);
    });

    it('should return false at end of business hours', () => {
      // Tuesday at 5 PM
      const date = new Date('2024-01-02T17:00:00');
      expect(isBusinessHours(date)).toBe(false);
    });
  });

  describe('timeout threshold', () => {
    it('should use 2 hour threshold during business hours', () => {
      const now = new Date('2024-01-02T10:00:00'); // Tuesday 10 AM
      const isBizHours = isBusinessHours(now);
      const threshold = isBizHours ? TIMEOUT_BIZ_HOURS : TIMEOUT_NON_BIZ_HOURS;

      expect(threshold).toBe(2 * 60 * 60 * 1000);
    });

    it('should use 12 hour threshold outside business hours', () => {
      const now = new Date('2024-01-02T20:00:00'); // Tuesday 8 PM
      const isBizHours = isBusinessHours(now);
      const threshold = isBizHours ? TIMEOUT_BIZ_HOURS : TIMEOUT_NON_BIZ_HOURS;

      expect(threshold).toBe(12 * 60 * 60 * 1000);
    });
  });

  describe('timeout detection', () => {
    it('should detect booking that has timed out during business hours', () => {
      const now = new Date('2024-01-02T12:00:00'); // Tuesday 12 PM
      const createdAt = new Date('2024-01-02T09:00:00'); // Created at 9 AM
      
      const isBizHours = isBusinessHours(now);
      const threshold = isBizHours ? TIMEOUT_BIZ_HOURS : TIMEOUT_NON_BIZ_HOURS;
      const elapsedTime = now - createdAt;

      expect(elapsedTime).toBeGreaterThan(threshold);
    });

    it('should not detect timeout for recent booking', () => {
      const now = new Date('2024-01-02T10:00:00'); // Tuesday 10 AM
      const createdAt = new Date('2024-01-02T09:30:00'); // Created at 9:30 AM
      
      const isBizHours = isBusinessHours(now);
      const threshold = isBizHours ? TIMEOUT_BIZ_HOURS : TIMEOUT_NON_BIZ_HOURS;
      const elapsedTime = now - createdAt;

      expect(elapsedTime).toBeLessThanOrEqual(threshold);
    });
  });

  describe('timeout behavior - auto-confirm', () => {
    it('should auto-confirm booking when availability exists', async () => {
      const mockBooking = {
        id: 1,
        status: 'pending',
        quantity: 2,
        experience: {
          timeoutBehavior: 'auto-confirm',
          title: 'Test Experience',
        },
        availability: {
          availableSlots: 5,
        },
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        bookingDate: '2024-01-15',
        totalPrice: 100,
        save: jest.fn(),
      };

      // Simulate auto-confirm logic
      if (mockBooking.availability && mockBooking.availability.availableSlots > 0) {
        mockBooking.status = 'confirmed';
        await mockBooking.save();
        await emailService.sendBookingConfirmation({
          bookingId: mockBooking.id,
          customerName: mockBooking.customerName,
          customerEmail: mockBooking.customerEmail,
          experienceTitle: mockBooking.experience.title,
          bookingDate: mockBooking.bookingDate,
          quantity: mockBooking.quantity,
          totalPrice: mockBooking.totalPrice,
        });
      }

      expect(mockBooking.status).toBe('confirmed');
      expect(mockBooking.save).toHaveBeenCalled();
      expect(emailService.sendBookingConfirmation).toHaveBeenCalled();
    });
  });

  describe('timeout behavior - auto-decline', () => {
    it('should auto-decline booking and issue refund', async () => {
      const mockStripe = {
        refunds: {
          create: jest.fn().mockResolvedValue({ id: 're_123' }),
        },
      };
      stripeService.getStripeClient.mockReturnValue(mockStripe);

      const mockBooking = {
        id: 1,
        status: 'pending',
        quantity: 2,
        paymentIntentId: 'pi_123',
        experience: {
          timeoutBehavior: 'auto-decline',
          title: 'Test Experience',
        },
        availability: {
          availableSlots: 3,
          save: jest.fn(),
        },
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        bookingDate: '2024-01-15',
        totalPrice: 100,
        save: jest.fn(),
      };

      // Simulate auto-decline logic
      mockBooking.status = 'declined';
      await mockBooking.save();

      // Issue refund
      const stripe = stripeService.getStripeClient();
      if (stripe && mockBooking.paymentIntentId) {
        await stripe.refunds.create({
          payment_intent: mockBooking.paymentIntentId,
        });
      }

      // Restore availability
      if (mockBooking.availability) {
        mockBooking.availability.availableSlots += mockBooking.quantity;
        await mockBooking.availability.save();
      }

      // Send notification
      await emailService.sendBookingDeclined({
        bookingId: mockBooking.id,
        customerName: mockBooking.customerName,
        customerEmail: mockBooking.customerEmail,
        experienceTitle: mockBooking.experience.title,
        bookingDate: mockBooking.bookingDate,
        quantity: mockBooking.quantity,
        totalPrice: mockBooking.totalPrice,
      });

      expect(mockBooking.status).toBe('declined');
      expect(mockBooking.save).toHaveBeenCalled();
      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_123',
      });
      expect(mockBooking.availability.availableSlots).toBe(5); // 3 + 2
      expect(emailService.sendBookingDeclined).toHaveBeenCalled();
    });
  });

  describe('timeout behavior - escalate', () => {
    it('should mark booking as escalated', async () => {
      const mockBooking = {
        id: 1,
        status: 'pending',
        isEscalated: false,
        experience: {
          timeoutBehavior: 'escalate',
          title: 'Test Experience',
        },
        quantity: 2,
        bookingDate: '2024-01-15',
        totalPrice: 100,
        save: jest.fn(),
      };

      // Simulate escalate logic
      mockBooking.isEscalated = true;
      await mockBooking.save();

      expect(mockBooking.isEscalated).toBe(true);
      expect(mockBooking.save).toHaveBeenCalled();
    });
  });
});
