import { Component, computed, inject, signal } from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import type { PedidoCreate, PedidoResponse } from '../../../models/comercial.model';
import { CatalogosService } from '../../../services/catalogos.service';
import { ComercialService } from '../../../services/comercial.service';

interface PedidoFormModel {
  id_pedido: string;
  id_cliente: string;
}

interface DetalleFila {
  id_producto: string;
  id_siembra: string;
  cantidad: number | null;
}

function filaVacia(): DetalleFila {
  return { id_producto: '', id_siembra: '', cantidad: null };
}

@Component({
  selector: 'app-pedido-form',
  standalone: true,
  imports: [FormField],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Comercial</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Registrar pedido</h1>
          <p class="mt-2 text-sm text-slate-500">Registra el pedido y sus productos de forma visual.</p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          POST /api/v1/comercial/pedidos
        </span>
      </div>

      <div class="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-sky-900">
        <svg
          class="mt-0.5 h-5 w-5 shrink-0 text-sky-600"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 16v-4m0-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p>
          Cada fila se convierte automáticamente en un objeto del arreglo
          <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">detalles</code>
          con <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">id_producto</code>,
          <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">id_siembra</code> y
          <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">cantidad</code>.
        </p>
      </div>

      <form
        (submit)="onSubmit($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-2"
      >
        <div>
          <label for="id_pedido" class="mb-2 block text-sm font-bold text-slate-700">
            ID del pedido <span class="font-medium text-slate-400">(opcional)</span>
          </label>
          <input
            id="id_pedido"
            class="{{ inputClass }}"
            placeholder="Autogenerado si se deja vacío"
            [formField]="pedidoForm.id_pedido"
          />
          @if (pedidoForm.id_pedido().touched() && pedidoForm.id_pedido().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of pedidoForm.id_pedido().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="id_cliente" class="mb-2 block text-sm font-bold text-slate-700">Cliente *</label>
          <select id="id_cliente" class="{{ inputClass }}" [formField]="pedidoForm.id_cliente">
            <option value="" disabled>Selecciona un cliente</option>
            @for (opcion of clientes(); track opcion.id) {
              <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
            }
          </select>
          @if (pedidoForm.id_cliente().touched() && pedidoForm.id_cliente().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of pedidoForm.id_cliente().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div class="md:col-span-2">
          <div class="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-sm font-bold text-slate-700">Productos del pedido *</p>
              <p class="mt-1 text-xs text-slate-500">Agrega una fila por cada producto que solicite el cliente.</p>
            </div>
            <button
              type="button"
              (click)="agregarDetalle()"
              [disabled]="productos().length === 0 || siembras().length === 0"
              class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 transition-colors hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                class="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              + Agregar producto
            </button>
          </div>

          @if (detalles().length === 0) {
            <div
              class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-8 text-center text-sm text-slate-500"
            >
              Aún no hay productos. Haz clic en «+ Agregar producto» para comenzar.
            </div>
          } @else {
            <div class="overflow-x-auto rounded-2xl border border-slate-100">
              <table class="w-full min-w-[720px] text-left text-sm">
                <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th class="px-4 py-3 font-bold">Producto</th>
                    <th class="px-4 py-3 font-bold">Siembra de origen</th>
                    <th class="w-36 px-4 py-3 font-bold">Cantidad</th>
                    <th class="w-16 px-4 py-3 font-bold"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (fila of detalles(); track $index) {
                    <tr class="align-top">
                      <td class="px-4 py-3">
                        <select
                          class="{{ inputClass }} min-h-[44px] py-2"
                          [value]="fila.id_producto"
                          (change)="actualizarDetalle($index, 'id_producto', valorSelect($event))"
                          aria-label="Producto"
                        >
                          <option value="" disabled>Selecciona un producto</option>
                          @for (opcion of productos(); track opcion.id) {
                            <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
                          }
                        </select>
                      </td>
                      <td class="px-4 py-3">
                        <select
                          class="{{ inputClass }} min-h-[44px] py-2"
                          [value]="fila.id_siembra"
                          (change)="actualizarDetalle($index, 'id_siembra', valorSelect($event))"
                          aria-label="Siembra de origen"
                        >
                          <option value="" disabled>Selecciona una siembra</option>
                          @for (opcion of siembras(); track opcion.id) {
                            <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
                          }
                        </select>
                      </td>
                      <td class="px-4 py-3">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          class="{{ inputClass }} min-h-[44px] py-2"
                          placeholder="0"
                          [value]="fila.cantidad ?? ''"
                          (input)="actualizarDetalle($index, 'cantidad', valorNumero($event))"
                          aria-label="Cantidad"
                        />
                      </td>
                      <td class="px-4 py-3 text-center">
                        <button
                          type="button"
                          (click)="quitarDetalle($index)"
                          class="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          [attr.aria-label]="'Quitar fila ' + ($index + 1)"
                          title="Quitar fila"
                        >
                          <svg
                            class="h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                            stroke-linecap="round"
                          >
                            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          @if (detallesTocados()) {
            <div class="mt-3 space-y-1" role="alert">
              @for (error of erroresDetalles(); track error) {
                <p class="text-xs font-medium text-red-600">{{ error }}</p>
              }
            </div>
          }
        </div>

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
            {{ loading() ? 'Guardando…' : 'Guardar pedido' }}
          </button>
        </div>
      </form>

      @if (respuesta(); as result) {
        <div class="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-gray-200/50">
          <p class="font-bold text-emerald-900">{{ result.mensaje }}</p>
          <p class="mt-2 break-all text-xs text-slate-600">Resultado del servidor: {{ textoResultado() }}</p>
        </div>
      }
    </section>
  `,
})
export class PedidoFormComponent {
  private readonly service = inject(ComercialService);
  private readonly toast = inject(ToastService);
  readonly catalogos = inject(CatalogosService);

  readonly loading = signal(false);
  readonly respuesta = signal<PedidoResponse | null>(null);
  readonly detalles = signal<DetalleFila[]>([]);
  readonly detallesTocados = signal(false);
  readonly clientes = computed(() => this.catalogos.opcionesDe('CLIENTE', 'CLIENTES'));
  readonly productos = computed(() => this.catalogos.opcionesDe('PRODUCTO', 'PRODUCTOS'));
  readonly siembras = computed(() => this.catalogos.opcionesDe('SIEMBRA', 'SIEMBRAS'));
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  readonly erroresDetalles = computed<string[]>(() => {
    const filas = this.detalles();
    if (filas.length === 0) {
      return ['Agrega al menos un producto al pedido.'];
    }
    const errores: string[] = [];
    filas.forEach((fila, indice) => {
      const numero = indice + 1;
      if (!fila.id_producto) {
        errores.push(`Fila ${numero}: selecciona un producto.`);
      }
      if (!fila.id_siembra) {
        errores.push(`Fila ${numero}: selecciona la siembra de origen.`);
      }
      if (fila.cantidad === null || fila.cantidad <= 0) {
        errores.push(`Fila ${numero}: la cantidad debe ser mayor que cero.`);
      }
    });
    return errores;
  });

  readonly textoResultado = () => {
    const value = this.respuesta()?.resultado;
    return value === null || value === undefined ? '—' : JSON.stringify(value);
  };

  private readonly model = signal<PedidoFormModel>({
    id_pedido: '',
    id_cliente: '',
  });

  readonly pedidoForm = form(this.model, (path) => {
    maxLength(path.id_pedido, 100, { message: 'Máximo 100 caracteres' });
    required(path.id_cliente, { message: 'El cliente es obligatorio' });
  });

  constructor() {
    this.catalogos.cargarOpciones().subscribe();
  }

  agregarDetalle(): void {
    this.detalles.update((filas) => [...filas, filaVacia()]);
  }

  quitarDetalle(indice: number): void {
    this.detalles.update((filas) => filas.filter((_, posicion) => posicion !== indice));
  }

  actualizarDetalle(
    indice: number,
    campo: keyof DetalleFila,
    valor: string | number | null,
  ): void {
    this.detalles.update((filas) =>
      filas.map((fila, posicion) =>
        posicion === indice ? ({ ...fila, [campo]: valor } as DetalleFila) : fila,
      ),
    );
  }

  valorSelect(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  valorNumero(event: Event): number | null {
    const texto = (event.target as HTMLInputElement).value;
    if (texto === '') {
      return null;
    }
    const numero = Number(texto);
    return Number.isFinite(numero) ? numero : null;
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.pedidoForm().markAsTouched();
    this.detallesTocados.set(true);
    if (this.pedidoForm().invalid() || this.erroresDetalles().length > 0) {
      return;
    }

    const value = this.model();
    const payload: PedidoCreate = {
      id_pedido: value.id_pedido.trim() || null,
      id_cliente: value.id_cliente,
      detalles: this.detalles().map((fila) => ({
        id_producto: fila.id_producto,
        id_siembra: fila.id_siembra,
        cantidad: fila.cantidad as number,
      })),
    };

    this.loading.set(true);
    this.service
      .registrarPedido(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.respuesta.set(response);
          this.toast.success('Pedido registrado correctamente');
        },
      });
  }
}
