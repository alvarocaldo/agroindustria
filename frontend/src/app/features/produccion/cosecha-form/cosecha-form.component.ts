import { Component, inject, signal } from '@angular/core';
import { FormField, form, min, pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import type { CosechaResponse, CosechaUpdate } from '../../../models/produccion.model';
import { ProduccionService } from '../../../services/produccion.service';

interface CosechaFormModel {
  id_siembra: string;
  fecha_cosecha: string;
  kg_cosechados: number | null;
}

@Component({
  selector: 'app-cosecha-form',
  standalone: true,
  imports: [FormField],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Producción</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Registrar cosecha</h1>
          <p class="mt-2 text-sm text-slate-500">Cierra el ciclo de una siembra con su resultado real.</p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          PATCH /api/v1/produccion/siembras/&#123;id_siembra&#125;/cosecha
        </span>
      </div>

      <form
        (submit)="onSubmit($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-3"
      >
        <div>
          <label for="id_siembra" class="mb-2 block text-sm font-bold text-slate-700">ID de siembra *</label>
          <input id="id_siembra" class="{{ inputClass }}" [formField]="cosechaForm.id_siembra" />
          @if (cosechaForm.id_siembra().touched() && cosechaForm.id_siembra().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of cosechaForm.id_siembra().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="fecha_cosecha" class="mb-2 block text-sm font-bold text-slate-700">Fecha de cosecha *</label>
          <input id="fecha_cosecha" type="date" class="{{ inputClass }}" [formField]="cosechaForm.fecha_cosecha" />
          @if (cosechaForm.fecha_cosecha().touched() && cosechaForm.fecha_cosecha().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of cosechaForm.fecha_cosecha().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="kg_cosechados" class="mb-2 block text-sm font-bold text-slate-700">Kilogramos cosechados *</label>
          <input
            id="kg_cosechados"
            type="number"
            step="0.01"
            class="{{ inputClass }}"
            [formField]="cosechaForm.kg_cosechados"
          />
          @if (cosechaForm.kg_cosechados().touched() && cosechaForm.kg_cosechados().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of cosechaForm.kg_cosechados().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div class="md:col-span-3">
          <button
            type="submit"
            [disabled]="loading()"
            class="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-6 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-xl hover:shadow-emerald-400/40 disabled:translate-y-0 disabled:opacity-60 sm:w-auto"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 3h12l4 4v14H3V3h2Zm2 0v6h8V3M7 21v-7h10v7" />
            </svg>
            {{ loading() ? 'Registrando…' : 'Registrar cosecha' }}
          </button>
        </div>
      </form>

      @if (respuesta(); as result) {
        <div class="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-gray-200/50">
          <div class="border-b border-emerald-100 bg-gradient-to-r bg-linear-to-r from-emerald-50 to-white px-6 py-4">
            <p class="text-sm font-bold text-emerald-900">{{ result.mensaje }}</p>
          </div>
          @if (result.resultado) {
            <div class="overflow-x-auto">
              <table class="w-full min-w-[560px] text-left text-sm">
                <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th class="px-6 py-3.5 font-bold">Clave devuelta por el RPC</th>
                    <th class="px-6 py-3.5 font-bold">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of filasResultado(); track fila.clave) {
                    <tr class="transition-colors hover:bg-emerald-50/40">
                      <td class="px-6 py-4 font-bold text-slate-800">{{ fila.clave }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ fila.valor }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>
      }
    </section>
  `,
})
export class CosechaFormComponent {
  private readonly service = inject(ProduccionService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly respuesta = signal<CosechaResponse | null>(null);
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  readonly filasResultado = () => {
    const resultado = this.respuesta()?.resultado;
    if (!resultado) {
      return [];
    }
    return Object.entries(resultado).map(([clave, valor]) => ({
      clave,
      valor: valor === null || valor === undefined ? '—' : String(valor),
    }));
  };

  private readonly model = signal<CosechaFormModel>({
    id_siembra: '',
    fecha_cosecha: '',
    kg_cosechados: null,
  });

  readonly cosechaForm = form(this.model, (path) => {
    required(path.id_siembra, { message: 'El ID de siembra es obligatorio' });
    required(path.fecha_cosecha, { message: 'La fecha de cosecha es obligatoria' });
    pattern(path.fecha_cosecha, /^\d{4}-\d{2}-\d{2}$/, { message: 'Usa el formato AAAA-MM-DD' });
    required(path.kg_cosechados, { message: 'Los kilogramos son obligatorios' });
    min(path.kg_cosechados, 0, { message: 'Los kilogramos deben ser mayores o iguales a cero' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.cosechaForm().markAsTouched();
    if (this.cosechaForm().invalid()) {
      return;
    }

    const value = this.model();
    const body: CosechaUpdate = {
      fecha_cosecha: value.fecha_cosecha,
      kg_cosechados: value.kg_cosechados ?? 0,
    };

    this.loading.set(true);
    this.service
      .registrarCosecha(value.id_siembra.trim(), body)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.respuesta.set(response);
          this.toast.success('Cosecha registrada correctamente');
        },
      });
  }
}
