import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ApplyVendor } from './pages/apply-vendor/apply-vendor';
import { VendorApproval } from './pages/admin/vendors/vendor-approval';
import { ExperienceApproval } from './pages/admin/experiences/experience-approval';
import { MyListings } from './pages/dashboard/my-listings/my-listings';
import { ExperienceForm } from './pages/dashboard/experience-form/experience-form';
import { authGuard, adminGuard, vendorGuard } from './guards/role.guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'apply-vendor', component: ApplyVendor, canActivate: [authGuard] },
  
  // Admin routes
  { path: 'admin/vendors', component: VendorApproval, canActivate: [adminGuard] },
  { path: 'admin/experiences', component: ExperienceApproval, canActivate: [adminGuard] },
  
  // Vendor dashboard routes
  { path: 'dashboard/my-listings', component: MyListings, canActivate: [vendorGuard] },
  { path: 'dashboard/experience/new', component: ExperienceForm, canActivate: [vendorGuard] },
  { path: 'dashboard/experience/edit/:id', component: ExperienceForm, canActivate: [vendorGuard] },
];
