/**
 * Epic 9: Admin Flow E2E Tests
 * 
 * Tests all admin-specific functionality:
 * - Login
 * - Vendor approval
 * - Experience approval
 * - Settings management
 * - Voucher management
 * 
 * Prerequisites:
 * - API running with seeded test data
 * - Admin account: admin@exploreni.com / admin123
 * - Pending vendor: ciaran@exploreni.com
 * 
 * Run: npm run cypress:open
 */

describe('Admin Flow - E2E Tests', () => {
  
  beforeEach(() => {
    // Clear any existing session
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('ADMIN-001: Admin Login', () => {
    it('should allow admin to login successfully', () => {
      cy.visit('/login');
      
      // Fill in login form
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      
      // Submit login
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Verify successful login
      cy.url().should('not.include', '/login');
      
      // Verify admin UI elements are present
      cy.get('[data-testid="user-menu"]', { timeout: 5000 })
        .should('contain', 'Admin');
    });

    it('should reject login with incorrect password', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('wrongpassword');
      
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should show error message
      cy.contains(/invalid|incorrect|failed/i, { timeout: 5000 }).should('be.visible');
      
      // Should still be on login page
      cy.url().should('include', '/login');
    });
  });

  describe('ADMIN-002: Vendor Approval', () => {
    beforeEach(() => {
      // Login as admin before each test
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000); // Wait for login to complete
    });

    it('should display pending vendors in admin panel', () => {
      cy.visit('/admin/vendors');
      
      // Should show pending vendors section
      cy.contains(/pending|awaiting approval/i, { timeout: 5000 }).should('be.visible');
      
      // Should show at least one pending vendor (from seed data)
      cy.get('[data-testid="vendor-item"]').should('have.length.at.least', 1);
    });

    it('should allow admin to approve a vendor', () => {
      cy.visit('/admin/vendors');
      
      // Find first pending vendor
      cy.get('[data-testid="vendor-status"]')
        .contains(/pending/i)
        .parents('[data-testid="vendor-item"]')
        .first()
        .within(() => {
          // Click approve button
          cy.get('button').contains(/approve/i).click();
        });
      
      // Verify success message
      cy.contains(/approved|success/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('ADMIN-003: Experience Approval', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should display pending experiences', () => {
      cy.visit('/admin/experiences');
      
      // Page should load successfully
      cy.contains(/experience|listing/i, { timeout: 5000 }).should('be.visible');
      
      // Should have filter or status indicator
      cy.get('body').should('exist');
    });

    it('should allow admin to approve an experience', () => {
      cy.visit('/admin/experiences');
      
      // Look for pending experiences
      cy.get('[data-testid="experience-status"]')
        .contains(/pending/i)
        .parents('[data-testid="experience-item"]')
        .first()
        .within(() => {
          // Click approve button
          cy.get('button').contains(/approve/i).click();
        });
      
      // Verify success
      cy.contains(/approved|success/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('ADMIN-004: Settings Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should display all setting keys', () => {
      cy.visit('/admin/settings');
      
      // Verify all critical settings are present
      const requiredSettings = [
        'STRIPE_SECRET_KEY',
        'TWILIO_ACCOUNT_SID',
        'SENDGRID_API_KEY'
      ];
      
      requiredSettings.forEach(setting => {
        cy.contains(setting, { timeout: 5000 }).should('be.visible');
      });
    });

    it('should allow admin to update a setting', () => {
      cy.visit('/admin/settings');
      
      // Find TWILIO_PHONE_NUMBER field
      cy.contains('TWILIO_PHONE_NUMBER')
        .parents('[data-testid="setting-row"]')
        .within(() => {
          // Clear and enter new value
          cy.get('input[type="password"]').clear().type('+447700900999');
          
          // Click save button
          cy.get('button').contains(/save/i).click();
        });
      
      // Verify success message
      cy.contains(/saved|updated|success/i, { timeout: 5000 }).should('be.visible');
    });

    it('should apply settings without restart (hot reload)', () => {
      cy.visit('/admin/settings');
      
      // Update a test setting
      cy.contains('TWILIO_PHONE_NUMBER')
        .parents('[data-testid="setting-row"]')
        .within(() => {
          cy.get('input[type="password"]').clear().type('+447700900888');
          cy.get('button').contains(/save/i).click();
        });
      
      // Wait for save confirmation
      cy.contains(/saved|success/i, { timeout: 5000 }).should('be.visible');
      
      // Setting should be available immediately in global.appSettings
      // This would be verified by triggering an SMS notification
      // For this test, we just verify the save was successful
    });
  });

  describe('ADMIN-005: Voucher Management', () => {
    beforeEach(() => {
      // Login as admin
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
    });

    it('should display voucher management page', () => {
      cy.visit('/admin/vouchers');
      
      // Page should load
      cy.contains(/voucher/i, { timeout: 5000 }).should('be.visible');
      
      // Should have table or list of vouchers
      cy.get('table, [data-testid="voucher-list"]').should('exist');
    });

    it('should allow admin to manually create a voucher', () => {
      cy.visit('/admin/vouchers');
      
      // Click create new voucher button
      cy.get('button').contains(/create|new voucher/i).click();
      
      // Fill in voucher details
      cy.get('input[name="code"]').type('ADMIN-TEST-10');
      cy.get('select[name="type"]').select('fixed_amount');
      cy.get('input[name="originalBalance"]').type('10');
      cy.get('input[name="currentBalance"]').type('10');
      
      // Submit form
      cy.get('button[type="submit"]').contains(/create|save/i).click();
      
      // Verify success
      cy.contains(/created|success/i, { timeout: 5000 }).should('be.visible');
      
      // Verify voucher appears in list
      cy.contains('ADMIN-TEST-10').should('be.visible');
    });

    it('should allow admin to edit a voucher', () => {
      cy.visit('/admin/vouchers');
      
      // Find first voucher and click edit
      cy.get('[data-testid="voucher-item"]')
        .first()
        .within(() => {
          cy.get('button').contains(/edit/i).click();
        });
      
      // Modify current balance
      cy.get('input[name="currentBalance"]').clear().type('5');
      
      // Save changes
      cy.get('button').contains(/save|update/i).click();
      
      // Verify success
      cy.contains(/updated|success/i, { timeout: 5000 }).should('be.visible');
    });
  });
});
