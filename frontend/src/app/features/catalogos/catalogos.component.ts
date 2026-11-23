import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormField, form, maxLength, min, required } from '@angular/forms/signals';
import { finalize, forkJoin } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import type {
  Beneficiario,
  Categoria,
  Cliente,
  EntidadMaestro,
  Lote,
  MaestroCreatePorEntidad,
  MaestroPorEntidad,
  Producto,
  Programa,
} from '../../models/maestros.model';
import { CatalogosService } from '../../services/catalogos.service';
import { MaestrosService } from '../../services/maestros.service';

interface LoteFormModel {
  id_fundo: string;
  nombre_lote: string;
  hectareas: number | null;
}

interface CategoriaFormModel {
  nombre_categoria: string;
}

interface ProductoFormModel {
  nombre_producto: string;
  id_categoria: string;
  precio_unit: number | null;
}

interface ClienteFormModel {
  nombre_cliente: string;
  pais: string;
}

interface ProgramaFormModel {
  nombre_programa: string;
}

interface BeneficiarioFormModel {
  nombre_beneficiario: string;
  tipo_beneficiario: string;
}

type Pestana = 'lotes' | 'categorias' | 'clientes' | 'programas';

const ETIQUETAS: Record<EntidadMaestro, string> = {
  lotes: 'Lote',
  categorias: 'Categoría',
  productos: 'Producto',
  clientes: 'Cliente',
  programas: 'Programa social',
  beneficiarios: 'Beneficiario',
};

