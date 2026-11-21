import { Component, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { TrazabilidadService } from '../../services/trazabilidad.service';
import type { TrazabilidadFila } from '../../models/trazabilidad.model';

interface BusquedaModel {
  id_pedido: string;
}

@Component({
  selector: 'app-trazabilidad',
  standalone: true,
  imports: [FormField],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Trazabilidad</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Trazabilidad por pedido</h1>
          <p class="mt-2 text-sm text-slate-500">Consulta el recorrido completo de un pedido desde su origen.</p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          GET /api/v1/trazabilidad/pedido/&#123;id_pedido&#125;
        </span>
      </div>

      <form
        (submit)="buscar($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <label for="id_pedido" class="mb-2 block text-sm font-bold text-slate-700">ID del pedido *</label>
          <input id="id_pedido" class="{{ inputClass }}" [formField]="busquedaForm.id_pedido" />
          @if (busquedaForm.id_pedido().touched() && busquedaForm.id_pedido().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of busquedaForm.id_pedido().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>
        <button
          type="submit"
          [disabled]="loading()"
          class="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-6 font-bold text-white shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-xl hover:shadow-emerald-400/40 disabled:translate-y-0 disabled:opacity-60"
        >
          <svg
            class="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35" />
          </svg>
          {{ loading() ? 'Consultando…' : 'Consultar' }}
        </button>
      </form>

      @if (filas().length > 0) {
        <div>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-lg font-extrabold tracking-tight text-slate-900">
              {{ filas().length }} fila(s) devuelta(s) por el RPC
            </h2>
            <span
              class="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
            >
              Datos del servidor
            </span>
          </div>
          <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
            @for (fila of filas(); track $index) {
              <article
                class="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                  <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                  </svg>
                </div>
                <dl class="divide-y divide-slate-100">
                  @for (campo of campos(fila); track campo.clave) {
                    <div class="flex flex-col gap-1 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                      <dt class="text-xs font-bold uppercase tracking-wide text-slate-500 sm:w-2/5">
                        {{ campo.clave }}
                      </dt>
                      <dd class="break-words text-sm font-medium text-slate-800 sm:w-3/5 sm:text-right">
                        {{ campo.valor }}
                      </dd>
                    </div>
                  }
                </dl>
              </article>
            }
          </div>
        </div>
      } @else if (consultado()) {
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm"
        >
          El backend no devolvió filas para el pedido consultado.
        </div>
      }

      <div class="flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 text-xs text-amber-900">
        <svg
          class="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
        <p>
          El endpoint devuelve filas del RPC sin un contrato de columnas declarado. Por eso se renderizan
          dinámicamente todas las claves recibidas, sin asumir nombres como "fundo", "lote" o "producto".
        </p>
      </div>
    </section>
  `,
})
export class TrazabilidadComponent {
  private readonly service = inject(TrazabilidadService);

  readonly loading = signal(false);
  readonly consultado = signal(false);
  readonly filas = signal<TrazabilidadFila[]>([]);
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  private readonly model = signal<BusquedaModel>({ id_pedido: '' });

  readonly busquedaForm = form(this.model, (path) => {
    required(path.id_pedido, { message: 'El ID del pedido es obligatorio' });
  });

  campos(fila: TrazabilidadFila): Array<{ clave: string; valor: string }> {
    return Object.entries(fila).map(([clave, valor]) => ({
      clave,
      valor: valor === null || valor === undefined ? '—' : String(valor),
    }));
  }

  buscar(event: Event): void {
    event.preventDefault();
    this.busquedaForm().markAsTouched();
    if (this.busquedaForm().invalid()) {
      return;
    }

    this.loading.set(true);
    this.service
      .porPedido(this.model().id_pedido.trim())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (rows) => {
          this.filas.set(rows);
          this.consultado.set(true);
        },
      });
  }
}
