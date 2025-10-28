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
import { ExperienceDetail } from './pages/experience-detail/experience-detail';
import { Checkout } from './pages/checkout/checkout';
import { Payment } from './pages/payment/payment';
import { PaymentSuccess } from './pages/payment-success/payment-success';
import { GiftVouchers } from './pages/gift-vouchers/gift-vouchers';
import { GiftExperience } from './pages/gift-experience/gift-experience';
import { HotelLanding } from './pages/hotel-landing/hotel-landing';
import { Destinations } from './pages/destinations/destinations';
import { HotDeals } from './pages/hot-deals/hot-deals';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Events } from './pages/events/events';
import { Faq } from './pages/faq/faq';
import { Privacy } from './pages/privacy/privacy';
import { Terms } from './pages/terms/terms';
import { AccountBookings } from './pages/account/bookings/account-bookings';
import { AccountProfile } from './pages/account/profile/account-profile';
import { authGuard, adminGuard, vendorGuard } from './guards/role.guards';
import { Experiences } from './pages/experiences/experiences';

export const routes: Routes = [
  // Core public routes
  { path: '', component: Home, title: 'Discover Local Experiences | NI Experiences' },
  { path: 'login', component: Login, title: 'Login | NI Experiences' },
  { path: 'register', component: Register, title: 'Create an Account | NI Experiences' },
  { path: 'apply-vendor', component: ApplyVendor, canActivate: [authGuard], title: 'Apply to be a Vendor | NI Experiences' },

  // Public informational routes
  { path: 'destinations', component: Destinations, title: 'Destinations | NI Experiences' },
  { path: 'experiences', component: Experiences, title: 'Experiences | NI Experiences' },
  { path: 'hot-deals', component: HotDeals, title: 'Hot Deals | NI Experiences' },
  { path: 'about', component: About, title: 'About Us | NI Experiences' },
  { path: 'contact', component: Contact, title: 'Contact Us | NI Experiences' },
  { path: 'events', component: Events, title: 'Events | NI Experiences' },
  { path: 'faq', component: Faq, title: 'FAQ | NI Experiences' },
  { path: 'privacy', component: Privacy, title: 'Privacy Policy | NI Experiences' },
  { path: 'terms', component: Terms, title: 'Terms of Use | NI Experiences' },

  // Public marketplace routeste: Dynamic title needs a TitleStrategy
  { path: 'experience/:id', component: ExperienceDetail, title: 'Experience Details | NI Experiences' }, // Note: Dynamic title needs a TitleStrategy

  // Hotel partner landing page
  { path: 'partner/:slug', component: HotelLanding, title: 'Partner Offers | NI Experiences' },

  // Booking and payment routes
  { path: 'checkout/:id', component: Checkout, title: 'Checkout | NI Experiences' },
  { path: 'payment/:bookingId', component: Payment, title: 'Secure Payment | NI Experiences' },
  { path: 'payment-success/:bookingId', component: PaymentSuccess, title: 'Booking Confirmed | NI Experiences' },

  // Gift voucher routes
  { path: 'gift-vouchers', component: GiftVouchers, title: 'Gift Vouchers | NI Experiences' },
  { path: 'gift-experience/:id', component: GiftExperience, title: 'Gift an Experience | NI Experiences' },

  // Account routes (for authenticated users)
  { path: 'account/bookings', component: AccountBookings, canActivate: [authGuard], title: 'My Bookings | NI Experiences' },
  { path: 'account/profile', component: AccountProfile, canActivate: [authGuard], title: 'My Profile | NI Experiences' },

  // Admin routes
  { path: 'admin/vendors', component: VendorApproval, canActivate: [adminGuard], title: 'Admin: Vendor Approvals | NI Experiences' },
  { path: 'admin/experiences', component: ExperienceApproval, canActivate: [adminGuard], title: 'Admin: Experience Approvals | NI Experiences' },
  { path: 'admin/vouchers', component: AdminVouchers, canActivate: [adminGuard], title: 'Admin: Manage Vouchers | NI Experiences' },
  { path: 'admin/settings', component: AdminSettings, canActivate: [adminGuard], title: 'Admin: Settings | NI Experiences' },

  // Vendor dashboard routes
  { path: 'dashboard/my-listings', component: MyListings, canActivate: [vendorGuard], title: 'Dashboard: My Listings | NI Experiences' },
  { path: 'dashboard/experience/new', component: ExperienceForm, canActivate: [vendorGuard], title: 'Dashboard: New Experience | NI Experiences' },
  { path: 'dashboard/experience/edit/:id', component: ExperienceForm, canActivate: [vendorGuard], title: 'Dashboard: Edit Experience | NI Experiences' },
  { path: 'dashboard/experience/:id/availability', component: AvailabilityManager, canActivate: [vendorGuard], title: 'Dashboard: Manage Availability | NI Experiences' },
  { path: 'dashboard/profile', component: VendorProfile, canActivate: [vendorGuard], title: 'Dashboard: Vendor Profile | NI Experiences' },
  { path: 'dashboard/requests', component: BookingRequests, canActivate: [vendorGuard], title: 'Dashboard: Booking Requests | NI Experiences' },
];
