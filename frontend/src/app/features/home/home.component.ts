import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { ROLES_LABEL, ROLES, isUserRole } from '../../models/auth.model';
import type { SiembraResponse } from '../../models/produccion.model';
import { ProduccionService } from '../../services/produccion.service';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent],
  template: `
    <section class="space-y-8">
      <div
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br bg-linear-to-br from-emerald-600 via-emerald-700 to-green-900 p-6 text-white shadow-xl shadow-emerald-900/20 sm:p-8"
      >
        <div class="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-emerald-300/20 blur-3xl"></div>
        <div class="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-green-950/40 blur-3xl"></div>
        <svg class="absolute inset-0 h-full w-full opacity-10" aria-hidden="true">
          <defs>
            <pattern id="home-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M34 0H0v34" fill="none" stroke="white" stroke-width="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-grid)" />
        </svg>

        <div class="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-emerald-200">Panel de operaciones</p>
            <h1 class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Hola, {{ nombre() }}</h1>
            <p class="mt-2 text-sm text-emerald-50/85">{{ rolLabel() }} · Gestión agroindustrial integrada</p>
          </div>
          <div
            class="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/20 backdrop-blur-md"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25"
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
                <path d="M12 21c0-6 3-9 9-9 0 6-3 9-9 9Zm0 0C12 15 9 12 3 12c0 6 3 9 9 9Zm0-9V3" />
              </svg>
            </div>
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200">ODS 2</p>
              <p class="text-sm font-semibold">Hambre cero</p>
            </div>
          </div>
        </div>
      </div>

      @if (operaciones().length > 0) {
        <div>
          <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-lg font-extrabold tracking-tight text-slate-900">Accesos rápidos</h2>
              <p class="mt-1 text-sm text-slate-500">Operaciones habilitadas para tu rol</p>
            </div>
            <span
              class="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100"
            >
              {{ operaciones().length }} disponibles
            </span>
          </div>

          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            @for (operacion of operaciones(); track operacion.path) {
              <a
                [routerLink]="operacion.path"
                class="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/70"
              >
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br bg-linear-to-br from-emerald-100 to-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition-all duration-300 group-hover:scale-110 group-hover:from-emerald-500 group-hover:to-emerald-600 group-hover:text-white group-hover:ring-emerald-300"
                >
                  <svg
                    class="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path [attr.d]="operacion.iconPath" />
                  </svg>
                </div>
                <p class="mt-5 text-base font-bold text-slate-900">{{ operacion.label }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ operacion.detalle }}</p>
                <span
                  class="mt-5 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  Abrir operación
                  <svg
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M5 12h14m-6-6 6 6-6 6" />
                  </svg>
                </span>
              </a>
            }
          </div>
        </div>
      }

      @if (puedeVerSiembras()) {
        <section class="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-gray-200/50">
          <div
            class="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 class="text-lg font-extrabold tracking-tight text-slate-900">Últimas siembras registradas</h2>
              <p class="mt-1 text-xs text-slate-500">GET /api/v1/produccion/siembras · solo lectura</p>
            </div>
            <span
              class="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
            >
              {{ siembras().length }} registro(s)
            </span>
          </div>

          @if (cargandoSiembras()) {
            <div class="space-y-3 p-6">
              <div class="h-4 w-1/4 animate-pulse rounded-full bg-slate-100"></div>
              @for (fila of [1, 2, 3]; track fila) {
                <div class="h-10 animate-pulse rounded-xl bg-slate-50"></div>
              }
            </div>
          } @else if (errorSiembras()) {
            <div class="m-6 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
              No se pudo cargar el listado de siembras. Intenta recargar la página.
            </div>
          } @else if (siembras().length === 0) {
            <div
              class="m-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500"
            >
              Aún no hay siembras registradas.
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="w-full min-w-[900px] text-left text-sm">
                <thead class="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th class="px-6 py-3.5 font-bold">ID siembra</th>
                    <th class="px-6 py-3.5 font-bold">Lote</th>
                    <th class="px-6 py-3.5 font-bold">Variedad</th>
                    <th class="px-6 py-3.5 font-bold">Campaña</th>
                    <th class="px-6 py-3.5 font-bold">Siembra</th>
                    <th class="px-6 py-3.5 font-bold">Cosecha</th>
                    <th class="px-6 py-3.5 font-bold">Kg cosechados</th>
                    <th class="px-6 py-3.5 font-bold">Estado</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  @for (siembra of siembras(); track siembra.ID_Siembra) {
                    <tr class="transition-colors duration-200 hover:bg-gray-50">
                      <td class="px-6 py-4 font-bold text-slate-900">{{ siembra.ID_Siembra }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Lote }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Variedad }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.ID_Campana }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.Fecha_Siembra }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.Fecha_Cosecha ?? '—' }}</td>
                      <td class="px-6 py-4 text-slate-600">{{ siembra.Kg_Cosechados ?? '—' }}</td>
                      <td class="px-6 py-4"><app-status-badge [activo]="siembra.activo" /></td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>
      }

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
          <span class="font-bold">Alcance actual de la API.</span>
          El listado de siembras ya está disponible; el resto de operaciones son registros puntuales y
          trazabilidad por pedido. No se muestran métricas estimadas.
        </p>
      </div>
    </section>
  `,
})
export class HomeComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly service = inject(ProduccionService);

  readonly siembras = signal<SiembraResponse[]>([]);
  readonly cargandoSiembras = signal(true);
  readonly errorSiembras = signal(false);

  readonly nombre = () =>
    this.auth.currentUser()?.nombre_completo ?? String(this.auth.currentUser()?.ID_Usuario ?? '');

  readonly rolLabel = () => {
    const rol = this.auth.role();
    return rol && isUserRole(rol) ? ROLES_LABEL[rol] : '';
  };

  readonly puedeVerSiembras = () => {
    const rol = this.auth.role();
    return rol === ROLES.ADMIN || rol === ROLES.JEFE_PRODUCCION;
  };

  readonly operaciones = () => {
    const rol = this.auth.role();
    const items = [
      {
        label: 'Registrar siembra',
        path: '/produccion/siembras/nueva',
        iconPath: 'M12 21c0-6 3-9 9-9 0 6-3 9-9 9Zm0 0C12 15 9 12 3 12c0 6 3 9 9 9Zm0-9V3',
        detalle: 'POST /produccion/siembras',
        roles: ['ADMIN', 'JEFE_PRODUCCION'],
      },
      {
        label: 'Registrar cosecha',
        path: '/produccion/cosechas/registrar',
        iconPath:
          'M12 21V9m0 0c0-3 2-5 5-5 0 3-2 5-5 5Zm0 0c0-3-2-5-5-5 0 3 2 5 5 5Zm0 6c0-3 2-5 5-5 0 3-2 5-5 5Zm0 0c0-3-2-5-5-5 0 3 2 5 5 5Z',
        detalle: 'PATCH /produccion/siembras/{id}/cosecha',
        roles: ['ADMIN', 'JEFE_PRODUCCION'],
      },
      {
        label: 'Registrar pedido',
        path: '/comercial/pedidos/nuevo',
        iconPath: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6',
        detalle: 'POST /comercial/pedidos',
        roles: ['ADMIN', 'JEFE_COMERCIAL'],
      },
      {
        label: 'Trazabilidad',
        path: '/trazabilidad',
        iconPath: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
        detalle: 'GET /trazabilidad/pedido/{id}',
        roles: ['ADMIN', 'GERENTE', 'JEFE_COMERCIAL'],
      },
      {
        label: 'Entrega social',
        path: '/social/entregas/nueva',
        iconPath:
          'M12 21s-7-4.5-9-9C1 8 4 5 7 6c2 .6 3.5 2 5 4 1.5-2 3-3.4 5-4 3-1 6 2 4 6-2 4.5-9 9-9 9Z',
        detalle: 'POST /social/entregas',
        roles: ['ADMIN', 'RESP_SOCIAL'],
      },
    ];
    return items.filter((item) => !!rol && item.roles.includes(rol));
  };

  ngOnInit(): void {
    if (!this.puedeVerSiembras()) {
      this.cargandoSiembras.set(false);
      return;
    }

    this.service
      .listarSiembras()
      .pipe(finalize(() => this.cargandoSiembras.set(false)))
      .subscribe({
        next: (filas) => this.siembras.set(filas),
        error: () => this.errorSiembras.set(true),
      });
  }
}
