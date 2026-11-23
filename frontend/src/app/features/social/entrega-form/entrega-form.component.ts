import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, maxLength, min, pattern, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ExternalService } from '../../../core/services/external.service';
import { ToastService } from '../../../core/services/toast.service';
import type { EntregaCreate, EntregaResponse } from '../../../models/social.model';
import { CatalogosService } from '../../../services/catalogos.service';
import { SocialService } from '../../../services/social.service';

interface EntregaFormModel {
  /** DNI y Nombre_Completo son apoyos de captura: no forman parte de EntregaCreate. */
  DNI: string;
  Nombre_Completo: string;
  ID_Entrega: string;
  ID_Programa: string;
  ID_Beneficiario: string;
  Raciones: number | null;
  Fecha_Entrega: string;
}

@Component({
  selector: 'app-entrega-form',
  standalone: true,
  imports: [FormField],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Impacto social</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Registrar entrega social</h1>
          <p class="mt-2 text-sm text-slate-500">Registra la entrega de raciones al programa y beneficiario.</p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          POST /api/v1/social/entregas
        </span>
      </div>

      <form
        (submit)="onSubmit($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-2"
      >
        <div class="md:col-span-2">
          <label for="DNI" class="mb-2 block text-sm font-bold text-slate-700">DNI del beneficiario</label>
          <div class="flex items-stretch gap-2">
            <input
              id="DNI"
              type="text"
              inputmode="numeric"
              placeholder="8 dígitos"
              class="{{ inputClass }} min-w-0 flex-1"
              [formField]="entregaForm.DNI"
            />
            <button
              type="button"
              (click)="buscarDni()"
              [disabled]="buscandoDni()"
              class="group inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-4 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-xl hover:shadow-emerald-400/40 disabled:translate-y-0 disabled:opacity-60 sm:px-5"
            >
              @if (buscandoDni()) {
                <svg class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
                  <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4Z" />
                </svg>
              } @else {
                <svg
                  class="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              }
              {{ buscandoDni() ? 'Buscando…' : 'Buscar RENIEC' }}
            </button>
          </div>
          @if (entregaForm.DNI().touched() && entregaForm.DNI().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.DNI().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div class="md:col-span-2">
          <label for="Nombre_Completo" class="mb-2 block text-sm font-bold text-slate-700">
            Nombre completo del beneficiario
          </label>
          <input
            id="Nombre_Completo"
            class="{{ inputClass }}"
            placeholder="Se completa automáticamente desde RENIEC"
            [formField]="entregaForm.Nombre_Completo"
          />
        </div>

        <div>
          <label for="ID_Entrega" class="mb-2 block text-sm font-bold text-slate-700">
            ID de entrega <span class="font-medium text-slate-400">(opcional)</span>
          </label>
          <input
            id="ID_Entrega"
            class="{{ inputClass }}"
            placeholder="Autogenerado si se deja vacío"
            [formField]="entregaForm.ID_Entrega"
          />
          @if (entregaForm.ID_Entrega().touched() && entregaForm.ID_Entrega().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.ID_Entrega().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="ID_Programa" class="mb-2 block text-sm font-bold text-slate-700">
            Programa social *
          </label>
          <select id="ID_Programa" class="{{ inputClass }}" [formField]="entregaForm.ID_Programa">
            <option value="" disabled>Selecciona un programa social</option>
            @for (opcion of programas(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (entregaForm.ID_Programa().touched() && entregaForm.ID_Programa().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.ID_Programa().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="ID_Beneficiario" class="mb-2 block text-sm font-bold text-slate-700">
            Beneficiario *
          </label>
          <select id="ID_Beneficiario" class="{{ inputClass }}" [formField]="entregaForm.ID_Beneficiario">
            <option value="" disabled>Selecciona un beneficiario</option>
            @for (opcion of beneficiarios(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (entregaForm.ID_Beneficiario().touched() && entregaForm.ID_Beneficiario().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.ID_Beneficiario().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="Raciones" class="mb-2 block text-sm font-bold text-slate-700">Raciones *</label>
          <input id="Raciones" type="number" step="1" class="{{ inputClass }}" [formField]="entregaForm.Raciones" />
          @if (entregaForm.Raciones().touched() && entregaForm.Raciones().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.Raciones().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="Fecha_Entrega" class="mb-2 block text-sm font-bold text-slate-700">Fecha de entrega *</label>
          <input id="Fecha_Entrega" type="date" class="{{ inputClass }}" [formField]="entregaForm.Fecha_Entrega" />
          @if (entregaForm.Fecha_Entrega().touched() && entregaForm.Fecha_Entrega().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of entregaForm.Fecha_Entrega().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
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
            {{ loading() ? 'Guardando…' : 'Guardar entrega' }}
          </button>
        </div>
      </form>

      @if (ultimaEntrega(); as entrega) {
        <div class="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-gray-200/50">
          <div class="border-b border-emerald-100 bg-gradient-to-r bg-linear-to-r from-emerald-50 to-white px-6 py-4">
            <p class="text-sm font-bold text-emerald-900">Entrega confirmada por el servidor (HTTP 201)</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                <tr>
                  <th class="px-6 py-3.5 font-bold">ID_Entrega</th>
                  <th class="px-6 py-3.5 font-bold">ID_Programa</th>
                  <th class="px-6 py-3.5 font-bold">ID_Beneficiario</th>
                  <th class="px-6 py-3.5 font-bold">Raciones</th>
                  <th class="px-6 py-3.5 font-bold">Fecha_Entrega</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr class="transition-colors hover:bg-emerald-50/40">
                  <td class="px-6 py-4 font-bold text-slate-900">{{ entrega.ID_Entrega }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ entrega.ID_Programa }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ entrega.ID_Beneficiario }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ entrega.Raciones }}</td>
                  <td class="px-6 py-4 text-slate-600">{{ entrega.Fecha_Entrega }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      }
    </section>
  `,
})
export class EntregaFormComponent {
  private readonly service = inject(SocialService);
  private readonly externalService = inject(ExternalService);
  private readonly toast = inject(ToastService);
  readonly catalogos = inject(CatalogosService);

  readonly loading = signal(false);
  readonly buscandoDni = signal(false);
  readonly ultimaEntrega = signal<EntregaResponse | null>(null);
  readonly programas = computed(() => this.catalogos.opcionesDe('PROGRAMA', 'PROGRAMAS'));
  readonly beneficiarios = computed(() => this.catalogos.opcionesDe('BENEFICIARIO', 'BENEFICIARIOS'));
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  private readonly model = signal<EntregaFormModel>({
    DNI: '',
    Nombre_Completo: '',
    ID_Entrega: '',
    ID_Programa: '',
    ID_Beneficiario: '',
    Raciones: null,
    Fecha_Entrega: '',
  });

  readonly entregaForm = form(this.model, (path) => {
    pattern(path.DNI, /^\d{8}$/, { message: 'El DNI debe tener 8 dígitos' });
    maxLength(path.DNI, 8, { message: 'El DNI no puede superar los 8 dígitos' });
    required(path.ID_Programa, { message: 'El programa social es obligatorio' });
    required(path.ID_Beneficiario, { message: 'El beneficiario es obligatorio' });
    required(path.Raciones, { message: 'Las raciones son obligatorias' });
    min(path.Raciones, 1, { message: 'Las raciones deben ser un entero mayor que cero' });
    required(path.Fecha_Entrega, { message: 'La fecha de entrega es obligatoria' });
    pattern(path.Fecha_Entrega, /^\d{4}-\d{2}-\d{2}$/, { message: 'Usa el formato AAAA-MM-DD' });
  });

  constructor() {
    this.catalogos.cargarOpciones().subscribe();
  }

  buscarDni(): void {
    const dni = this.model().DNI.trim();
    if (!/^\d{8}$/.test(dni)) {
      this.entregaForm.DNI().markAsTouched();
      return;
    }

    this.buscandoDni.set(true);
    this.externalService
      .consultarDni(dni)
      .pipe(finalize(() => this.buscandoDni.set(false)))
      .subscribe({
        next: (datos) => {
          const nombreCompleto = [datos.nombres, datos.apellidoPaterno, datos.apellidoMaterno]
            .map((parte) => parte?.trim() ?? '')
            .filter(Boolean)
            .join(' ');
          this.model.update((value) => ({ ...value, Nombre_Completo: nombreCompleto }));
          this.toast.success('Datos de RENIEC cargados correctamente');
        },
        error: () => {
          this.model.update((value) => ({ ...value, Nombre_Completo: '' }));
          this.toast.error('DNI no encontrado o error de conexión');
        },
      });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.entregaForm().markAsTouched();
    if (this.entregaForm().invalid()) {
      return;
    }

    const value = this.model();
    const payload: EntregaCreate = {
      ID_Entrega: value.ID_Entrega.trim() || null,
      ID_Programa: value.ID_Programa.trim(),
      ID_Beneficiario: value.ID_Beneficiario.trim(),
      Raciones: value.Raciones ?? 0,
      Fecha_Entrega: value.Fecha_Entrega,
    };

    this.loading.set(true);
    this.service
      .registrarEntrega(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.ultimaEntrega.set(response);
          this.toast.success('Entrega social registrada correctamente');
        },
      });
  }
}
