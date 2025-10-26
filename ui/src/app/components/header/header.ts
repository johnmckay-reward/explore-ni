import { Component, computed, inject, TemplateRef } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  NgbCollapse,
  NgbDropdown,
  NgbDropdownMenu,
  NgbDropdownToggle,
  NgbDropdownItem,
  NgbOffcanvas // 1. Import NgbOffcanvas
} from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgbCollapse,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbDropdownItem,
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  // 6. Inject NgbOffcanvas and remove isMenuCollapsed
  private authService = inject(AuthService);
  private offcanvasService = inject(NgbOffcanvas);

  currentUser = this.authService.currentUser;

  userFirstName = computed(() => {
    const user = this.currentUser();
    return user ? user.firstName : '';
  });

  logout() {
    this.authService.logout();
  }

  // 7. Method to open the offcanvas
  openOffcanvas(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'start', // This makes it slide from the left
      panelClass: 'offcanvas-custom' // Apply custom class
    });
  }
}

