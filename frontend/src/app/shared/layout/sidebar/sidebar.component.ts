import { Component, computed, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { isUserRole, ROLES } from '../../../models/auth.model';

interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly iconPath: string;
  readonly roles: readonly string[] | null;
}

/** Cada ruta refleja únicamente un endpoint realmente expuesto por el backend. */
const NAV_ITEMS: readonly NavItem[] = [
  {
    label: 'Inicio',
    path: '/inicio',
    iconPath: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M9 21v-6h6v6',
    roles: null,
  },
  {
    label: 'Registrar siembra',
    path: '/produccion/siembras/nueva',
    iconPath: 'M12 21c0-6 3-9 9-9 0 6-3 9-9 9Zm0 0C12 15 9 12 3 12c0 6 3 9 9 9Zm0-9V3',
    roles: [ROLES.ADMIN, ROLES.JEFE_PRODUCCION],
  },
  {
    label: 'Registrar cosecha',
    path: '/produccion/cosechas/registrar',
    iconPath:
      'M12 21V9m0 0c0-3 2-5 5-5 0 3-2 5-5 5Zm0 0c0-3-2-5-5-5 0 3 2 5 5 5Zm0 6c0-3 2-5 5-5 0 3-2 5-5 5Zm0 0c0-3-2-5-5-5 0 3 2 5 5 5Z',
    roles: [ROLES.ADMIN, ROLES.JEFE_PRODUCCION],
  },
  {
    label: 'Registrar pedido',
    path: '/comercial/pedidos/nuevo',
    iconPath: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6',
    roles: [ROLES.ADMIN, ROLES.JEFE_COMERCIAL],
  },
  {
    label: 'Trazabilidad por pedido',
    path: '/trazabilidad',
    iconPath: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.35-4.35',
    roles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.JEFE_COMERCIAL],
  },
  {
    label: 'Entrega social',
    path: '/social/entregas/nueva',
    iconPath:
      'M12 21s-7-4.5-9-9C1 8 4 5 7 6c2 .6 3.5 2 5 4 1.5-2 3-3.4 5-4 3-1 6 2 4 6-2 4.5-9 9-9 9Z',
    roles: [ROLES.ADMIN, ROLES.RESP_SOCIAL],
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="flex h-full flex-col overflow-y-auto border-r border-slate-200 bg-white">
      <div class="border-b border-slate-100 px-5 py-6">
        <div class="flex items-center gap-3">
          <div
            class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25"
          >
            <svg
              class="h-6 w-6"
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
          <div class="min-w-0">
            <p class="truncate text-base font-extrabold tracking-tight text-slate-900">Agroindustrial</p>
            <p class="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">ODS 2</p>
          </div>
        </div>
      </div>

      <div class="flex-1 px-3 py-6">
        <p class="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Operaciones</p>
        <div class="space-y-1">
          @for (item of visibleItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive
              #rla="routerLinkActive"
              class="group flex min-h-[48px] items-center gap-3 rounded-r-xl border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600"
              [class.bg-emerald-50]="rla.isActive"
              [class.text-emerald-700]="rla.isActive"
              [class.border-emerald-500]="rla.isActive"
              (click)="navegar.emit()"
            >
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors duration-200 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                [class.bg-emerald-100]="rla.isActive"
                [class.text-emerald-600]="rla.isActive"
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
                  <path [attr.d]="item.iconPath" />
                </svg>
              </span>
              <span class="truncate">{{ item.label }}</span>
            </a>
          } @empty {
            <p class="px-3 py-2 text-sm text-slate-500">No hay operaciones para tu rol.</p>
          }
        </div>
      </div>

      <div class="border-t border-slate-100 p-4">
        <div
          class="rounded-2xl bg-gradient-to-br bg-linear-to-br from-emerald-50 to-white p-4 ring-1 ring-emerald-100"
        >
          <p class="text-xs font-bold text-emerald-800">ODS 2 · Hambre cero</p>
          <p class="mt-1 text-[11px] leading-relaxed text-slate-500">
            Producción y distribución responsable.
          </p>
        </div>
      </div>
    </nav>
  `,
})
export class SidebarComponent {
  readonly open = input.required<boolean>();
  readonly rol = input<string | null>(null);
  readonly navegar = output<void>();

  readonly visibleItems = computed(() =>
    NAV_ITEMS.filter((item) => {
      if (!item.roles) {
        return true;
      }
      const rol = this.rol();
      return isUserRole(rol) && item.roles.includes(rol);
    }),
  );
}
