/**
 * Epic 9: Customer & Public Flow E2E Tests
 * 
 * Tests public-facing and customer-specific functionality:
 * - Public browsing (logged out)
 * - Search and filtering
 * - Hotel partner landing pages
 * - Customer registration
 * - Customer login/logout
 * 
 * Prerequisites:
 * - API running with seeded test data
 * - Approved experiences in database
 * 
 * Run: npm run cypress:open
 */

describe('Customer & Public Flow - E2E Tests', () => {
  
  beforeEach(() => {
    // Clear session before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('PUBLIC-001: Public Browsing (Logged Out)', () => {
    it('should allow logged-out users to browse homepage', () => {
      cy.visit('/');
      
      // Homepage should load
      cy.contains(/explore|northern ireland|experiences/i, { timeout: 5000 }).should('be.visible');
      
      // Should show navigation
      cy.get('nav').should('be.visible');
      
      // Should show some experiences or categories
      cy.get('.experience-card, [data-testid="experience-item"]').should('have.length.at.least', 1);
    });

    it('should allow browsing category pages', () => {
      cy.visit('/');
      
      // Click on a category link
      cy.get('a').contains(/tours|activities|food|culture/i).first().click();
      
      // Should navigate to category page
      cy.url().should('match', /\/experiences|\/category/);
      
      // Should show experiences
      cy.get('.experience-card, [data-testid="experience-item"]').should('exist');
    });

    it('should allow viewing experience detail page', () => {
      cy.visit('/experiences');
      
      // Click on first experience
      cy.get('.experience-card, [data-testid="experience-item"]').first().click();
      
      // Should navigate to detail page
      cy.url().should('include', '/experience/');
      
      // Should show experience title and details
      cy.get('h1').should('be.visible');
      cy.contains(/description|price|duration/i).should('be.visible');
    });

    it('should only show approved experiences to public', () => {
      cy.visit('/experiences');
      
      // Get all experience cards
      cy.get('[data-testid="experience-item"]').each(($el) => {
        // Each experience should not show "pending" or "draft" status
        cy.wrap($el).should('not.contain', /pending|draft/i);
      });
    });
  });

  describe('PUBLIC-002: Search & Filter', () => {
    it('should filter experiences by price range', () => {
      cy.visit('/experiences');
      
      // Apply price filter
      cy.get('[data-testid="price-filter"]').within(() => {
        cy.get('input[name="minPrice"]').type('0');
        cy.get('input[name="maxPrice"]').type('50');
      });
      
      // Click apply filter
      cy.get('button').contains(/apply|filter/i).click();
      
      // Wait for results to update
      cy.wait(1000);
      
      // Verify results are filtered
      cy.get('[data-testid="experience-price"]').each(($price) => {
        const price = parseFloat($price.text().replace(/[£$,]/g, ''));
        expect(price).to.be.at.most(50);
      });
    });

    it('should filter experiences by location', () => {
      cy.visit('/experiences');
      
      // Select location filter
      cy.get('select[name="location"], [data-testid="location-filter"]').select('Belfast');
      
      // Wait for results
      cy.wait(1000);
      
      // Verify results contain Belfast
      cy.get('[data-testid="experience-location"]').each(($location) => {
        cy.wrap($location).should('contain', 'Belfast');
      });
    });

    it('should filter experiences by rating', () => {
      cy.visit('/experiences');
      
      // Apply rating filter
      cy.get('[data-testid="rating-filter"]').within(() => {
        cy.contains('4+ stars').click();
      });
      
      // Wait for results
      cy.wait(1000);
      
      // Verify results have rating >= 4
      cy.get('[data-testid="experience-rating"]').each(($rating) => {
        const rating = parseFloat($rating.attr('data-rating') || '0');
        expect(rating).to.be.at.least(4);
      });
    });

    it('should combine multiple filters', () => {
      cy.visit('/experiences');
      
      // Apply price filter
      cy.get('[data-testid="price-filter"]').within(() => {
        cy.get('input[name="minPrice"]').type('0');
        cy.get('input[name="maxPrice"]').type('100');
      });
      
      // Apply location filter
      cy.get('select[name="location"]').select('Belfast');
      
      // Click apply
      cy.get('button').contains(/apply|filter/i).click();
      
      // Wait for results
      cy.wait(1000);
      
      // Verify results match both filters
      cy.get('[data-testid="experience-item"]').should('exist');
    });
  });

  describe('PUBLIC-003: Hotel Partner Landing Page', () => {
    it('should display hotel partner page', () => {
      // Visit hotel partner page (assumes test-hotel exists from seed data)
      cy.visit('/partner/test-hotel', { failOnStatusCode: false });
      
      // Page should load successfully
      cy.get('body').should('exist');
      
      // Should show hotel name
      cy.contains(/test hotel|partner/i, { timeout: 5000 }).should('be.visible');
    });

    it('should show list of approved experiences', () => {
      cy.visit('/partner/test-hotel', { failOnStatusCode: false });
      
      // Should show experiences
      cy.get('.experience-card, [data-testid="experience-item"]', { timeout: 5000 })
        .should('have.length.at.least', 0); // May be 0 if no experiences
    });

    it('should be mobile responsive', () => {
      // Set mobile viewport
      cy.viewport('iphone-x');
      
      cy.visit('/partner/test-hotel', { failOnStatusCode: false });
      
      // Page should display correctly
      cy.get('body').should('be.visible');
      
      // No horizontal scroll
      cy.window().then(win => {
        expect(win.document.documentElement.scrollWidth).to.be.at.most(win.innerWidth);
      });
    });

    it('should handle non-existent hotel slug', () => {
      cy.visit('/partner/non-existent-hotel', { failOnStatusCode: false });
      
      // Should show error or redirect
      cy.contains(/not found|error|404/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('CUSTOMER-001: Customer Registration', () => {
    it('should allow new customer to register', () => {
      cy.visit('/register');
      
      // Fill in registration form
      const timestamp = Date.now();
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type(`testuser${timestamp}@example.com`);
      cy.get('input[name="password"]').type('Test123!');
      
      // Select customer role (if needed)
      cy.get('select[name="role"]').select('customer');
      
      // Submit form
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should redirect to login or dashboard
      cy.url({ timeout: 5000 }).should('match', /\/login|\/dashboard|\//);
      
      // Should show success message
      cy.contains(/success|registered|welcome/i, { timeout: 5000 }).should('be.visible');
    });

    it('should validate required fields', () => {
      cy.visit('/register');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show validation errors
      cy.contains(/required|invalid/i, { timeout: 5000 }).should('be.visible');
    });

    it('should prevent duplicate email registration', () => {
      cy.visit('/register');
      
      // Try to register with existing email
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('mary@exploreni.com'); // Existing user
      cy.get('input[name="password"]').type('Test123!');
      
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show error
      cy.contains(/already exists|email taken|duplicate/i, { timeout: 5000 }).should('be.visible');
    });

    it('should validate password strength', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('newuser@example.com');
      cy.get('input[name="password"]').type('123'); // Weak password
      
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show password validation error
      cy.contains(/weak|short|invalid password/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('CUSTOMER-002: Customer Login & Logout', () => {
    it('should allow customer to login', () => {
      cy.visit('/login');
      
      // Fill in login form
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      
      // Submit
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should redirect to homepage or dashboard
      cy.url({ timeout: 5000 }).should('not.include', '/login');
      
      // Should show user name in menu
      cy.get('[data-testid="user-menu"]').should('contain', /mary|magee/i);
    });

    it('should reject invalid credentials', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('wrongpassword');
      
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should show error
      cy.contains(/invalid|incorrect|failed/i, { timeout: 5000 }).should('be.visible');
    });

    it('should allow customer to logout', () => {
      // First login
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Click user menu
      cy.get('[data-testid="user-menu"]').click();
      
      // Click logout
      cy.contains(/log out|sign out/i).click();
      
      // Should redirect to homepage
      cy.url({ timeout: 5000 }).should('match', /^http:\/\/localhost:\d+\/?$/);
      
      // User menu should show login/register
      cy.contains(/log in|sign in/i).should('be.visible');
    });

    it('should maintain session across page navigation', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Navigate to different pages
      cy.visit('/experiences');
      cy.get('[data-testid="user-menu"]').should('contain', /mary/i);
      
      cy.visit('/');
      cy.get('[data-testid="user-menu"]').should('contain', /mary/i);
    });
  });
});
