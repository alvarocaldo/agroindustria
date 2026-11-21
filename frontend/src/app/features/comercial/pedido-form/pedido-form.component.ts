import { Component, inject, signal } from '@angular/core';
import { FormField, form, maxLength, required, validate } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import type { PedidoCreate, PedidoDetalle, PedidoResponse } from '../../../models/comercial.model';
import { ComercialService } from '../../../services/comercial.service';

interface PedidoFormModel {
  id_pedido: string;
  id_cliente: string;
  /** El backend define `detalles` como list[dict[str, Any]] sin claves fijas; se captura como JSON. */
  detalles: string;
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
          <p class="mt-2 text-sm text-slate-500">Registra el pedido y su detalle en formato JSON.</p>
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
          El backend recibe <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">detalles</code>
          como una lista de objetos JSON sin nombres de campos fijos
          (<code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">list[dict[str, Any]]</code>).
          Escribe aquí el arreglo completo con las claves que espera tu RPC
          <code class="rounded bg-sky-100 px-1.5 py-0.5 font-mono text-xs">registrar_pedido_completo</code>.
          No se inventan columnas ni productos.
        </p>
      </div>

      <form
        (submit)="onSubmit($event)"
        novalidate
        class="grid grid-cols-1 gap-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8 md:grid-cols-2"
      >
        <div>
          <label for="id_pedido" class="mb-2 block text-sm font-bold text-slate-700">ID del pedido *</label>
          <input id="id_pedido" class="{{ inputClass }}" [formField]="pedidoForm.id_pedido" />
          @if (pedidoForm.id_pedido().touched() && pedidoForm.id_pedido().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of pedidoForm.id_pedido().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div>
          <label for="id_cliente" class="mb-2 block text-sm font-bold text-slate-700">ID del cliente *</label>
          <input id="id_cliente" class="{{ inputClass }}" [formField]="pedidoForm.id_cliente" />
          @if (pedidoForm.id_cliente().touched() && pedidoForm.id_cliente().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of pedidoForm.id_cliente().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
        </div>

        <div class="md:col-span-2">
          <label for="detalles" class="mb-2 block text-sm font-bold text-slate-700">Detalles (arreglo JSON) *</label>
          <textarea
            id="detalles"
            rows="8"
            class="{{ inputClass }} font-mono text-xs leading-relaxed"
            [formField]="pedidoForm.detalles"
          ></textarea>
          @if (pedidoForm.detalles().touched() && pedidoForm.detalles().invalid()) {
            <p class="mt-2 text-xs font-medium text-red-600" role="alert">
              @for (error of pedidoForm.detalles().errors(); track error.kind) { <span>{{ error.message }}</span> }
            </p>
          }
          <p class="mt-2 text-xs text-slate-500">
            Ejemplo de forma (sin valores inventados): [ &#123;"clave":"valor"&#125; ]
          </p>
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

  readonly loading = signal(false);
  readonly respuesta = signal<PedidoResponse | null>(null);
  readonly inputClass =
    'min-h-[48px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  readonly textoResultado = () => {
    const value = this.respuesta()?.resultado;
    return value === null || value === undefined ? '—' : JSON.stringify(value);
  };

  private readonly model = signal<PedidoFormModel>({
    id_pedido: '',
    id_cliente: '',
    detalles: '',
  });

  readonly pedidoForm = form(this.model, (path) => {
    required(path.id_pedido, { message: 'El ID del pedido es obligatorio' });
    maxLength(path.id_pedido, 100, { message: 'Máximo 100 caracteres' });
    required(path.id_cliente, { message: 'El ID del cliente es obligatorio' });
    required(path.detalles, { message: 'Los detalles son obligatorios' });
    validate(path.detalles, (ctx) => {
      try {
        const parsed: unknown = JSON.parse(ctx.value());
        const esValido =
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every((item) => item !== null && typeof item === 'object' && !Array.isArray(item));
        return esValido
          ? null
          : { kind: 'detallesFormato', message: 'Debe ser un arreglo JSON no vacío de objetos.' };
      } catch {
        return { kind: 'detallesJson', message: 'El contenido no es un JSON válido.' };
      }
    });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.pedidoForm().markAsTouched();
    if (this.pedidoForm().invalid()) {
      return;
    }

    const value = this.model();
    const parsed = JSON.parse(value.detalles) as PedidoDetalle[];
    const payload: PedidoCreate = {
      id_pedido: value.id_pedido.trim(),
      id_cliente: value.id_cliente.trim(),
      detalles: parsed,
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
