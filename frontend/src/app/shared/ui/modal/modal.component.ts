import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-2" (click)="cerrar.emit()">
        <div
          class="w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl bg-white p-4 shadow-2xl sm:max-w-lg md:max-w-2xl"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="text-lg font-semibold text-slate-900">{{ titulo() }}</h2>
            <button
              type="button"
              class="min-h-[40px] min-w-[40px] rounded-lg text-slate-600 hover:bg-slate-100"
              (click)="cerrar.emit()"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input.required<boolean>();
  readonly titulo = input<string>('');
  readonly cerrar = output<void>();
}
