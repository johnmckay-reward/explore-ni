import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ApplyVendor } from './pages/apply-vendor/apply-vendor';
import { VendorApproval } from './pages/admin/vendors/vendor-approval';
import { ExperienceApproval } from './pages/admin/experiences/experience-approval';
import { AdminVouchers } from './pages/admin/vouchers/admin-vouchers';
import { AdminSettings } from './pages/admin/settings/admin-settings';
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
import { GiftVouchers } from './pages/gift-vouchers/gift-vouchers';
import { GiftExperience } from './pages/gift-experience/gift-experience';
import { HotelLanding } from './pages/hotel-landing/hotel-landing';
import { authGuard, adminGuard, vendorGuard } from './guards/role.guards';

export const routes: Routes = [
  // Core public routes
  { path: '', component: Home, title: 'Discover Local Experiences | Experience NI' },
  { path: 'login', component: Login, title: 'Login | Experience NI' },
  { path: 'register', component: Register, title: 'Create an Account | Experience NI' },
  { path: 'apply-vendor', component: ApplyVendor, canActivate: [authGuard], title: 'Apply to be a Vendor | Experience NI' },

  // Public marketplace routes
  { path: 'experiences', component: ExperienceList, title: 'All Experiences | Experience NI' },
  { path: 'category/:slug', component: ExperienceList, title: 'Browse Category | Experience NI' }, // Note: Dynamic title needs a TitleStrategy
  { path: 'experience/:id', component: ExperienceDetail, title: 'Experience Details | Experience NI' }, // Note: Dynamic title needs a TitleStrategy

  // Hotel partner landing page
  { path: 'partner/:slug', component: HotelLanding, title: 'Partner Offers | Experience NI' },

  // Booking and payment routes
  { path: 'checkout/:id', component: Checkout, title: 'Checkout | Experience NI' },
  { path: 'payment/:bookingId', component: Payment, title: 'Secure Payment | Experience NI' },
  { path: 'payment-success/:bookingId', component: PaymentSuccess, title: 'Booking Confirmed | Experience NI' },

  // Gift voucher routes
  { path: 'gift-vouchers', component: GiftVouchers, title: 'Gift Vouchers | Experience NI' },
  { path: 'gift-experience/:id', component: GiftExperience, title: 'Gift an Experience | Experience NI' },

  // Admin routes
  { path: 'admin/vendors', component: VendorApproval, canActivate: [adminGuard], title: 'Admin: Vendor Approvals | Experience NI' },
  { path: 'admin/experiences', component: ExperienceApproval, canActivate: [adminGuard], title: 'Admin: Experience Approvals | Experience NI' },
  { path: 'admin/vouchers', component: AdminVouchers, canActivate: [adminGuard], title: 'Admin: Manage Vouchers | Experience NI' },
  { path: 'admin/settings', component: AdminSettings, canActivate: [adminGuard], title: 'Admin: Settings | Experience NI' },

  // Vendor dashboard routes
  { path: 'dashboard/my-listings', component: MyListings, canActivate: [vendorGuard], title: 'Dashboard: My Listings | Experience NI' },
  { path: 'dashboard/experience/new', component: ExperienceForm, canActivate: [vendorGuard], title: 'Dashboard: New Experience | Experience NI' },
  { path: 'dashboard/experience/edit/:id', component: ExperienceForm, canActivate: [vendorGuard], title: 'Dashboard: Edit Experience | Experience NI' },
  { path: 'dashboard/experience/:id/availability', component: AvailabilityManager, canActivate: [vendorGuard], title: 'Dashboard: Manage Availability | Experience NI' },
  { path: 'dashboard/profile', component: VendorProfile, canActivate: [vendorGuard], title: 'Dashboard: Vendor Profile | Experience NI' },
  { path: 'dashboard/requests', component: BookingRequests, canActivate: [vendorGuard], title: 'Dashboard: Booking Requests | Experience NI' },
];