@Component({
  selector: 'app-catalogos',
  standalone: true,
  imports: [FormField],
  template: `
    <section class="space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Configuración</p>
          <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Catálogos</h1>
          <p class="mt-2 text-sm text-slate-500">
            Administra los maestros que alimentan los formularios operativos.
          </p>
        </div>
        <span
          class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
        >
          GET / POST /api/v1/maestros
        </span>
      </div>

      <div class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-gray-200/50">
        <div class="flex overflow-x-auto border-b border-slate-100 px-2 pt-2">
          @for (tab of pestanas; track tab.id) {
            <button
              type="button"
              (click)="seleccionarPestana(tab.id)"
              class="min-h-[52px] shrink-0 border-b-2 px-5 text-sm font-bold transition-colors"
              [class.border-emerald-500]="pestana() === tab.id"
              [class.text-emerald-700]="pestana() === tab.id"
              [class.border-transparent]="pestana() !== tab.id"
              [class.text-slate-500]="pestana() !== tab.id"
              [attr.aria-selected]="pestana() === tab.id"
              role="tab"
            >
              {{ tab.etiqueta }}
            </button>
          }
        </div>

        <div class="p-6 sm:p-8">
          @switch (pestana()) {
            @case ('lotes') {
              <div class="space-y-8">
                <form
                  (submit)="guardarLote($event)"
                  novalidate
                  class="grid grid-cols-1 gap-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6 md:grid-cols-3"
                >
                  <div class="md:col-span-3">
                    <h2 class="text-lg font-extrabold text-slate-900">Nuevo lote</h2>
                    <p class="mt-1 text-xs text-slate-500">El código del lote se genera automáticamente.</p>
                  </div>
                  <div>
                    <label for="id_fundo" class="mb-2 block text-sm font-bold text-slate-700">Fundo *</label>
                    <select id="id_fundo" class="{{ inputClass }}" [formField]="loteForm.id_fundo">
                      <option value="" disabled>Selecciona un fundo</option>
                      @for (opcion of opcionesFondos(); track opcion.id) {
                        <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
                      }
                    </select>
                    @if (loteForm.id_fundo().touched() && loteForm.id_fundo().invalid()) {
                      <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                        @for (error of loteForm.id_fundo().errors(); track error.kind) { <span>{{ error.message }}</span> }
                      </p>
                    }
                    @if (!catalogos.cargando() && opcionesFondos().length === 0) {
                      <p class="mt-2 text-xs text-amber-600">No hay fundos disponibles en el catálogo.</p>
                    }
                  </div>
                  <div>
                    <label for="nombre_lote" class="mb-2 block text-sm font-bold text-slate-700">
                      Nombre del lote *
                    </label>
                    <input id="nombre_lote" class="{{ inputClass }}" [formField]="loteForm.nombre_lote" />
                    @if (loteForm.nombre_lote().touched() && loteForm.nombre_lote().invalid()) {
                      <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                        @for (error of loteForm.nombre_lote().errors(); track error.kind) { <span>{{ error.message }}</span> }
                      </p>
                    }
                  </div>
                  <div>
                    <label for="hectareas" class="mb-2 block text-sm font-bold text-slate-700">Hectáreas *</label>
                    <input
                      id="hectareas"
                      type="number"
                      min="0.01"
                      step="0.01"
                      class="{{ inputClass }}"
                      [formField]="loteForm.hectareas"
                    />
                    @if (loteForm.hectareas().touched() && loteForm.hectareas().invalid()) {
                      <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                        @for (error of loteForm.hectareas().errors(); track error.kind) { <span>{{ error.message }}</span> }
                      </p>
                    }
                  </div>
                  <div class="md:col-span-3">
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'lotes' ? 'Guardando…' : 'Guardar lote' }}
                    </button>
                  </div>
                </form>
                <div>
                  <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Lotes existentes</h3>
                  <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full min-w-[640px] text-left text-sm">
                      <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th class="px-5 py-3 font-bold">ID</th>
                          <th class="px-5 py-3 font-bold">Nombre</th>
                          <th class="px-5 py-3 font-bold">Fundo</th>
                          <th class="px-5 py-3 font-bold">Hectáreas</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (lote of lotes(); track lote.id_lote) {
                          <tr class="hover:bg-emerald-50/40">
                            <td class="px-5 py-3 font-bold text-slate-900">{{ lote.id_lote }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ lote.nombre_lote }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ lote.id_fundo }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ lote.hectareas }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="4" class="px-5 py-6 text-center text-slate-500">No hay lotes registrados.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('categorias') {
              <div class="space-y-8">
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <form
                    (submit)="guardarCategoria($event)"
                    novalidate
                    class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6"
                  >
                    <div>
                      <h2 class="text-lg font-extrabold text-slate-900">Nueva categoría</h2>
                      <p class="mt-1 text-xs text-slate-500">Se usa para agrupar los productos.</p>
                    </div>
                    <div>
                      <label for="nombre_categoria" class="mb-2 block text-sm font-bold text-slate-700">
                        Nombre de la categoría *
                      </label>
                      <input
                        id="nombre_categoria"
                        class="{{ inputClass }}"
                        [formField]="categoriaForm.nombre_categoria"
                      />
                      @if (categoriaForm.nombre_categoria().touched() && categoriaForm.nombre_categoria().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of categoriaForm.nombre_categoria().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'categorias' ? 'Guardando…' : 'Guardar categoría' }}
                    </button>
                  </form>

                  <form
                    (submit)="guardarProducto($event)"
                    novalidate
                    class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6"
                  >
                    <div>
                      <h2 class="text-lg font-extrabold text-slate-900">Nuevo producto</h2>
                      <p class="mt-1 text-xs text-slate-500">Disponible luego en el registrar pedido.</p>
                    </div>
                    <div>
                      <label for="nombre_producto" class="mb-2 block text-sm font-bold text-slate-700">
                        Nombre del producto *
                      </label>
                      <input
                        id="nombre_producto"
                        class="{{ inputClass }}"
                        [formField]="productoForm.nombre_producto"
                      />
                      @if (productoForm.nombre_producto().touched() && productoForm.nombre_producto().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of productoForm.nombre_producto().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <div>
                      <label for="id_categoria" class="mb-2 block text-sm font-bold text-slate-700">
                        Categoría *
                      </label>
                      <select id="id_categoria" class="{{ inputClass }}" [formField]="productoForm.id_categoria">
                        <option value="" disabled>Selecciona una categoría</option>
                        @for (opcion of opcionesCategorias(); track opcion.id) {
                          <option [value]="opcion.id">{{ opcion.etiqueta }}</option>
                        }
                      </select>
                      @if (productoForm.id_categoria().touched() && productoForm.id_categoria().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of productoForm.id_categoria().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <div>
                      <label for="precio_unit" class="mb-2 block text-sm font-bold text-slate-700">
                        Precio unitario *
                      </label>
                      <input
                        id="precio_unit"
                        type="number"
                        min="0"
                        step="0.01"
                        class="{{ inputClass }}"
                        [formField]="productoForm.precio_unit"
                      />
                      @if (productoForm.precio_unit().touched() && productoForm.precio_unit().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of productoForm.precio_unit().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'productos' ? 'Guardando…' : 'Guardar producto' }}
                    </button>
                  </form>
                </div>

                <div>
                  <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Productos existentes</h3>
                  <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full min-w-[640px] text-left text-sm">
                      <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th class="px-5 py-3 font-bold">ID</th>
                          <th class="px-5 py-3 font-bold">Producto</th>
                          <th class="px-5 py-3 font-bold">Categoría</th>
                          <th class="px-5 py-3 font-bold">Precio unit.</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (producto of productos(); track producto.id_producto) {
                          <tr class="hover:bg-emerald-50/40">
                            <td class="px-5 py-3 font-bold text-slate-900">{{ producto.id_producto }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ producto.nombre_producto }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ nombreCategoria(producto.id_categoria) }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ producto.precio_unit }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="4" class="px-5 py-6 text-center text-slate-500">No hay productos registrados.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('clientes') {
              <div class="space-y-8">
                <form
                  (submit)="guardarCliente($event)"
                  novalidate
                  class="grid grid-cols-1 gap-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6 md:grid-cols-2"
                >
                  <div class="md:col-span-2">
                    <h2 class="text-lg font-extrabold text-slate-900">Nuevo cliente</h2>
                    <p class="mt-1 text-xs text-slate-500">Disponible luego en el registrar pedido.</p>
                  </div>
                  <div>
                    <label for="nombre_cliente" class="mb-2 block text-sm font-bold text-slate-700">
                      Nombre del cliente *
                    </label>
                    <input id="nombre_cliente" class="{{ inputClass }}" [formField]="clienteForm.nombre_cliente" />
                    @if (clienteForm.nombre_cliente().touched() && clienteForm.nombre_cliente().invalid()) {
                      <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                        @for (error of clienteForm.nombre_cliente().errors(); track error.kind) {
                          <span>{{ error.message }}</span>
                        }
                      </p>
                    }
                  </div>
                  <div>
                    <label for="pais" class="mb-2 block text-sm font-bold text-slate-700">País *</label>
                    <input id="pais" class="{{ inputClass }}" [formField]="clienteForm.pais" />
                    @if (clienteForm.pais().touched() && clienteForm.pais().invalid()) {
                      <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                        @for (error of clienteForm.pais().errors(); track error.kind) { <span>{{ error.message }}</span> }
                      </p>
                    }
                  </div>
                  <div class="md:col-span-2">
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'clientes' ? 'Guardando…' : 'Guardar cliente' }}
                    </button>
                  </div>
                </form>
                <div>
                  <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Clientes existentes</h3>
                  <div class="overflow-x-auto rounded-2xl border border-slate-100">
                    <table class="w-full min-w-[560px] text-left text-sm">
                      <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th class="px-5 py-3 font-bold">ID</th>
                          <th class="px-5 py-3 font-bold">Cliente</th>
                          <th class="px-5 py-3 font-bold">País</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        @for (cliente of clientes(); track cliente.id_cliente) {
                          <tr class="hover:bg-emerald-50/40">
                            <td class="px-5 py-3 font-bold text-slate-900">{{ cliente.id_cliente }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ cliente.nombre_cliente }}</td>
                            <td class="px-5 py-3 text-slate-600">{{ cliente.pais }}</td>
                          </tr>
                        } @empty {
                          <tr>
                            <td colspan="3" class="px-5 py-6 text-center text-slate-500">No hay clientes registrados.</td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            }

            @case ('programas') {
              <div class="space-y-8">
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <form
                    (submit)="guardarPrograma($event)"
                    novalidate
                    class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6"
                  >
                    <div>
                      <h2 class="text-lg font-extrabold text-slate-900">Nuevo programa social</h2>
                      <p class="mt-1 text-xs text-slate-500">Disponible luego en la entrega social.</p>
                    </div>
                    <div>
                      <label for="nombre_programa" class="mb-2 block text-sm font-bold text-slate-700">
                        Nombre del programa *
                      </label>
                      <input
                        id="nombre_programa"
                        class="{{ inputClass }}"
                        [formField]="programaForm.nombre_programa"
                      />
                      @if (programaForm.nombre_programa().touched() && programaForm.nombre_programa().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of programaForm.nombre_programa().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'programas' ? 'Guardando…' : 'Guardar programa' }}
                    </button>
                  </form>

                  <form
                    (submit)="guardarBeneficiario($event)"
                    novalidate
                    class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:p-6"
                  >
                    <div>
                      <h2 class="text-lg font-extrabold text-slate-900">Nuevo beneficiario</h2>
                      <p class="mt-1 text-xs text-slate-500">Disponible luego en la entrega social.</p>
                    </div>
                    <div>
                      <label for="nombre_beneficiario" class="mb-2 block text-sm font-bold text-slate-700">
                        Nombre del beneficiario *
                      </label>
                      <input
                        id="nombre_beneficiario"
                        class="{{ inputClass }}"
                        [formField]="beneficiarioForm.nombre_beneficiario"
                      />
                      @if (beneficiarioForm.nombre_beneficiario().touched() && beneficiarioForm.nombre_beneficiario().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of beneficiarioForm.nombre_beneficiario().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <div>
                      <label for="tipo_beneficiario" class="mb-2 block text-sm font-bold text-slate-700">
                        Tipo de beneficiario *
                      </label>
                      <input
                        id="tipo_beneficiario"
                        class="{{ inputClass }}"
                        placeholder="Ej. Familia, comunidad, productor"
                        [formField]="beneficiarioForm.tipo_beneficiario"
                      />
                      @if (beneficiarioForm.tipo_beneficiario().touched() && beneficiarioForm.tipo_beneficiario().invalid()) {
                        <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                          @for (error of beneficiarioForm.tipo_beneficiario().errors(); track error.kind) {
                            <span>{{ error.message }}</span>
                          }
                        </p>
                      }
                    </div>
                    <button
                      type="submit"
                      [disabled]="guardando() !== null"
                      class="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {{ guardando() === 'beneficiarios' ? 'Guardando…' : 'Guardar beneficiario' }}
                    </button>
                  </form>
                </div>

                <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div>
                    <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">Programas existentes</h3>
                    <div class="overflow-x-auto rounded-2xl border border-slate-100">
                      <table class="w-full min-w-[420px] text-left text-sm">
                        <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                          <tr>
                            <th class="px-5 py-3 font-bold">ID</th>
                            <th class="px-5 py-3 font-bold">Programa</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (programa of programas(); track programa.id_programa) {
                            <tr class="hover:bg-emerald-50/40">
                              <td class="px-5 py-3 font-bold text-slate-900">{{ programa.id_programa }}</td>
                              <td class="px-5 py-3 text-slate-600">{{ programa.nombre_programa }}</td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="2" class="px-5 py-6 text-center text-slate-500">
                                No hay programas registrados.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 class="mb-3 text-sm font-bold uppercase tracking-wider text-slate-500">
                      Beneficiarios existentes
                    </h3>
                    <div class="overflow-x-auto rounded-2xl border border-slate-100">
                      <table class="w-full min-w-[520px] text-left text-sm">
                        <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                          <tr>
                            <th class="px-5 py-3 font-bold">ID</th>
                            <th class="px-5 py-3 font-bold">Beneficiario</th>
                            <th class="px-5 py-3 font-bold">Tipo</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          @for (beneficiario of beneficiarios(); track beneficiario.id_beneficiario) {
                            <tr class="hover:bg-emerald-50/40">
                              <td class="px-5 py-3 font-bold text-slate-900">{{ beneficiario.id_beneficiario }}</td>
                              <td class="px-5 py-3 text-slate-600">{{ beneficiario.nombre_beneficiario }}</td>
                              <td class="px-5 py-3 text-slate-600">{{ beneficiario.tipo_beneficiario }}</td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="3" class="px-5 py-6 text-center text-slate-500">
                                No hay beneficiarios registrados.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </section>
  `,
})
export class CatalogosComponent implements OnInit {
  private readonly maestros = inject(MaestrosService);
  private readonly toast = inject(ToastService);
  readonly catalogos = inject(CatalogosService);

