import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, maxLength, min, pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import type { SiembraCreate, SiembraResponse } from '../../../models/produccion.model';
import { CatalogosService } from '../../../services/catalogos.service';
import { ProduccionService } from '../../../services/produccion.service';
import { ToastService } from '../../../core/services/toast.service';
import { StatusBadgeComponent } from '../../../shared/ui/status-badge/status-badge.component';

interface SiembraFormModel {
  ID_Siembra: string;
  ID_Lote: string;
  ID_Variedad: string;
  ID_Campana: string;
  Fecha_Siembra: string;
  Fecha_Cosecha: string;
  Kg_Cosechados: number | null;
  activo: boolean;
}

@Component({
  selector: 'app-siembra-form',
  standalone: true,
  imports: [FormField, StatusBadgeComponent],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Producción</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Registrar siembra</h1>
          <p class="mt-2 text-sm text-slate-500">Completa los datos de la nueva siembra en el sistema.</p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          POST /api/v1/produccion/siembras
        </span>
      </div>

      <form
        (submit)="onSubmit($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-2"
      >
        <div>
          <label for="ID_Siembra" class="mb-2 block text-sm font-bold text-slate-700">
            ID de siembra <span class="font-medium text-slate-400">(opcional)</span>
          </label>
          <input
            id="ID_Siembra"
            class="{{ inputClass }}"
            placeholder="Dejar vacío para autogenerar (ej. S002)"
            [formField]="siembraForm.ID_Siembra"
          />
          @if (siembraForm.ID_Siembra().touched() && siembraForm.ID_Siembra().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.ID_Siembra().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="ID_Lote" class="mb-2 block text-sm font-bold text-slate-700">Lote *</label>
          <select id="ID_Lote" class="{{ inputClass }}" [formField]="siembraForm.ID_Lote">
            <option value="" disabled>Selecciona un lote</option>
            @for (opcion of lotes(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (siembraForm.ID_Lote().touched() && siembraForm.ID_Lote().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.ID_Lote().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
          @if (!catalogos.cargando() && lotes().length === 0) {
            <p class="mt-2 text-xs text-amber-600">No hay lotes disponibles en el catálogo.</p>
          }
        </div>

        <div>
          <label for="ID_Variedad" class="mb-2 block text-sm font-bold text-slate-700">Variedad *</label>
          <select id="ID_Variedad" class="{{ inputClass }}" [formField]="siembraForm.ID_Variedad">
            <option value="" disabled>Selecciona una variedad</option>
            @for (opcion of variedades(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (siembraForm.ID_Variedad().touched() && siembraForm.ID_Variedad().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.ID_Variedad().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="ID_Campana" class="mb-2 block text-sm font-bold text-slate-700">Campaña *</label>
          <select id="ID_Campana" class="{{ inputClass }}" [formField]="siembraForm.ID_Campana">
            <option value="" disabled>Selecciona una campaña</option>
            @for (opcion of campanas(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (siembraForm.ID_Campana().touched() && siembraForm.ID_Campana().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.ID_Campana().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="Fecha_Siembra" class="mb-2 block text-sm font-bold text-slate-700">Fecha de siembra *</label>
          <input id="Fecha_Siembra" type="date" class="{{ inputClass }}" [formField]="siembraForm.Fecha_Siembra" />
          @if (siembraForm.Fecha_Siembra().touched() && siembraForm.Fecha_Siembra().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.Fecha_Siembra().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="Fecha_Cosecha" class="mb-2 block text-sm font-bold text-slate-700">
            Fecha de cosecha <span class="font-medium text-slate-400">(opcional)</span>
          </label>
          <input id="Fecha_Cosecha" type="date" class="{{ inputClass }}" [formField]="siembraForm.Fecha_Cosecha" />
        </div>

        <div>
          <label for="Kg_Cosechados" class="mb-2 block text-sm font-bold text-slate-700">
            Kg cosechados <span class="font-medium text-slate-400">(opcional)</span>
          </label>
          <input
            id="Kg_Cosechados"
            type="number"
            step="0.01"
            class="{{ inputClass }}"
            [formField]="siembraForm.Kg_Cosechados"
          />
          @if (siembraForm.Kg_Cosechados().touched() && siembraForm.Kg_Cosechados().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of siembraForm.Kg_Cosechados().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <label
          class="flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300"
        >
          <input
            type="checkbox"
            class="h-5 w-5 rounded-lg accent-emerald-600 focus:ring-2 focus:ring-emerald-500/40"
            [formField]="siembraForm.activo"
          />
          Registro activo
        </label>

        <div class="md:col-span-2">
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
            {{ loading() ? 'Guardando…' : 'Guardar siembra' }}
          </button>
        </div>
      </form>

      @if (ultimaSiembra(); as siembra) {
        <div class="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-gray-200/50">
          <div class="border-b border-emerald-100 bg-gradient-to-r bg-linear-to-r from-emerald-50 to-white px-6 py-4">
            <p class="text-sm font-bold text-emerald-900">Registro confirmado por el servidor (HTTP 201)</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[860px] text-left text-sm">
              <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-3.5 font-bold">ID_Siembra</th>
                  <th class="px-6 py-3.5 font-bold">ID_Lote</th>
                  <th class="px-6 py-3.5 font-bold">ID_Variedad</th>
                  <th class="px-6 py-3.5 font-bold">ID_Campana</th>
                  <th class="px-6 py-3.5 font-bold">Fecha_Siembra</th>
                  <th class="px-6 py-3.5 font-bold">Fecha_Cosecha</th>
                  <th class="px-6 py-3.5 font-bold">Kg_Cosechados</th>
                  <th class="px-6 py-3.5 font-bold">activo</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="transition-colors hover:bg-emerald-50/40">
                  <td class="px-6 py-4 font-bold text-slate-900">{{ siembra.ID_Siembra }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Lote }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Variedad }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Campana }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.Fecha_Siembra }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.Fecha_Cosecha ?? '—' }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ siembra.Kg_Cosechados ?? '—' }}</td>
                  <td class="px-6 py-4"><app-status-badge [activo]="siembra.activo" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }
    </section>
  `,
})
export class SiembraFormComponent {
  private readonly service = inject(ProduccionService);
  private readonly toast = inject(ToastService);
  readonly catalogos = inject(CatalogosService);

  readonly loading = signal(false);
  readonly ultimaSiembra = signal<SiembraResponse | null>(null);
  readonly lotes = computed(() => this.catalogos.opcionesDe('LOTE', 'LOTES'));
  readonly variedades = computed(() => this.catalogos.opcionesDe('VARIEDAD', 'VARIEDADES'));
  readonly campanas = computed(() => this.catalogos.opcionesDe('CAMPAÑA', 'CAMPAÑAS'));
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  private readonly model = signal<SiembraFormModel>({
    ID_Siembra: '',
    ID_Lote: '',
    ID_Variedad: '',
    ID_Campana: '',
    Fecha_Siembra: '',
    Fecha_Cosecha: '',
    Kg_Cosechados: null,
    activo: true,
  });

  readonly siembraForm = form(this.model, (path) => {
    maxLength(path.ID_Siembra, 100, { message: 'Máximo 100 caracteres' });
    required(path.ID_Lote, { message: 'El ID de lote es obligatorio' });
    required(path.ID_Variedad, { message: 'El ID de variedad es obligatorio' });
    required(path.ID_Campana, { message: 'El ID de campaña es obligatorio' });
    required(path.Fecha_Siembra, { message: 'La fecha de siembra es obligatoria' });
    pattern(path.Fecha_Siembra, /^\d{4}-\d{2}-\d{2}$/, { message: 'Usa el formato AAAA-MM-DD' });
    min(path.Kg_Cosechados, 0, { message: 'Los kilogramos no pueden ser negativos' });
  });

  constructor() {
    this.catalogos.cargarOpciones().subscribe();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.siembraForm().markAsTouched();
    if (this.siembraForm().invalid()) {
      return;
    }

    const value = this.model();
    const payload: SiembraCreate = {
      ID_Siembra: value.ID_Siembra.trim() || null,
      ID_Lote: value.ID_Lote.trim(),
      ID_Variedad: value.ID_Variedad.trim(),
      ID_Campana: value.ID_Campana.trim(),
      Fecha_Siembra: value.Fecha_Siembra,
      Fecha_Cosecha: value.Fecha_Cosecha || null,
      Kg_Cosechados: value.Kg_Cosechados === null ? null : value.Kg_Cosechados,
      activo: value.activo,
    };

    this.loading.set(true);
    this.service
      .registrarSiembra(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.ultimaSiembra.set(response);
          this.toast.success('Siembra registrada correctamente');
        },
      });
  }
}
