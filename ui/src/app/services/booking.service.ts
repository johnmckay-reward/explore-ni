import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateBookingRequest {
  experienceId: number;
  availabilityId: number;
  quantity: number;
  customerDetails: {
    name: string;
    email: string;
  };
}

export interface CreateBookingResponse {
  message: string;
  bookingId: number;
  totalPrice: number;
}

export interface BookingDetails {
  id: number;
  experienceId: number;
  availabilityId: number;
  quantity: number;
  bookingDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  createdAt?: string;
  experience: {
    id: number;
    title: string;
    description: string;
    price: number;
    confirmationMode: string;
    location?: string;
  };
  availability: {
    id: number;
    date: string;
    startTime: string;
    endTime: string;
  };
}

export interface CreatePaymentIntentRequest {
  bookingId: number;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://explore-ni.onrender.com/api';

  constructor(private http: HttpClient) { }

  /**
   * Create a new booking
   */
  createBooking(request: CreateBookingRequest): Observable<CreateBookingResponse> {
    return this.http.post<CreateBookingResponse>(`${this.apiUrl}/bookings`, request);
  }

  /**
   * Get booking details by ID
   */
  getBooking(bookingId: number): Observable<BookingDetails> {
    return this.http.get<BookingDetails>(`${this.apiUrl}/bookings/${bookingId}`);
  }

  /**
   * Create a Stripe payment intent for a booking
   */
  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<CreatePaymentIntentResponse> {
    return this.http.post<CreatePaymentIntentResponse>(
      `${this.apiUrl}/payments/stripe/create-intent`,
      request
    );
  }

  /**
   * Get all pending booking requests for the authenticated vendor
   */
  getVendorBookingRequests(): Observable<BookingDetails[]> {
    return this.http.get<BookingDetails[]>(`${this.apiUrl}/bookings/requests`);
  }

  /**
   * Confirm a pending booking
   */
  confirmBooking(bookingId: number): Observable<{ message: string; booking: BookingDetails }> {
    return this.http.put<{ message: string; booking: BookingDetails }>(
      `${this.apiUrl}/bookings/${bookingId}/confirm`,
      {}
    );
  }

  /**
   * Decline a pending booking
   */
  declineBooking(bookingId: number): Observable<{ message: string; booking: BookingDetails }> {
    return this.http.put<{ message: string; booking: BookingDetails }>(
      `${this.apiUrl}/bookings/${bookingId}/decline`,
      {}
    );
  }
}
