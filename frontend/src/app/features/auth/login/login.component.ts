import { Component, inject, signal } from '@angular/core';
import { FormField, form, required, maxLength } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import type { LoginCredentials } from '../../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  template: `
    <div class="flex min-h-screen bg-white">
      <div
        class="relative hidden w-1/2 overflow-hidden bg-gradient-to-br bg-linear-to-br from-emerald-500 via-emerald-700 to-green-900 lg:flex lg:flex-col lg:justify-between"
      >
        <svg class="absolute inset-0 h-full w-full opacity-20" aria-hidden="true">
          <defs>
            <pattern id="login-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-dots)" />
        </svg>
        <div class="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl"></div>
        <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-green-950/40 blur-3xl"></div>

        <div class="relative z-10 flex items-center gap-3 px-10 py-9 xl:px-14">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md"
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
          <div>
            <p class="text-sm font-bold tracking-wide text-white">Agroindustrial</p>
            <p class="text-xs font-medium uppercase tracking-[0.3em] text-emerald-200">ODS 2</p>
          </div>
        </div>

        <div class="relative z-10 max-w-xl px-10 pb-16 xl:px-14 xl:pb-24">
          <p class="text-xs font-bold uppercase tracking-[0.35em] text-emerald-200">Agroindustrial ODS 2</p>
          <h2 class="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white xl:text-5xl">
            Alimentar el presente,<br />cultivar el futuro.
          </h2>
          <p class="mt-6 max-w-md text-base leading-relaxed text-emerald-50/85">
            Una plataforma para coordinar siembras, cosechas, pedidos y entregas sociales con trazabilidad
            de punta a punta.
          </p>
          <div class="mt-9 flex flex-wrap gap-3">
            <span class="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              🌱 Producción
            </span>
            <span class="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              🧾 Comercial
            </span>
            <span class="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              🤝 Impacto social
            </span>
          </div>
        </div>
      </div>

      <div class="flex w-full flex-col justify-center bg-white px-5 py-10 sm:px-10 lg:w-1/2 xl:px-20">
        <div class="mx-auto w-full max-w-md">
          <div class="mb-8 flex items-center gap-3 lg:hidden">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br bg-linear-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/30"
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
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Agroindustrial</p>
              <p class="text-sm font-semibold text-slate-700">ODS 2 · Hambre cero</p>
            </div>
          </div>

          <div class="mb-7">
            <p class="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Bienvenido de nuevo</p>
            <h1 class="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Iniciar sesión</h1>
            <p class="mt-2 text-sm text-slate-500">Ingresa con las credenciales del backend</p>
          </div>

          <form
            (submit)="onSubmit($event)"
            novalidate
            class="rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-emerald-200/50 sm:p-8"
          >
            <div>
              <label for="username" class="mb-2 block text-sm font-bold text-slate-700">Usuario</label>
              <div class="relative">
                <svg
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                </svg>
                <input
                  id="username"
                  type="text"
                  autocomplete="username"
                  placeholder="Nombre de usuario"
                  class="{{ inputClass }}"
                  [formField]="loginForm.username"
                />
              </div>
              @if (loginForm.username().touched() && loginForm.username().invalid()) {
                <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                  @for (error of loginForm.username().errors(); track error.kind) {
                    <span>{{ error.message }}</span>
                  }
                </p>
              }
            </div>

            <div class="mt-5">
              <label for="password" class="mb-2 block text-sm font-bold text-slate-700">Contraseña</label>
              <div class="relative">
                <svg
                  class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5V10Zm7 4v3" />
                </svg>
                <input
                  id="password"
                  type="password"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="{{ inputClass }}"
                  [formField]="loginForm.password"
                />
              </div>
              @if (loginForm.password().touched() && loginForm.password().invalid()) {
                <p class="mt-2 text-xs font-medium text-red-600" role="alert">
                  @for (error of loginForm.password().errors(); track error.kind) {
                    <span>{{ error.message }}</span>
                  }
                </p>
              }
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="group mt-7 inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r bg-linear-to-r from-emerald-500 to-emerald-700 px-5 font-bold text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:from-emerald-400 hover:to-emerald-600 hover:shadow-xl hover:shadow-emerald-400/40 disabled:translate-y-0 disabled:opacity-60"
            >
              {{ loading() ? 'Ingresando…' : 'Ingresar al sistema' }}
              <svg
                class="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
          </form>

          <p class="mt-7 text-center text-xs text-slate-400">© 2026 Agroindustrial ODS 2 · Gestión integrada</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  private readonly returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/inicio';

  readonly inputClass =
    'min-h-[50px] w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all duration-200 hover:border-emerald-300 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40';

  private readonly model = signal<LoginCredentials>({ username: '', password: '' });

  readonly loginForm = form(this.model, (path) => {
    required(path.username, { message: 'El usuario es obligatorio' });
    maxLength(path.username, 100, { message: 'El usuario no puede superar 100 caracteres' });
    required(path.password, { message: 'La contraseña es obligatoria' });
    maxLength(path.password, 100, { message: 'La contraseña no puede superar 100 caracteres' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.loginForm().markAsTouched();
    if (this.loginForm().invalid()) {
      return;
    }

    this.loading.set(true);
    this.auth
      .login(this.model())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl(this.returnUrl);
        },
      });
  }
}
