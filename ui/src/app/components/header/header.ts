import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapse, NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, NgbCollapse, NgbDropdown, NgbDropdownMenu, NgbDropdownToggle],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  isMenuCollapsed = true;
  
  // Inject auth service
  private authService = inject(AuthService);
  
  // Get current user from auth service
  currentUser = this.authService.currentUser;
  
  // Computed property for user's full name
  userFullName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  logout() {
    this.authService.logout();
  }
}
