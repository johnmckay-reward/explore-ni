import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { VoucherService, Voucher } from '../../../services/voucher.service';

@Component({
  selector: 'app-admin-vouchers',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-vouchers.html',
  styleUrls: ['./admin-vouchers.scss'],
})
export class AdminVouchers implements OnInit {
  vouchers = signal<Voucher[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  page = signal(1);
  totalPages = signal(1);
  total = signal(0);

  createForm!: FormGroup;
  editForm!: FormGroup;
  selectedVoucher = signal<Voucher | null>(null);

  constructor(
    private voucherService: VoucherService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadVouchers();
    this.initializeForms();
  }

  initializeForms() {
    this.createForm = this.fb.group({
      type: ['fixed_amount', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      senderName: [''],
      recipientName: [''],
      recipientEmail: ['', Validators.email],
      message: [''],
      experienceId: [''],
      expiryDate: [''],
    });

    this.editForm = this.fb.group({
      currentBalance: [''],
      expiryDate: [''],
      isEnabled: [true],
    });
  }

  loadVouchers() {
    this.loading.set(true);
    this.error.set(null);

    this.voucherService.getVouchers(this.page(), 10).subscribe({
      next: (response) => {
        this.vouchers.set(response.vouchers);
        this.page.set(response.page);
        this.totalPages.set(response.totalPages);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading vouchers:', err);
        this.error.set('Failed to load vouchers');
        this.loading.set(false);
      },
    });
  }

  openCreateModal(content: any) {
    this.createForm.reset({
      type: 'fixed_amount',
      isEnabled: true,
    });
    this.modalService.open(content, { size: 'lg' });
  }

  openEditModal(content: any, voucher: Voucher) {
    this.selectedVoucher.set(voucher);
    this.editForm.patchValue({
      currentBalance: voucher.currentBalance,
      expiryDate: voucher.expiryDate
        ? new Date(voucher.expiryDate).toISOString().split('T')[0]
        : '',
      isEnabled: voucher.isEnabled,
    });
    this.modalService.open(content);
  }

  createVoucher() {
    if (this.createForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.voucherService.createVoucher(this.createForm.value).subscribe({
      next: () => {
        this.loadVouchers();
        this.modalService.dismissAll();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error creating voucher:', err);
        this.error.set('Failed to create voucher');
        this.loading.set(false);
      },
    });
  }

  updateVoucher() {
    const voucher = this.selectedVoucher();
    if (!voucher || this.editForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.voucherService.updateVoucher(voucher.id, this.editForm.value).subscribe({
      next: () => {
        this.loadVouchers();
        this.modalService.dismissAll();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error updating voucher:', err);
        this.error.set('Failed to update voucher');
        this.loading.set(false);
      },
    });
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadVouchers();
    }
  }

  previousPage() {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadVouchers();
    }
  }

  getStatusBadgeClass(voucher: Voucher): string {
    if (!voucher.isEnabled) {
      return 'badge bg-secondary';
    }
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return 'badge bg-danger';
    }
    if (voucher.currentBalance > 0 || voucher.type === 'experience') {
      return 'badge bg-success';
    }
    return 'badge bg-warning';
  }

  getStatusText(voucher: Voucher): string {
    if (!voucher.isEnabled) {
      return 'Disabled';
    }
    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return 'Expired';
    }
    if (voucher.type === 'experience') {
      return 'Active';
    }
    if (voucher.currentBalance > 0) {
      return 'Active';
    }
    return 'Used';
  }
}
