import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  autohide: boolean;
  delay: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts = signal<Toast[]>([]);
  private nextId = 0;

  getToasts = this.toasts.asReadonly();

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', delay: number = 5000) {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      autohide: true,
      delay
    };
    
    this.toasts.update(toasts => [...toasts, toast]);
    
    if (toast.autohide) {
      setTimeout(() => this.remove(toast.id), delay);
    }
  }

  success(message: string, delay: number = 5000) {
    this.show(message, 'success', delay);
  }

  error(message: string, delay: number = 7000) {
    this.show(message, 'error', delay);
  }

  info(message: string, delay: number = 5000) {
    this.show(message, 'info', delay);
  }

  warning(message: string, delay: number = 6000) {
    this.show(message, 'warning', delay);
  }

  remove(id: number) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear() {
    this.toasts.set([]);
  }
}
