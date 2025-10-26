import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VoucherPurchaseFixedRequest {
  amount: number;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
}

export interface VoucherPurchaseExperienceRequest {
  experienceId: number;
  senderName: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
}

export interface VoucherApplyRequest {
  code: string;
  bookingId: number;
}

export interface VoucherApplyResponse {
  message: string;
  booking: {
    id: number;
    totalPrice: number;
    paymentStatus: string;
  };
  voucher: {
    code: string;
    currentBalance: number;
    isEnabled: boolean;
  };
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

export interface Voucher {
  id: number;
  code: string;
  type: 'fixed_amount' | 'experience';
  initialValue: number;
  currentBalance: number;
  isEnabled: boolean;
  senderName?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
  expiryDate?: string;
  experienceId?: number;
  experience?: {
    id: number;
    title: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VouchersListResponse {
  vouchers: Voucher[];
  total: number;
  page: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class VoucherService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

  purchaseFixed(request: VoucherPurchaseFixedRequest): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(`${this.apiUrl}/vouchers/purchase-fixed`, request);
  }

  purchaseExperience(
    request: VoucherPurchaseExperienceRequest
  ): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${this.apiUrl}/vouchers/purchase-experience`,
      request
    );
  }

  applyVoucher(request: VoucherApplyRequest): Observable<VoucherApplyResponse> {
    return this.http.post<VoucherApplyResponse>(`${this.apiUrl}/vouchers/apply`, request);
  }

  // Admin methods
  getVouchers(page: number = 1, limit: number = 10): Observable<VouchersListResponse> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<VouchersListResponse>(
      `${this.apiUrl}/vouchers/admin/vouchers?page=${page}&limit=${limit}`,
      { headers }
    );
  }

  createVoucher(voucher: any): Observable<{ message: string; voucher: Voucher }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<{ message: string; voucher: Voucher }>(
      `${this.apiUrl}/vouchers/admin/vouchers`,
      voucher,
      { headers }
    );
  }

  updateVoucher(id: number, updates: any): Observable<{ message: string; voucher: Voucher }> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<{ message: string; voucher: Voucher }>(
      `${this.apiUrl}/vouchers/admin/vouchers/${id}`,
      updates,
      { headers }
    );
  }
}
