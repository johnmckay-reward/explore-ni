import { Component, inject } from '@angular/core';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgbToastModule],
  template: `
    <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 9999">
      @for (toast of toastService.getToasts()(); track toast.id) {
        <ngb-toast
          [autohide]="toast.autohide"
          [delay]="toast.delay"
          (hide)="toastService.remove(toast.id)"
          [class]="'toast-' + toast.type"
        >
          <div class="d-flex align-items-center">
            <i 
              [class]="getIcon(toast.type)" 
              class="me-2 fs-5"
            ></i>
            <div class="flex-grow-1">{{ toast.message }}</div>
          </div>
        </ngb-toast>
      }
    </div>
  `,
  styles: [`
    .toast-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }
    
    .toast-error {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }
    
    .toast-info {
      background-color: #d1ecf1;
      border-color: #bee5eb;
      color: #0c5460;
    }
    
    .toast-warning {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }
  `]
})
export class ToastContainer {
  toastService = inject(ToastService);

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'bi bi-check-circle-fill';
      case 'error': return 'bi bi-exclamation-circle-fill';
      case 'warning': return 'bi bi-exclamation-triangle-fill';
      case 'info': return 'bi bi-info-circle-fill';
      default: return 'bi bi-info-circle-fill';
    }
  }
}
