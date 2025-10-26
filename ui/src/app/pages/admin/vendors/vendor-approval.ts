import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../services/auth.service';

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-approval.html',
  styleUrls: ['./vendor-approval.scss']
})
export class VendorApproval implements OnInit {
  private adminService = inject(AdminService);

  pendingVendors = signal<User[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  ngOnInit() {
    this.loadPendingVendors();
  }

  loadPendingVendors() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.adminService.getUsers('pending_vendor').subscribe({
      next: (users) => {
        this.pendingVendors.set(users);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.errorMessage.set('Failed to load pending vendors');
        this.isLoading.set(false);
      }
    });
  }

  approveVendor(userId: number) {
    if (!confirm('Are you sure you want to approve this vendor?')) {
      return;
    }

    this.adminService.approveVendor(userId).subscribe({
      next: () => {
        // Remove from list
        this.pendingVendors.update(vendors => 
          vendors.filter(v => v.id !== userId)
        );
      },
      error: (error) => {
        alert('Failed to approve vendor: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }

  rejectVendor(userId: number) {
    if (!confirm('Are you sure you want to reject this vendor application?')) {
      return;
    }

    this.adminService.rejectVendor(userId).subscribe({
      next: () => {
        // Remove from list
        this.pendingVendors.update(vendors => 
          vendors.filter(v => v.id !== userId)
        );
      },
      error: (error) => {
        alert('Failed to reject vendor: ' + (error.error?.error || 'Unknown error'));
      }
    });
  }
}
