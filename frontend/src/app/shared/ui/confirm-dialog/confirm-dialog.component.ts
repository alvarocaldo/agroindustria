import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-2">
        <div class="w-[95vw] max-h-[90vh] overflow-y-auto rounded-xl bg-white p-5 shadow-2xl sm:max-w-md" role="alertdialog" aria-modal="true">
          <h2 class="text-lg font-semibold text-slate-900">{{ titulo() }}</h2>
          <p class="mt-2 text-sm text-slate-600">{{ mensaje() }}</p>
          <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="min-h-[40px] w-full rounded-lg border border-slate-300 px-4 sm:w-auto" (click)="cancelar.emit()">
              Cancelar
            </button>
            <button type="button" class="min-h-[40px] w-full rounded-lg bg-red-600 px-4 font-semibold text-white sm:w-auto" (click)="confirmar.emit()">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input.required<boolean>();
  readonly titulo = input<string>('Confirmar acción');
  readonly mensaje = input<string>('');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
