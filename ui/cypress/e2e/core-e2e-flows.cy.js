/**
 * Epic 9: Core E2E Business Logic Tests
 * 
 * Tests critical end-to-end business flows:
 * - Auto-confirm booking with Stripe payment
 * - Manual-confirm booking with SMS notification
 * - Manual-confirm decline with refund
 * - Fixed-amount voucher purchase and redemption
 * - Experience voucher purchase and redemption
 * 
 * Prerequisites:
 * - API running with seeded test data
 * - Stripe Test Mode configured
 * - Twilio configured (for SMS tests)
 * - SendGrid configured (for email tests)
 * 
 * Run: npm run cypress:open
 * 
 * Note: These tests require full integration with external services
 */

describe('Core E2E Business Logic Tests', () => {
  
  beforeEach(() => {
    // Clear session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('E2E-001: Auto-Confirm Booking with Stripe', () => {
    it('should complete auto-confirm booking end-to-end', () => {
      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Navigate to auto-confirm experience
      cy.visit('/experiences');
      cy.contains('City Bike Tour', { timeout: 5000 }).click();
      
      // Verify we're on the detail page
      cy.url().should('include', '/experience/');
      
      // Click Book Now
      cy.get('button').contains(/book now/i).click();
      
      // Select date and time slot
      cy.get('[data-testid="availability-slot"]').first().click();
      
      // Select quantity
      cy.get('input[name="quantity"]').clear().type('2');
      
      // Proceed to checkout
      cy.get('button').contains(/proceed|checkout|next/i).click();
      
      // Fill in customer details (if needed)
      cy.get('input[name="firstName"]').type('Mary');
      cy.get('input[name="lastName"]').type('Magee');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900000');
      
      // Proceed to payment
      cy.get('button').contains(/proceed to payment|continue/i).click();
      
      // Wait for payment page
      cy.url({ timeout: 5000 }).should('include', '/payment');
      
      // Fill in Stripe test card
      // Note: This requires Stripe Elements to be loaded
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body)
          .find('input[name="cardnumber"]')
          .type('4242424242424242');
        cy.wrap($body)
          .find('input[name="exp-date"]')
          .type('1225'); // 12/25
        cy.wrap($body)
          .find('input[name="cvc"]')
          .type('123');
        cy.wrap($body)
          .find('input[name="postal"]')
          .type('12345');
      });
      
      // Submit payment
      cy.get('button[type="submit"]').contains(/pay|complete|confirm/i).click();
      
      // Should redirect to success page
      cy.url({ timeout: 15000 }).should('include', '/booking/success');
      
      // Verify success message
      cy.contains(/confirmed|success|thank you/i).should('be.visible');
      
      // Verify booking reference shown
      cy.get('[data-testid="booking-reference"]').should('be.visible');
    });
  });

  describe('E2E-002: Manual-Confirm Booking with SMS', () => {
    it('should create pending booking and allow vendor to confirm', () => {
      // Step 1: Customer creates booking
      cy.visit('/login');
      cy.get('input[name="email"]').type('paddy@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Find manual-confirm experience
      cy.visit('/experiences');
      cy.contains('Private Art Class', { timeout: 5000 }).click();
      
      // Book experience
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      cy.get('input[name="quantity"]').clear().type('1');
      cy.get('button').contains(/proceed/i).click();
      
      // Fill details
      cy.get('input[name="firstName"]').type('Paddy');
      cy.get('input[name="lastName"]').type('Johnston');
      cy.get('input[name="email"]').type('paddy@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900111');
      
      // Proceed to payment
      cy.get('button').contains(/proceed to payment/i).click();
      
      // Complete Stripe payment
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('input[name="cardnumber"]').type('4242424242424242');
        cy.wrap($body).find('input[name="exp-date"]').type('1225');
        cy.wrap($body).find('input[name="cvc"]').type('123');
        cy.wrap($body).find('input[name="postal"]').type('12345');
      });
      
      cy.get('button[type="submit"]').contains(/pay|complete/i).click();
      
      // Should see "Pending Approval" message
      cy.url({ timeout: 15000 }).should('include', '/booking/success');
      cy.contains(/pending|awaiting approval/i).should('be.visible');
      
      // Logout customer
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/log out/i).click();
      cy.wait(500);
      
      // Step 2: Vendor confirms booking
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@exploreni.com');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Navigate to booking requests
      cy.visit('/dashboard/requests');
      
      // Should see pending booking
      cy.get('[data-testid="booking-request"]', { timeout: 5000 }).should('exist');
      
      // Click confirm
      cy.get('[data-testid="booking-request"]').first().within(() => {
        cy.get('button').contains(/confirm|approve/i).click();
      });
      
      // Confirm in dialog
      cy.get('button').contains(/yes|confirm/i).click();
      
      // Verify success
      cy.contains(/confirmed|success/i, { timeout: 5000 }).should('be.visible');
      
      // Booking should disappear from requests
      cy.get('[data-testid="booking-request"]').should('not.contain', 'Private Art Class');
    });
  });

  describe('E2E-003: Manual-Confirm Decline with Refund', () => {
    it('should allow vendor to decline booking and issue refund', () => {
      // Step 1: Customer creates booking (same as E2E-002)
      cy.visit('/login');
      cy.get('input[name="email"]').type('shauna@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      cy.visit('/experiences');
      cy.contains('Private Art Class').click();
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      cy.get('input[name="quantity"]').clear().type('1');
      cy.get('button').contains(/proceed/i).click();
      
      cy.get('input[name="firstName"]').type('Shauna');
      cy.get('input[name="lastName"]').type('Kelly');
      cy.get('input[name="email"]').type('shauna@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900222');
      cy.get('button').contains(/proceed to payment/i).click();
      
      // Complete payment
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('input[name="cardnumber"]').type('4242424242424242');
        cy.wrap($body).find('input[name="exp-date"]').type('1225');
        cy.wrap($body).find('input[name="cvc"]').type('123');
        cy.wrap($body).find('input[name="postal"]').type('12345');
      });
      
      cy.get('button[type="submit"]').contains(/pay|complete/i).click();
      cy.url({ timeout: 15000 }).should('include', '/booking/success');
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/log out/i).click();
      cy.wait(500);
      
      // Step 2: Vendor declines booking
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@exploreni.com');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      cy.visit('/dashboard/requests');
      
      // Click decline
      cy.get('[data-testid="booking-request"]').first().within(() => {
        cy.get('button').contains(/decline|reject/i).click();
      });
      
      // Confirm decline
      cy.get('button').contains(/yes|confirm|decline/i).click();
      
      // Verify success
      cy.contains(/declined|refunded/i, { timeout: 5000 }).should('be.visible');
      
      // Booking should disappear
      cy.get('[data-testid="booking-request"]').should('not.exist');
    });
  });

  describe('E2E-004: Fixed-Amount Voucher Flow', () => {
    it('should purchase and redeem fixed-amount voucher', () => {
      // Step 1: Purchase voucher
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Navigate to gift vouchers
      cy.visit('/gift-vouchers');
      
      // Select £50 voucher
      cy.contains('£50').click();
      
      // Fill in details
      cy.get('input[name="senderName"]').type('Mary Magee');
      cy.get('input[name="recipientName"]').type('Paddy Johnston');
      cy.get('input[name="recipientEmail"]').type('paddy@exploreni.com');
      cy.get('textarea[name="message"]').type('Happy Birthday!');
      
      // Continue to payment
      cy.get('button').contains(/continue|proceed/i).click();
      
      // Pay with Stripe
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('input[name="cardnumber"]').type('4242424242424242');
        cy.wrap($body).find('input[name="exp-date"]').type('1225');
        cy.wrap($body).find('input[name="cvc"]').type('123');
        cy.wrap($body).find('input[name="postal"]').type('12345');
      });
      
      cy.get('button[type="submit"]').contains(/pay|complete/i).click();
      
      // Verify success
      cy.url({ timeout: 15000 }).should('include', '/success');
      cy.contains(/success|sent/i).should('be.visible');
      
      // Get voucher code (would be in email in production)
      // For testing, we'll use admin panel to get the code
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/log out/i).click();
      cy.wait(500);
      
      // Step 2: Redeem voucher
      cy.visit('/login');
      cy.get('input[name="email"]').type('paddy@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Book a £100 experience
      cy.visit('/experiences');
      cy.contains('City Bike Tour').click(); // £100 experience
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      cy.get('input[name="quantity"]').clear().type('1');
      cy.get('button').contains(/proceed/i).click();
      
      cy.get('input[name="firstName"]').type('Paddy');
      cy.get('input[name="lastName"]').type('Johnston');
      cy.get('input[name="email"]').type('paddy@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900111');
      cy.get('button').contains(/proceed to payment/i).click();
      
      // Apply voucher (assuming we know the code format)
      cy.get('input[name="voucherCode"]').type('GIFT-XXXX-XXXX'); // Replace with actual code
      cy.get('button').contains(/apply/i).click();
      
      // Verify price reduced
      cy.contains(/£50|50.00/i).should('be.visible');
      
      // Complete payment for remaining amount
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('input[name="cardnumber"]').type('4242424242424242');
        cy.wrap($body).find('input[name="exp-date"]').type('1225');
        cy.wrap($body).find('input[name="cvc"]').type('123');
        cy.wrap($body).find('input[name="postal"]').type('12345');
      });
      
      cy.get('button[type="submit"]').contains(/pay|complete/i).click();
      
      // Verify success
      cy.url({ timeout: 15000 }).should('include', '/booking/success');
    });
  });

  describe('E2E-005: Experience Voucher (Gift & Redeem)', () => {
    it('should gift experience and validate redemption', () => {
      // Step 1: Purchase experience voucher
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Navigate to City Bike Tour
      cy.visit('/experiences');
      cy.contains('City Bike Tour').click();
      
      // Click Gift this Experience
      cy.get('button').contains(/gift this experience/i).click();
      
      // Fill in details
      cy.get('input[name="senderName"]').type('Mary Magee');
      cy.get('input[name="recipientName"]').type('Shauna Kelly');
      cy.get('input[name="recipientEmail"]').type('shauna@exploreni.com');
      cy.get('textarea[name="message"]').type('Enjoy this amazing tour!');
      
      // Continue to payment
      cy.get('button').contains(/continue|proceed/i).click();
      
      // Pay
      cy.get('iframe[name^="__privateStripeFrame"]').then($iframe => {
        const $body = $iframe.contents().find('body');
        cy.wrap($body).find('input[name="cardnumber"]').type('4242424242424242');
        cy.wrap($body).find('input[name="exp-date"]').type('1225');
        cy.wrap($body).find('input[name="cvc"]').type('123');
        cy.wrap($body).find('input[name="postal"]').type('12345');
      });
      
      cy.get('button[type="submit"]').contains(/pay|complete/i).click();
      cy.url({ timeout: 15000 }).should('include', '/success');
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/log out/i).click();
      cy.wait(500);
      
      // Step 2: Try to use on wrong experience
      cy.visit('/login');
      cy.get('input[name="email"]').type('shauna@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Book wrong experience
      cy.visit('/experiences');
      cy.contains('Private Art Class').click(); // Wrong experience
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      cy.get('input[name="quantity"]').clear().type('1');
      cy.get('button').contains(/proceed/i).click();
      
      cy.get('input[name="firstName"]').type('Shauna');
      cy.get('input[name="lastName"]').type('Kelly');
      cy.get('input[name="email"]').type('shauna@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900222');
      cy.get('button').contains(/proceed to payment/i).click();
      
      // Try to apply voucher
      cy.get('input[name="voucherCode"]').type('EXP-XXXX-XXXX'); // Replace with actual code
      cy.get('button').contains(/apply/i).click();
      
      // Should show error
      cy.contains(/not valid|wrong experience|invalid/i, { timeout: 5000 }).should('be.visible');
      
      // Step 3: Use on correct experience
      cy.visit('/experiences');
      cy.contains('City Bike Tour').click(); // Correct experience
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      cy.get('input[name="quantity"]').clear().type('1');
      cy.get('button').contains(/proceed/i).click();
      
      cy.get('input[name="firstName"]').type('Shauna');
      cy.get('input[name="lastName"]').type('Kelly');
      cy.get('input[name="email"]').type('shauna@exploreni.com');
      cy.get('input[name="phone"]').type('+447700900222');
      cy.get('button').contains(/proceed to payment/i).click();
      
      // Apply voucher
      cy.get('input[name="voucherCode"]').type('EXP-XXXX-XXXX');
      cy.get('button').contains(/apply/i).click();
      
      // Verify total is £0
      cy.contains(/£0|0.00/i).should('be.visible');
      
      // Payment form should be hidden
      cy.get('iframe[name^="__privateStripeFrame"]').should('not.exist');
      
      // Complete booking without payment
      cy.get('button').contains(/complete|confirm/i).click();
      
      // Verify success
      cy.url({ timeout: 15000 }).should('include', '/booking/success');
    });
  });
});
