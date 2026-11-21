import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { InactivityService } from '../../../core/services/inactivity.service';
import { ROLES_LABEL, isUserRole } from '../../../models/auth.model';
import { ToastHostComponent } from '../../ui/toast/toast.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastHostComponent],
  template: `
    <div class="min-h-screen bg-slate-50/80">
      @if (isMobileMenuOpen()) {
        <div
          class="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          (click)="cerrarMenu()"
        ></div>
      }

      <aside
        class="fixed inset-y-0 left-0 z-50 w-72 transform shadow-2xl shadow-slate-900/10 transition-transform duration-300 ease-out lg:translate-x-0"
        [class.translate-x-0]="isMobileMenuOpen()"
        [class.-translate-x-full]="!isMobileMenuOpen()"
      >
        <app-sidebar [open]="true" [rol]="auth.role()" (navegar)="cerrarMenu()" />
      </aside>

      <div class="flex min-h-screen flex-col lg:pl-72">
        <header
          class="sticky top-0 z-30 flex min-h-[68px] items-center gap-3 border-b border-white/60 bg-white/80 px-4 shadow-sm shadow-slate-200/50 backdrop-blur-md sm:px-6"
        >
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 lg:hidden"
            (click)="toggleMenu()"
            aria-label="Abrir menú"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div class="hidden h-9 w-px bg-slate-200 sm:block"></div>

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-900 sm:text-base">
              Sistema Web de Gestión Agroindustrial
            </p>
            <p class="hidden truncate text-xs text-slate-500 sm:block">
              {{ nombreUsuario() }} · {{ etiquetaRol() }}
            </p>
          </div>

          <div
            class="hidden items-center gap-3 rounded-2xl bg-slate-50/80 py-1.5 pl-1.5 pr-3 ring-1 ring-slate-200/70 sm:flex"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br bg-linear-to-br from-emerald-500 to-emerald-700 text-xs font-extrabold text-white shadow-md shadow-emerald-500/30"
            >
              {{ iniciales() }}
            </div>
            <div class="min-w-0 text-left">
              <p class="max-w-[140px] truncate text-xs font-bold text-slate-800">{{ nombreUsuario() }}</p>
              <p class="truncate text-[11px] font-semibold text-emerald-600">{{ etiquetaRol() }}</p>
            </div>
          </div>

          <div
            class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br bg-linear-to-br from-emerald-500 to-emerald-700 text-xs font-extrabold text-white shadow-md shadow-emerald-500/30 sm:hidden"
          >
            {{ iniciales() }}
          </div>

          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-red-50 hover:text-red-600"
            (click)="salir()"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
            </svg>
          </button>
        </header>

        <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <router-outlet />
        </main>
      </div>

      <app-toast-host />
    </div>
  `,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly inactivity = inject(InactivityService);

  readonly isMobileMenuOpen = signal(false);

  readonly nombreUsuario = () =>
    this.auth.currentUser()?.nombre_completo ?? this.auth.currentUser()?.ID_Usuario?.toString() ?? '';

  readonly etiquetaRol = () => {
    const rol = this.auth.role();
    return rol && isUserRole(rol) ? ROLES_LABEL[rol] : '';
  };

  readonly iniciales = () => {
    const usuario = this.auth.currentUser();
    const partes = (usuario?.nombre_completo ?? '').trim().split(/\s+/).filter(Boolean);
    const primera = partes[0]?.charAt(0) ?? '';
    const ultima = partes.length > 1 ? (partes[partes.length - 1]?.charAt(0) ?? '') : '';
    return (primera + ultima).toUpperCase() || (usuario?.ID_Usuario?.toString() ?? '?').slice(0, 2).toUpperCase();
  };

  toggleMenu(): void {
    this.isMobileMenuOpen.update((value) => !value);
  }

  cerrarMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  salir(): void {
    this.auth.logout();
  }
}
