import { Component, inject } from '@angular/core';
import { ToastKind, ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  template: `
    <div class="pointer-events-none fixed right-2 top-2 z-[100] flex w-[96vw] max-w-sm flex-col gap-2 sm:right-4 sm:top-4">
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex min-h-[48px] items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur-md"
          [class]="classes[toast.kind]"
          role="status"
        >
          <span class="flex-1 break-words">{{ toast.message }}</span>
          <button
            type="button"
            class="min-h-[40px] min-w-[40px] rounded font-bold"
            (click)="dismiss(toast.id)"
            aria-label="Cerrar notificación"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastHostComponent {
  private readonly toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  readonly classes: Record<ToastKind, string> = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-900 shadow-emerald-200/60',
    error: 'border-red-200 bg-red-50/95 text-red-900 shadow-red-200/60',
    info: 'border-sky-200 bg-sky-50/95 text-sky-900 shadow-sky-200/60',
  };

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}
