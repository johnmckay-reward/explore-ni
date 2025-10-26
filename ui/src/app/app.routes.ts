import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ApplyVendor } from './pages/apply-vendor/apply-vendor';
import { VendorApproval } from './pages/admin/vendors/vendor-approval';
import { ExperienceApproval } from './pages/admin/experiences/experience-approval';
import { MyListings } from './pages/dashboard/my-listings/my-listings';
import { ExperienceForm } from './pages/dashboard/experience-form/experience-form';
import { AvailabilityManager } from './pages/dashboard/availability-manager/availability-manager';
import { VendorProfile } from './pages/dashboard/vendor-profile/vendor-profile';
import { BookingRequests } from './pages/dashboard/booking-requests/booking-requests';
import { ExperienceList } from './pages/experience-list/experience-list';
import { ExperienceDetail } from './pages/experience-detail/experience-detail';
import { Checkout } from './pages/checkout/checkout';
import { Payment } from './pages/payment/payment';
import { PaymentSuccess } from './pages/payment-success/payment-success';
import { authGuard, adminGuard, vendorGuard } from './guards/role.guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'apply-vendor', component: ApplyVendor, canActivate: [authGuard] },
  
  // Public marketplace routes
  { path: 'experiences', component: ExperienceList },
  { path: 'category/:slug', component: ExperienceList },
  { path: 'experience/:id', component: ExperienceDetail },
  
  // Booking and payment routes
  { path: 'checkout/:id', component: Checkout },
  { path: 'payment/:bookingId', component: Payment },
  { path: 'payment-success/:bookingId', component: PaymentSuccess },
  
  // Admin routes
  { path: 'admin/vendors', component: VendorApproval, canActivate: [adminGuard] },
  { path: 'admin/experiences', component: ExperienceApproval, canActivate: [adminGuard] },
  
  // Vendor dashboard routes
  { path: 'dashboard/my-listings', component: MyListings, canActivate: [vendorGuard] },
  { path: 'dashboard/experience/new', component: ExperienceForm, canActivate: [vendorGuard] },
  { path: 'dashboard/experience/edit/:id', component: ExperienceForm, canActivate: [vendorGuard] },
  { path: 'dashboard/experience/:id/availability', component: AvailabilityManager, canActivate: [vendorGuard] },
  { path: 'dashboard/profile', component: VendorProfile, canActivate: [vendorGuard] },
  { path: 'dashboard/requests', component: BookingRequests, canActivate: [vendorGuard] },
];
