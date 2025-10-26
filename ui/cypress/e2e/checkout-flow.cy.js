/**
 * Happy Path E2E Test for Checkout Flow
 * 
 * This test validates the complete booking flow:
 * 1. Visit homepage
 * 2. Click on an experience
 * 3. Select a date/time
 * 4. Fill out customer details
 * 5. Mock payment step
 * 6. Assert success page
 * 
 * Prerequisites:
 * - API server running on http://localhost:3000
 * - UI running on http://localhost:4200
 * - Database seeded with test data
 * 
 * To run:
 * npm run cypress:open
 * or
 * npm run cypress:run
 */

describe('Checkout Flow - Happy Path', () => {
  beforeEach(() => {
    // Visit the homepage
    cy.visit('/');
  });

  it('should complete a booking from homepage to success page', () => {
    // Step 1: Navigate to homepage
    cy.contains('Explore NI').should('be.visible');

    // Step 2: Click on the first experience card
    cy.get('.experience-card').first().click();

    // Step 3: Verify we're on the experience detail page
    cy.url().should('include', '/experience/');
    cy.get('h1').should('be.visible');

    // Step 4: Click "Book Now" button
    cy.contains('button', /book now/i).click();

    // Step 5: Verify we're on the checkout page
    cy.url().should('include', '/checkout/');

    // Step 6: Select an availability slot (if available)
    cy.get('[data-testid="availability-slot"]')
      .first()
      .click();

    // Step 7: Fill out customer details
    cy.get('input[name="firstName"]').type('John');
    cy.get('input[name="lastName"]').type('Doe');
    cy.get('input[name="email"]').type('john.doe@example.com');
    cy.get('input[name="phone"]').type('+447700900000');

    // Step 8: Proceed to payment
    cy.contains('button', /proceed to payment/i).click();

    // Step 9: Verify we're on the payment page
    cy.url().should('include', '/payment/');

    // Step 10: Mock Stripe payment
    // In a real scenario, we would use Stripe's test mode and test cards
    // For this test, we assume payment succeeds automatically or is mocked
    
    // Note: In production E2E tests, you would:
    // 1. Use Stripe test mode with test card numbers
    // 2. Fill in card details: 4242 4242 4242 4242
    // 3. Expiry: any future date
    // 4. CVC: any 3 digits
    
    // For now, we'll check if payment elements are present
    cy.get('[data-testid="stripe-element"]').should('be.visible');

    // Assuming auto-confirmation or mocked payment success,
    // we should be redirected to success page
    cy.url().should('include', '/payment-success/', { timeout: 10000 });

    // Step 11: Verify success page content
    cy.contains(/booking confirmed|success/i).should('be.visible');
    cy.get('[data-testid="booking-reference"]').should('be.visible');

    // Step 12: Verify booking details are displayed
    cy.contains('John Doe').should('be.visible');
  });

  it('should handle errors gracefully when no availability', () => {
    // Navigate to an experience with no availability
    cy.visit('/experience/999'); // Assuming 999 doesn't exist

    // Should show an error or "no availability" message
    cy.contains(/not found|no availability/i).should('be.visible');
  });

  it('should validate customer details form', () => {
    // Navigate to checkout for an experience
    cy.visit('/checkout/1');

    // Try to proceed without filling form
    cy.contains('button', /proceed to payment/i).click();

    // Should show validation errors
    cy.contains(/required|invalid/i).should('be.visible');
  });
});

/**
 * Additional E2E Test Ideas:
 * 
 * 1. Voucher Application Flow
 * 2. Admin Approval Workflow
 * 3. Vendor Experience Creation
 * 4. Mobile Responsive Tests
 * 5. Accessibility Tests
 * 6. Hotel Partner Landing Page
 * 7. Admin Settings Update
 */
