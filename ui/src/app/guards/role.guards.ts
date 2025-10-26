import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard - Protects routes that require authentication
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login if not authenticated
  router.navigate(['/login']);
  return false;
};

/**
 * AdminGuard - Protects routes that require admin role
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.currentUser();
  if (user && user.role === 'admin') {
    return true;
  }

  // Redirect to home if not admin
  router.navigate(['/']);
  return false;
};

/**
 * VendorGuard - Protects routes that require vendor role
 */
export const vendorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.currentUser();
  if (user && user.role === 'vendor') {
    return true;
  }

  // Redirect to home if not vendor
  router.navigate(['/']);
  return false;
};
