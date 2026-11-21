import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { JwtPayload, LoginCredentials, Token, UserRole } from '../../models/auth.model';
import { isUserRole } from '../../models/auth.model';

const TOKEN_KEY = 'agroindustrial_ods2_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _token = signal<string | null>(this.readToken());
  readonly token = this._token.asReadonly();

  readonly currentUser = computed<JwtPayload | null>(() => this.decode(this._token()));
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly role = computed<UserRole | null>(() => {
    const rol = this.currentUser()?.rol;
    return isUserRole(rol) ? rol : null;
  });

  login(credentials: LoginCredentials) {
    const body = new URLSearchParams();
    body.set('username', credentials.username);
    body.set('password', credentials.password);

    return this.http
      .post<Token>(`${environment.apiUrl}/auth/login`, body.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }),
      })
      .pipe(tap((token) => this.setToken(token.access_token)));
  }

  hasAnyRole(allowed: readonly string[]): boolean {
    const rol = this.role();
    return rol !== null && allowed.includes(rol);
  }

  logout(navigate = true): void {
    this._token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      this.document.defaultView?.localStorage.removeItem(TOKEN_KEY);
    }
    if (navigate) {
      void this.router.navigate(['/login']);
    }
  }

  private setToken(token: string): void {
    this._token.set(token);
    if (isPlatformBrowser(this.platformId)) {
      this.document.defaultView?.localStorage.setItem(TOKEN_KEY, token);
    }
  }

  private readToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }
    return this.document.defaultView?.localStorage.getItem(TOKEN_KEY) ?? null;
  }

  private decode(token: string | null): JwtPayload | null {
    if (!token) {
      return null;
    }
    try {
      const parts = token.split('.');
      const encoded = parts[1];
      if (!encoded) {
        return null;
      }
      const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded)) as Partial<JwtPayload>;
      if (
        typeof payload.ID_Usuario !== 'number' ||
        typeof payload.rol !== 'string' ||
        typeof payload.exp !== 'number'
      ) {
        return null;
      }
      if (payload.exp * 1000 <= Date.now()) {
        return null;
      }
      return payload as JwtPayload;
    } catch {
      return null;
    }
  }
}
