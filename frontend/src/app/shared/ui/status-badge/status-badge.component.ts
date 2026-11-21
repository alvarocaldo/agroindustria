import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    @if (activo() === true) {
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        Activo
      </span>
    } @else if (activo() === false) {
      <span
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-200/80 px-2.5 py-1 text-xs font-bold text-slate-700 ring-1 ring-slate-300"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
        Inactivo
      </span>
    } @else {
      <span
        class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200"
      >
        —
      </span>
    }
  `,
})
export class StatusBadgeComponent {
  readonly activo = input<boolean | null | undefined>(null);
}
