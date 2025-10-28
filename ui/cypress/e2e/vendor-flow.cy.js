/**
 * Epic 9: Vendor Flow E2E Tests
 *
 * Tests all vendor-specific functionality:
 * - Login and access control
 * - Dashboard access
 * - Experience CRUD operations
 * - Availability management
 * - Confirmation mode changes
 * - Profile settings
 *
 * Prerequisites:
 * - API running with seeded test data
 * - Vendor account: davy@niexperiences.co.uk / vendor123
 *
 * Run: npm run cypress:open
 */

describe('Vendor Flow - E2E Tests', () => {

  beforeEach(() => {
    // Clear session before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('VENDOR-001: Vendor Login', () => {
    it('should allow vendor to login successfully', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();

      // Should redirect to dashboard
      cy.url({ timeout: 5000 }).should('include', '/dashboard');

      // User menu should show vendor name
      cy.contains(/davy|mcwilliams/i).should('be.visible');
    });

    it('should reject invalid credentials', () => {
      cy.visit('/login');

      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();

      // Should show error
      cy.contains(/invalid|incorrect|failed/i, { timeout: 5000 }).should('be.visible');
      cy.url().should('include', '/login');
    });
  });

  describe('VENDOR-002: Dashboard Access Control', () => {
    beforeEach(() => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should allow access to vendor dashboard', () => {
      cy.visit('/dashboard');

      // Should load successfully
      cy.contains(/dashboard|my listings/i, { timeout: 5000 }).should('be.visible');

      // Should show vendor-specific UI
      cy.get('[data-testid="vendor-dashboard"]').should('exist');
    });

    it('should block access to admin routes', () => {
      // Attempt to visit admin page
      cy.visit('/admin', { failOnStatusCode: false });

      // Should be redirected or show error
      cy.url({ timeout: 5000 }).should('not.include', '/admin');

      // Alternatively, might show access denied message
      // cy.contains(/access denied|unauthorized/i).should('be.visible');
    });

    it('should block access to admin vendors page', () => {
      cy.visit('/admin/vendors', { failOnStatusCode: false });

      // Should not be on admin route
      cy.url({ timeout: 5000 }).should('not.include', '/admin/vendors');
    });
  });

  describe('VENDOR-003: Experience CRUD Operations', () => {
    beforeEach(() => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should create a new experience', () => {
      cy.visit('/dashboard');

      // Click create new experience
      cy.get('button, a').contains(/create|new experience|add listing/i).click();

      // Fill in experience details
      cy.get('input[name="title"]').type('Cypress Test Experience');
      cy.get('textarea[name="description"]').type('This is a test experience created by Cypress E2E tests.');
      cy.get('input[name="location"]').type('Belfast');
      cy.get('input[name="price"]').type('50');
      cy.get('input[name="duration"]').type('120'); // 2 hours in minutes
      cy.get('input[name="maxGroupSize"]').type('10');

      // Select category (if available)
      cy.get('select[name="categories"]').first().select(1);

      // Submit form
      cy.get('button[type="submit"]').contains(/create|save|submit/i).click();

      // Verify success
      cy.contains(/created|success|pending/i, { timeout: 5000 }).should('be.visible');
    });

    it('should read/view an existing experience', () => {
      cy.visit('/dashboard');

      // Click on first experience in list
      cy.get('[data-testid="experience-item"], .experience-card').first().click();

      // Should show experience details
      cy.url().should('include', '/dashboard/experience/');
      cy.get('h1, h2').should('be.visible');
    });

    it('should update an existing experience', () => {
      cy.visit('/dashboard');

      // Find and click edit on first experience
      cy.get('[data-testid="experience-item"]').first().within(() => {
        cy.get('button, a').contains(/edit/i).click();
      });

      // Modify title
      cy.get('input[name="title"]').clear().type('Updated Test Experience Title');

      // Save changes
      cy.get('button[type="submit"]').contains(/save|update/i).click();

      // Verify success
      cy.contains(/updated|saved|success/i, { timeout: 5000 }).should('be.visible');
    });

    it('should delete an experience', () => {
      cy.visit('/dashboard');

      // Count experiences before deletion
      cy.get('[data-testid="experience-item"]').then($items => {
        const countBefore = $items.length;

        // Click delete on last experience
        cy.get('[data-testid="experience-item"]').last().within(() => {
          cy.get('button').contains(/delete|remove/i).click();
        });

        // Confirm deletion
        cy.get('button').contains(/confirm|yes|delete/i).click();

        // Verify success message
        cy.contains(/deleted|removed|success/i, { timeout: 5000 }).should('be.visible');

        // Verify count decreased (if there were items)
        if (countBefore > 0) {
          cy.get('[data-testid="experience-item"]').should('have.length', countBefore - 1);
        }
      });
    });
  });

  describe('VENDOR-004: Availability Management', () => {
    beforeEach(() => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should navigate to availability management page', () => {
      cy.visit('/dashboard');

      // Click on first experience
      cy.get('[data-testid="experience-item"]').first().click();

      // Navigate to availability
      cy.get('button, a').contains(/availability|calendar|schedule/i).click();

      // Should show availability UI
      cy.url().should('include', '/availability');
    });

    it('should add a new availability slot', () => {
      cy.visit('/dashboard');

      // Navigate to first experience availability
      cy.get('[data-testid="experience-item"]').first().within(() => {
        cy.get('[data-testid="experience-id"]').invoke('text').as('experienceId');
      });

      cy.get('@experienceId').then(id => {
        cy.visit(`/dashboard/experience/${id}/availability`);
      });

      // Click add new slot
      cy.get('button').contains(/add|new slot|create/i).click();

      // Fill in slot details
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
      const dateString = futureDate.toISOString().split('T')[0];

      cy.get('input[name="date"]').type(dateString);
      cy.get('input[name="time"]').type('14:00');
      cy.get('input[name="availableSlots"]').type('10');

      // Save slot
      cy.get('button[type="submit"]').contains(/save|create/i).click();

      // Verify success
      cy.contains(/added|created|success/i, { timeout: 5000 }).should('be.visible');
    });

    it('should edit an availability slot', () => {
      cy.visit('/dashboard');

      // Navigate to availability page
      cy.get('[data-testid="experience-item"]').first().within(() => {
        cy.get('[data-testid="experience-id"]').invoke('text').as('experienceId');
      });

      cy.get('@experienceId').then(id => {
        cy.visit(`/dashboard/experience/${id}/availability`);
      });

      // Click edit on first slot
      cy.get('[data-testid="availability-slot"]').first().within(() => {
        cy.get('button').contains(/edit/i).click();
      });

      // Modify available slots
      cy.get('input[name="availableSlots"]').clear().type('15');

      // Save changes
      cy.get('button').contains(/save|update/i).click();

      // Verify success
      cy.contains(/updated|saved|success/i, { timeout: 5000 }).should('be.visible');
    });

    it('should delete an availability slot', () => {
      cy.visit('/dashboard');

      // Navigate to availability page
      cy.get('[data-testid="experience-item"]').first().within(() => {
        cy.get('[data-testid="experience-id"]').invoke('text').as('experienceId');
      });

      cy.get('@experienceId').then(id => {
        cy.visit(`/dashboard/experience/${id}/availability`);
      });

      // Click delete on last slot
      cy.get('[data-testid="availability-slot"]').last().within(() => {
        cy.get('button').contains(/delete|remove/i).click();
      });

      // Confirm deletion
      cy.get('button').contains(/confirm|yes|delete/i).click();

      // Verify success
      cy.contains(/deleted|removed|success/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('VENDOR-005: Confirmation Mode Toggle', () => {
    beforeEach(() => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should change experience from auto to manual confirmation', () => {
      cy.visit('/dashboard');

      // Find an auto-confirm experience and edit it
      cy.get('[data-testid="experience-item"]').first().within(() => {
        cy.get('button, a').contains(/edit/i).click();
      });

      // Change confirmation mode
      cy.get('select[name="confirmationMode"]').select('manual');

      // Save changes
      cy.get('button[type="submit"]').contains(/save|update/i).click();

      // Verify success
      cy.contains(/updated|saved|success/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('VENDOR-006: Profile Settings', () => {
    beforeEach(() => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@niexperiences.co.uk');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should navigate to profile settings', () => {
      // Click on user menu
      cy.get('[data-testid="user-menu"]').click();

      // Click profile settings
      cy.contains(/profile|settings/i).click();

      // Should be on profile page
      cy.url().should('include', '/dashboard/profile');
    });

    it('should update vendor phone number and notification preference', () => {
      cy.visit('/dashboard/profile');

      // Update phone number
      cy.get('input[name="phoneNumber"]').clear().type('+447700900123');

      // Update notification preference
      cy.get('select[name="notificationPreference"]').select('sms');

      // Save changes
      cy.get('button[type="submit"]').contains(/save/i).click();

      // Verify success
      cy.contains(/saved|updated|success/i, { timeout: 5000 }).should('be.visible');

      // Refresh and verify persistence
      cy.reload();
      cy.get('input[name="phoneNumber"]').should('have.value', '+447700900123');
      cy.get('select[name="notificationPreference"]').should('have.value', 'sms');
    });

    it('should validate phone number format', () => {
      cy.visit('/dashboard/profile');

      // Enter invalid phone number
      cy.get('input[name="phoneNumber"]').clear().type('123456');

      // Try to save
      cy.get('button[type="submit"]').contains(/save/i).click();

      // Should show validation error
      cy.contains(/invalid|format|E\.164/i, { timeout: 5000 }).should('be.visible');
    });
  });
});
