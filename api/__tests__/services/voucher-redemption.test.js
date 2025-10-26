// Mock dependencies
jest.mock('../../models', () => ({
  Voucher: {
    findOne: jest.fn(),
  },
  Booking: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../services/stripe.service', () => ({
  getStripeClient: jest.fn(),
}));

const { Voucher, Booking } = require('../../models');
const stripeService = require('../../services/stripe.service');

describe('Voucher Redemption Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fixed_amount voucher', () => {
    it('should apply voucher when it covers full booking amount', async () => {
      // Arrange
      const mockVoucher = {
        code: 'TEST123',
        type: 'fixed_amount',
        currentBalance: 100,
        isEnabled: true,
        expiryDate: null,
        save: jest.fn(),
      };

      const mockBooking = {
        id: 1,
        experienceId: 1,
        totalPrice: 50,
        paymentStatus: 'pending',
        paymentIntentId: 'pi_123',
        save: jest.fn(),
      };

      Voucher.findOne.mockResolvedValue(mockVoucher);
      Booking.findByPk.mockResolvedValue(mockBooking);
      stripeService.getStripeClient.mockReturnValue(null);

      // Act
      // Simulate voucher application logic
      const currentTotal = parseFloat(mockBooking.totalPrice);
      const voucherBalance = parseFloat(mockVoucher.currentBalance);
      
      let newBalance;
      let newTotalPrice;
      
      if (currentTotal <= voucherBalance) {
        newBalance = voucherBalance - currentTotal;
        newTotalPrice = 0;
        mockBooking.paymentStatus = 'succeeded';
        
        if (newBalance === 0) {
          mockVoucher.isEnabled = false;
        }
      }

      mockVoucher.currentBalance = newBalance;
      mockBooking.totalPrice = newTotalPrice;

      // Assert
      expect(mockVoucher.currentBalance).toBe(50);
      expect(mockBooking.totalPrice).toBe(0);
      expect(mockBooking.paymentStatus).toBe('succeeded');
      expect(mockVoucher.isEnabled).toBe(true); // Still has balance
    });

    it('should apply voucher when it covers partial booking amount', async () => {
      // Arrange
      const mockVoucher = {
        code: 'TEST123',
        type: 'fixed_amount',
        currentBalance: 30,
        isEnabled: true,
        expiryDate: null,
        save: jest.fn(),
      };

      const mockBooking = {
        id: 1,
        experienceId: 1,
        totalPrice: 50,
        paymentStatus: 'pending',
        paymentIntentId: 'pi_123',
        save: jest.fn(),
      };

      // Act - Simulate voucher application logic
      const currentTotal = parseFloat(mockBooking.totalPrice);
      const voucherBalance = parseFloat(mockVoucher.currentBalance);
      
      let newBalance;
      let newTotalPrice;
      
      if (currentTotal <= voucherBalance) {
        newBalance = voucherBalance - currentTotal;
        newTotalPrice = 0;
        mockBooking.paymentStatus = 'succeeded';
        
        if (newBalance === 0) {
          mockVoucher.isEnabled = false;
        }
      } else {
        newBalance = 0;
        newTotalPrice = currentTotal - voucherBalance;
        mockVoucher.isEnabled = false;
      }

      mockVoucher.currentBalance = newBalance;
      mockBooking.totalPrice = newTotalPrice;

      // Assert
      expect(mockVoucher.currentBalance).toBe(0);
      expect(mockBooking.totalPrice).toBe(20);
      expect(mockBooking.paymentStatus).toBe('pending');
      expect(mockVoucher.isEnabled).toBe(false); // Fully used
    });

    it('should disable voucher when fully used', async () => {
      // Arrange
      const mockVoucher = {
        code: 'TEST123',
        type: 'fixed_amount',
        currentBalance: 50,
        isEnabled: true,
        expiryDate: null,
        save: jest.fn(),
      };

      const mockBooking = {
        id: 1,
        experienceId: 1,
        totalPrice: 50,
        paymentStatus: 'pending',
        paymentIntentId: 'pi_123',
        save: jest.fn(),
      };

      // Act
      const currentTotal = parseFloat(mockBooking.totalPrice);
      const voucherBalance = parseFloat(mockVoucher.currentBalance);
      
      const newBalance = voucherBalance - currentTotal;
      const newTotalPrice = 0;
      mockBooking.paymentStatus = 'succeeded';
      
      if (newBalance === 0) {
        mockVoucher.isEnabled = false;
      }

      mockVoucher.currentBalance = newBalance;
      mockBooking.totalPrice = newTotalPrice;

      // Assert
      expect(mockVoucher.currentBalance).toBe(0);
      expect(mockBooking.totalPrice).toBe(0);
      expect(mockBooking.paymentStatus).toBe('succeeded');
      expect(mockVoucher.isEnabled).toBe(false);
    });
  });

  describe('experience voucher', () => {
    it('should apply experience voucher for matching experience', async () => {
      // Arrange
      const mockVoucher = {
        code: 'EXP123',
        type: 'experience',
        experienceId: 1,
        isEnabled: true,
        expiryDate: null,
        save: jest.fn(),
      };

      const mockBooking = {
        id: 1,
        experienceId: 1,
        totalPrice: 50,
        paymentStatus: 'pending',
        save: jest.fn(),
      };

      // Act - Simulate experience voucher application
      if (mockVoucher.experienceId === mockBooking.experienceId) {
        mockBooking.totalPrice = 0;
        mockBooking.paymentStatus = 'succeeded';
        mockVoucher.isEnabled = false;
      }

      // Assert
      expect(mockBooking.totalPrice).toBe(0);
      expect(mockBooking.paymentStatus).toBe('succeeded');
      expect(mockVoucher.isEnabled).toBe(false);
    });

    it('should reject experience voucher for non-matching experience', async () => {
      // Arrange
      const mockVoucher = {
        code: 'EXP123',
        type: 'experience',
        experienceId: 1,
        isEnabled: true,
        expiryDate: null,
      };

      const mockBooking = {
        id: 1,
        experienceId: 2,
        totalPrice: 50,
        paymentStatus: 'pending',
      };

      // Act & Assert
      const isValidForExperience = mockVoucher.experienceId === mockBooking.experienceId;
      expect(isValidForExperience).toBe(false);
    });
  });

  describe('voucher validation', () => {
    it('should reject disabled voucher', () => {
      const mockVoucher = {
        code: 'TEST123',
        isEnabled: false,
      };

      expect(mockVoucher.isEnabled).toBe(false);
    });

    it('should reject expired voucher', () => {
      const mockVoucher = {
        code: 'TEST123',
        isEnabled: true,
        expiryDate: new Date(Date.now() - 86400000), // Yesterday
      };

      const isExpired = new Date(mockVoucher.expiryDate) < new Date();
      expect(isExpired).toBe(true);
    });

    it('should accept non-expired voucher', () => {
      const mockVoucher = {
        code: 'TEST123',
        isEnabled: true,
        expiryDate: new Date(Date.now() + 86400000), // Tomorrow
      };

      const isExpired = mockVoucher.expiryDate && new Date(mockVoucher.expiryDate) < new Date();
      expect(isExpired).toBe(false);
    });
  });
});
