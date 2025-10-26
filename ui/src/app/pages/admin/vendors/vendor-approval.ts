import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { User } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-vendor-approval',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vendor-approval.html',
  styleUrls: ['./vendor-approval.scss']
})
export class VendorApproval implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

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
        const errorMsg = 'Failed to load pending vendors';
        this.errorMessage.set(errorMsg);
        this.toastService.error(errorMsg);
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
        this.toastService.success('Vendor approved successfully!');
        // Remove from list
        this.pendingVendors.update(vendors => 
          vendors.filter(v => v.id !== userId)
        );
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to approve vendor';
        this.toastService.error(errorMsg);
      }
    });
  }

  rejectVendor(userId: number) {
    if (!confirm('Are you sure you want to reject this vendor application?')) {
      return;
    }

    this.adminService.rejectVendor(userId).subscribe({
      next: () => {
        this.toastService.success('Vendor application rejected');
        // Remove from list
        this.pendingVendors.update(vendors => 
          vendors.filter(v => v.id !== userId)
        );
      },
      error: (error) => {
        const errorMsg = error.error?.error || 'Failed to reject vendor';
        this.toastService.error(errorMsg);
      }
    });
  }
}