  readonly pestanas: ReadonlyArray<{ id: Pestana; etiqueta: string }> = [
    { id: 'lotes', etiqueta: 'Lotes' },
    { id: 'categorias', etiqueta: 'Categorías y productos' },
    { id: 'clientes', etiqueta: 'Clientes' },
    { id: 'programas', etiqueta: 'Programas y beneficiarios' },
  ];

  readonly pestana = signal<Pestana>('lotes');
  readonly guardando = signal<EntidadMaestro | null>(null);
  readonly cargandoDatos = signal(false);

  readonly lotes = signal<Lote[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly productos = signal<Producto[]>([]);
  readonly clientes = signal<Cliente[]>([]);
  readonly programas = signal<Programa[]>([]);
  readonly beneficiarios = signal<Beneficiario[]>([]);

  readonly opcionesFondos = computed(() => this.catalogos.opcionesDe('FUNDO', 'FUNDOS'));
  readonly opcionesCategorias = computed(() => this.catalogos.opcionesDe('CATEGORIA', 'CATEGORIAS'));
  readonly inputClass =
    'min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  private readonly modeloLote = signal<LoteFormModel>({ id_fundo: '', nombre_lote: '', hectareas: null });
  private readonly modeloCategoria = signal<CategoriaFormModel>({ nombre_categoria: '' });
  private readonly modeloProducto = signal<ProductoFormModel>({
    nombre_producto: '',
    id_categoria: '',
    precio_unit: null,
  });
  private readonly modeloCliente = signal<ClienteFormModel>({ nombre_cliente: '', pais: '' });
  private readonly modeloPrograma = signal<ProgramaFormModel>({ nombre_programa: '' });
  private readonly modeloBeneficiario = signal<BeneficiarioFormModel>({
    nombre_beneficiario: '',
    tipo_beneficiario: '',
  });

  readonly loteForm = form(this.modeloLote, (path) => {
    required(path.id_fundo, { message: 'El fundo es obligatorio' });
    required(path.nombre_lote, { message: 'El nombre del lote es obligatorio' });
    maxLength(path.nombre_lote, 100, { message: 'Máximo 100 caracteres' });
    required(path.hectareas, { message: 'Las hectáreas son obligatorias' });
    min(path.hectareas, 0.01, { message: 'Las hectáreas deben ser mayores que cero' });
  });

  readonly categoriaForm = form(this.modeloCategoria, (path) => {
    required(path.nombre_categoria, { message: 'El nombre de la categoría es obligatorio' });
    maxLength(path.nombre_categoria, 100, { message: 'Máximo 100 caracteres' });
  });

  readonly productoForm = form(this.modeloProducto, (path) => {
    required(path.nombre_producto, { message: 'El nombre del producto es obligatorio' });
    maxLength(path.nombre_producto, 100, { message: 'Máximo 100 caracteres' });
    required(path.id_categoria, { message: 'La categoría es obligatoria' });
    required(path.precio_unit, { message: 'El precio unitario es obligatorio' });
    min(path.precio_unit, 0, { message: 'El precio no puede ser negativo' });
  });

  readonly clienteForm = form(this.modeloCliente, (path) => {
    required(path.nombre_cliente, { message: 'El nombre del cliente es obligatorio' });
    maxLength(path.nombre_cliente, 100, { message: 'Máximo 100 caracteres' });
    required(path.pais, { message: 'El país es obligatorio' });
    maxLength(path.pais, 100, { message: 'Máximo 100 caracteres' });
  });

  readonly programaForm = form(this.modeloPrograma, (path) => {
    required(path.nombre_programa, { message: 'El nombre del programa es obligatorio' });
    maxLength(path.nombre_programa, 100, { message: 'Máximo 100 caracteres' });
  });

  readonly beneficiarioForm = form(this.modeloBeneficiario, (path) => {
    required(path.nombre_beneficiario, { message: 'El nombre del beneficiario es obligatorio' });
    maxLength(path.nombre_beneficiario, 100, { message: 'Máximo 100 caracteres' });
    required(path.tipo_beneficiario, { message: 'El tipo de beneficiario es obligatorio' });
    maxLength(path.tipo_beneficiario, 100, { message: 'Máximo 100 caracteres' });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  seleccionarPestana(pestana: Pestana): void {
    this.pestana.set(pestana);
  }

  nombreCategoria(id: string): string {
    return (
      this.categorias().find((categoria) => categoria.id_categoria === id)?.nombre_categoria ??
      this.catalogos.opcionesDe('CATEGORIA', 'CATEGORIAS').find((opcion) => opcion.id === id)?.etiqueta ??
      id
    );
  }

  guardarLote(event: Event): void {
    event.preventDefault();
    this.loteForm().markAsTouched();
    if (this.loteForm().invalid()) {
      return;
    }
    const value = this.modeloLote();
    this.guardar(
      'lotes',
      {
        id_fundo: value.id_fundo,
        nombre_lote: value.nombre_lote.trim(),
        hectareas: value.hectareas as number,
      },
      () => this.modeloLote.set({ id_fundo: '', nombre_lote: '', hectareas: null }),
    );
  }

  guardarCategoria(event: Event): void {
    event.preventDefault();
    this.categoriaForm().markAsTouched();
    if (this.categoriaForm().invalid()) {
      return;
    }
    const value = this.modeloCategoria();
    this.guardar(
      'categorias',
      { nombre_categoria: value.nombre_categoria.trim() },
      () => this.modeloCategoria.set({ nombre_categoria: '' }),
    );
  }

  guardarProducto(event: Event): void {
    event.preventDefault();
    this.productoForm().markAsTouched();
    if (this.productoForm().invalid()) {
      return;
    }
    const value = this.modeloProducto();
    this.guardar(
      'productos',
      {
        nombre_producto: value.nombre_producto.trim(),
        id_categoria: value.id_categoria,
        precio_unit: value.precio_unit as number,
      },
      () => this.modeloProducto.set({ nombre_producto: '', id_categoria: '', precio_unit: null }),
    );
  }

  guardarCliente(event: Event): void {
    event.preventDefault();
    this.clienteForm().markAsTouched();
    if (this.clienteForm().invalid()) {
      return;
    }
    const value = this.modeloCliente();
    this.guardar(
      'clientes',
      { nombre_cliente: value.nombre_cliente.trim(), pais: value.pais.trim() },
      () => this.modeloCliente.set({ nombre_cliente: '', pais: '' }),
    );
  }

  guardarPrograma(event: Event): void {
    event.preventDefault();
    this.programaForm().markAsTouched();
    if (this.programaForm().invalid()) {
      return;
    }
    const value = this.modeloPrograma();
    this.guardar(
      'programas',
      { nombre_programa: value.nombre_programa.trim() },
      () => this.modeloPrograma.set({ nombre_programa: '' }),
    );
  }

  guardarBeneficiario(event: Event): void {
    event.preventDefault();
    this.beneficiarioForm().markAsTouched();
    if (this.beneficiarioForm().invalid()) {
      return;
    }
    const value = this.modeloBeneficiario();
    this.guardar(
      'beneficiarios',
      {
        nombre_beneficiario: value.nombre_beneficiario.trim(),
        tipo_beneficiario: value.tipo_beneficiario.trim(),
      },
      () => this.modeloBeneficiario.set({ nombre_beneficiario: '', tipo_beneficiario: '' }),
    );
  }

  private cargarDatos(): void {
    this.catalogos.recargarOpciones().subscribe();
    this.cargandoDatos.set(true);
    forkJoin({
      lotes: this.maestros.listar('lotes'),
      categorias: this.maestros.listar('categorias'),
      productos: this.maestros.listar('productos'),
      clientes: this.maestros.listar('clientes'),
      programas: this.maestros.listar('programas'),
      beneficiarios: this.maestros.listar('beneficiarios'),
    })
      .pipe(finalize(() => this.cargandoDatos.set(false)))
      .subscribe({
        next: (datos) => {
          this.lotes.set(datos.lotes);
          this.categorias.set(datos.categorias);
          this.productos.set(datos.productos);
          this.clientes.set(datos.clientes);
          this.programas.set(datos.programas);
          this.beneficiarios.set(datos.beneficiarios);
        },
      });
  }

  private guardar<K extends EntidadMaestro>(
    entidad: K,
    body: MaestroCreatePorEntidad[K],
    alGuardar: (respuesta: MaestroPorEntidad[K]) => void,
  ): void {
    if (this.guardando() !== null) {
      return;
    }
    this.guardando.set(entidad);
    this.maestros
      .crear(entidad, body)
      .pipe(finalize(() => this.guardando.set(null)))
      .subscribe({
        next: (respuesta) => {
          this.toast.success(`Registro de ${ETIQUETAS[entidad]} guardado correctamente`);
          alGuardar(respuesta);
          this.cargarDatos();
        },
      });
  }
}
