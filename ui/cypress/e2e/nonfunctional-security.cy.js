/**
 * Epic 9: Non-Functional & Security Tests
 * 
 * Tests for:
 * - Responsive design across devices
 * - API error handling
 * - UI error handling
 * - Security and access control
 * 
 * Prerequisites:
 * - API running with seeded test data
 * - Test accounts available
 * 
 * Run: npm run cypress:open
 */

describe('Non-Functional & Security Tests', () => {
  
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('NONFUNC-001: Responsive Design', () => {
    const pages = [
      { name: 'Homepage', url: '/' },
      { name: 'Experiences', url: '/experiences' },
      { name: 'Login', url: '/login' },
    ];

    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
    ];

    viewports.forEach(viewport => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
        });

        pages.forEach(page => {
          it(`should display ${page.name} correctly`, () => {
            cy.visit(page.url);
            
            // Page should load
            cy.get('body').should('be.visible');
            
            // No horizontal scroll
            cy.window().then(win => {
              expect(win.document.documentElement.scrollWidth).to.be.at.most(viewport.width);
            });
            
            // Navigation should be visible or accessible
            cy.get('nav, [data-testid="mobile-menu"]').should('exist');
          });
        });

        it('should have touch-friendly elements on mobile', function() {
          if (viewport.name === 'Mobile') {
            cy.visit('/');
            
            // Buttons should be large enough for touch
            cy.get('button, a').each($el => {
              const height = $el.height();
              expect(height).to.be.at.least(40); // Minimum touch target size
            });
          }
        });
      });
    });

    it('should adapt layout from mobile to desktop', () => {
      // Start mobile
      cy.viewport('iphone-x');
      cy.visit('/experiences');
      
      // Check mobile layout (might have hamburger menu)
      cy.get('[data-testid="mobile-menu-button"]').should('exist');
      
      // Switch to desktop
      cy.viewport(1920, 1080);
      
      // Mobile menu should be hidden
      cy.get('[data-testid="mobile-menu-button"]').should('not.be.visible');
      
      // Full navigation should be visible
      cy.get('nav').should('be.visible');
    });
  });

  describe('NONFUNC-002: API Error Handling', () => {
    it('should handle overbooking gracefully', () => {
      // This test requires API access
      // We'll simulate by attempting to book more than available
      
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Try to book with excessive quantity
      cy.visit('/experiences');
      cy.get('.experience-card').first().click();
      cy.get('button').contains(/book now/i).click();
      cy.get('[data-testid="availability-slot"]').first().click();
      
      // Enter very high quantity
      cy.get('input[name="quantity"]').clear().type('9999');
      cy.get('button').contains(/proceed/i).click();
      
      // Should show error
      cy.contains(/insufficient|not available|exceeds/i, { timeout: 5000 }).should('be.visible');
    });

    it('should handle network errors gracefully', () => {
      // Intercept and fail a request
      cy.intercept('GET', '/api/experiences', { forceNetworkError: true }).as('getExperiences');
      
      cy.visit('/experiences');
      
      // Should show error message
      cy.contains(/error|failed|unable to load/i, { timeout: 10000 }).should('be.visible');
    });

    it('should handle 500 server errors', () => {
      // Simulate server error
      cy.intercept('GET', '/api/experiences', {
        statusCode: 500,
        body: { error: 'Internal Server Error' }
      }).as('serverError');
      
      cy.visit('/experiences');
      
      // Should show user-friendly error
      cy.contains(/error|something went wrong|try again/i, { timeout: 5000 }).should('be.visible');
    });

    it('should handle 404 not found errors', () => {
      cy.visit('/experience/99999', { failOnStatusCode: false });
      
      // Should show 404 page or error message
      cy.contains(/not found|404|doesn't exist/i, { timeout: 5000 }).should('be.visible');
    });
  });

  describe('NONFUNC-003: UI Error Handling', () => {
    it('should show error for incorrect login password', () => {
      cy.visit('/login');
      
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should show clear error message
      cy.contains(/invalid|incorrect|failed/i, { timeout: 5000 }).should('be.visible');
      
      // Should not crash or redirect
      cy.url().should('include', '/login');
    });

    it('should show error for duplicate email registration', () => {
      cy.visit('/register');
      
      // Try to register with existing email
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('admin@exploreni.com'); // Existing
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show error
      cy.contains(/already exists|email taken|duplicate/i, { timeout: 5000 }).should('be.visible');
    });

    it('should validate required form fields', () => {
      cy.visit('/login');
      
      // Try to submit empty form
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should show validation errors
      cy.contains(/required|must provide|enter/i, { timeout: 5000 }).should('be.visible');
      
      // Should not proceed
      cy.url().should('include', '/login');
    });

    it('should validate email format', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('invalid-email'); // Invalid format
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show validation error
      cy.contains(/invalid email|valid email/i, { timeout: 5000 }).should('be.visible');
    });

    it('should show user-friendly error messages (no stack traces)', () => {
      // Trigger an error
      cy.intercept('POST', '/api/auth/login', {
        statusCode: 500,
        body: { error: 'Database connection failed', stack: 'Error: at line 123...' }
      });
      
      cy.visit('/login');
      cy.get('input[name="email"]').type('admin@exploreni.com');
      cy.get('input[name="password"]').type('admin123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      
      // Should show user-friendly message
      cy.contains(/error|try again|unable/i, { timeout: 5000 }).should('be.visible');
      
      // Should NOT show stack trace
      cy.contains(/stack|Error: at line/i).should('not.exist');
    });
  });

  describe('SECURITY-001: Access Control & Authentication', () => {
    it('should block customer from accessing admin routes', () => {
      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Try to access admin page
      cy.visit('/admin', { failOnStatusCode: false });
      
      // Should be redirected or blocked
      cy.url({ timeout: 5000 }).should('not.include', '/admin');
      
      // Or should show access denied
      // cy.contains(/access denied|unauthorized|forbidden/i).should('be.visible');
    });

    it('should block customer from accessing vendor dashboard', () => {
      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Try to access vendor dashboard
      cy.visit('/dashboard', { failOnStatusCode: false });
      
      // Should be redirected or blocked
      cy.url({ timeout: 5000 }).should('not.include', '/dashboard');
    });

    it('should block vendor from accessing admin routes', () => {
      // Login as vendor
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@exploreni.com');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Try to access admin vendors page
      cy.visit('/admin/vendors', { failOnStatusCode: false });
      
      // Should be blocked
      cy.url({ timeout: 5000 }).should('not.include', '/admin/vendors');
    });

    it('should require authentication for protected routes', () => {
      // Try to access dashboard without login
      cy.visit('/dashboard', { failOnStatusCode: false });
      
      // Should redirect to login
      cy.url({ timeout: 5000 }).should('include', '/login');
    });

    it('should validate JWT token on API requests', () => {
      // Intercept API call with invalid token
      cy.intercept('GET', '/api/bookings/requests', (req) => {
        req.headers['Authorization'] = 'Bearer invalid-token';
      }).as('unauthorizedRequest');
      
      cy.visit('/login');
      cy.get('input[name="email"]').type('davy@exploreni.com');
      cy.get('input[name="password"]').type('vendor123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      cy.visit('/dashboard/requests');
      cy.wait('@unauthorizedRequest');
      
      // Should handle unauthorized error
      // Either redirect to login or show error
      cy.url({ timeout: 5000 }).should('match', /\/login|\/dashboard/);
    });

    it('should prevent CSRF attacks by requiring proper headers', () => {
      // Attempt API call without proper headers
      cy.request({
        method: 'PUT',
        url: 'http://localhost:3000/api/experiences/1',
        failOnStatusCode: false,
        body: { title: 'Hacked' }
      }).then(response => {
        // Should be unauthorized or forbidden
        expect(response.status).to.be.oneOf([401, 403]);
      });
    });

    it('should prevent unauthorized API access (403 Forbidden)', () => {
      // Login as customer
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Get token from localStorage
      cy.window().then(win => {
        const token = win.localStorage.getItem('token');
        
        // Try to access vendor endpoint
        cy.request({
          method: 'PUT',
          url: 'http://localhost:3000/api/experiences/1',
          failOnStatusCode: false,
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: { title: 'Unauthorized Edit' }
        }).then(response => {
          // Should return 403 Forbidden
          expect(response.status).to.equal(403);
        });
      });
    });

    it('should sanitize user inputs to prevent XSS', () => {
      cy.visit('/register');
      
      // Try to inject script
      cy.get('input[name="firstName"]').type('<script>alert("XSS")</script>');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('xsstest@example.com');
      cy.get('input[name="password"]').type('Test123!');
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Script should not execute
      cy.on('window:alert', () => {
        throw new Error('XSS vulnerability detected!');
      });
    });

    it('should enforce password complexity requirements', () => {
      cy.visit('/register');
      
      cy.get('input[name="firstName"]').type('Test');
      cy.get('input[name="lastName"]').type('User');
      cy.get('input[name="email"]').type('weakpass@example.com');
      cy.get('input[name="password"]').type('123'); // Weak password
      cy.get('button[type="submit"]').contains(/register|sign up/i).click();
      
      // Should show password strength error
      cy.contains(/weak|short|complex|strength/i, { timeout: 5000 }).should('be.visible');
    });

    it('should logout user and clear session', () => {
      // Login
      cy.visit('/login');
      cy.get('input[name="email"]').type('mary@exploreni.com');
      cy.get('input[name="password"]').type('customer123');
      cy.get('button[type="submit"]').contains(/log in|sign in/i).click();
      cy.wait(1000);
      
      // Verify logged in
      cy.get('[data-testid="user-menu"]').should('exist');
      
      // Logout
      cy.get('[data-testid="user-menu"]').click();
      cy.contains(/log out|sign out/i).click();
      cy.wait(500);
      
      // Verify session cleared
      cy.window().then(win => {
        expect(win.localStorage.getItem('token')).to.be.null;
      });
      
      // Try to access protected route
      cy.visit('/dashboard', { failOnStatusCode: false });
      
      // Should redirect to login
      cy.url({ timeout: 5000 }).should('include', '/login');
    });
  });

  describe('NONFUNC-004: Performance & Loading', () => {
    it('should load homepage within acceptable time', () => {
      const start = Date.now();
      
      cy.visit('/');
      
      cy.get('body').should('be.visible').then(() => {
        const loadTime = Date.now() - start;
        
        // Should load in under 3 seconds
        expect(loadTime).to.be.lessThan(3000);
      });
    });

    it('should show loading indicators during async operations', () => {
      // Slow down network to see loaders
      cy.intercept('GET', '/api/experiences', (req) => {
        req.reply((res) => {
          res.delay(2000); // 2 second delay
          res.send();
        });
      });
      
      cy.visit('/experiences');
      
      // Should show loading indicator
      cy.get('[data-testid="loading"], .spinner, .loading', { timeout: 1000 }).should('be.visible');
      
      // Loading should disappear when done
      cy.get('[data-testid="loading"], .spinner, .loading', { timeout: 5000 }).should('not.exist');
    });
  });
});
