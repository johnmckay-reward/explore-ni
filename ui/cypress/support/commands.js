/**
 * Cypress Support Commands for QA Testing
 *
 * Custom commands to simplify common test operations:
 * - Login helpers for different user roles
 * - Test data creation utilities
 * - Common assertions
 * - API mocking helpers
 */

// ==========================================
// Login Commands
// ==========================================

/**
 * Login as admin user
 * @example cy.loginAsAdmin()
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.session('admin', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('admin@niexperiences.co.uk');
    cy.get('input[name="password"]').type('admin123');
    cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
    cy.url({ timeout: 5000 }).should('not.include', '/login');
  });
});

/**
 * Login as vendor user
 * @param {string} email - Vendor email (defaults to davy@niexperiences.co.uk)
 * @example cy.loginAsVendor()
 * @example cy.loginAsVendor('siobhan@niexperiences.co.uk')
 */
Cypress.Commands.add('loginAsVendor', (email = 'davy@niexperiences.co.uk') => {
  cy.session(`vendor-${email}`, () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('vendor123');
    cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
    cy.url({ timeout: 5000 }).should('include', '/dashboard');
  });
});

/**
 * Login as customer user
 * @param {string} email - Customer email (defaults to mary@niexperiences.co.uk)
 * @example cy.loginAsCustomer()
 * @example cy.loginAsCustomer('paddy@niexperiences.co.uk')
 */
Cypress.Commands.add('loginAsCustomer', (email = 'mary@niexperiences.co.uk') => {
  cy.session(`customer-${email}`, () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type('customer123');
    cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
    cy.url({ timeout: 5000 }).should('not.include', '/login');
  });
});

/**
 * Logout current user
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains(/log out|sign out/i).click();
  cy.wait(500);
});

// ==========================================
// Stripe Payment Commands
// ==========================================

/**
 * Fill in Stripe test card details
 * @param {string} cardNumber - Card number (defaults to 4242...)
 * @example cy.fillStripeCard()
 * @example cy.fillStripeCard('4000000000000002') // Declined card
 */
Cypress.Commands.add('fillStripeCard', (cardNumber = '4242424242424242') => {
  cy.get('iframe[name^="__privateStripeFrame"]', { timeout: 10000 }).then($iframe => {
    const $body = $iframe.contents().find('body');

    cy.wrap($body)
      .find('input[name="cardnumber"]')
      .type(cardNumber, { force: true });

    cy.wrap($body)
      .find('input[name="exp-date"]')
      .type('1225', { force: true });

    cy.wrap($body)
      .find('input[name="cvc"]')
      .type('123', { force: true });

    cy.wrap($body)
      .find('input[name="postal"]')
      .type('12345', { force: true });
  });
});

// ==========================================
// Assertion Commands
// ==========================================

/**
 * Assert that user is logged in
 * @example cy.assertLoggedIn()
 */
Cypress.Commands.add('assertLoggedIn', () => {
  cy.get('[data-testid="user-menu"]').should('exist');
});

/**
 * Assert that user is logged out
 * @example cy.assertLoggedOut()
 */
Cypress.Commands.add('assertLoggedOut', () => {
  cy.contains(/log in|sign in/i).should('be.visible');
});

/**
 * Assert success message is shown
 * @example cy.assertSuccess()
 */
Cypress.Commands.add('assertSuccess', () => {
  cy.contains(/success|confirmed|completed/i, { timeout: 5000 }).should('be.visible');
});

/**
 * Assert error message is shown
 * @example cy.assertError()
 */
Cypress.Commands.add('assertError', () => {
  cy.contains(/error|failed|invalid/i, { timeout: 5000 }).should('be.visible');
});

// ==========================================
// Utility Commands
// ==========================================

/**
 * Wait for page to be fully loaded
 * @example cy.waitForPageLoad()
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"], .spinner, .loading').should('not.exist');
});

/**
 * Generate unique test email
 * @returns {string} Unique email address
 * @example cy.generateTestEmail().then(email => { ... })
 */
Cypress.Commands.add('generateTestEmail', () => {
  const timestamp = Date.now();
  return `test${timestamp}@example.com`;
});
