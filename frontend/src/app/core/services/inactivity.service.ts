import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, effect, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ToastService } from './toast.service';

const INACTIVITY_MS = 10 * 60 * 1000; // RNF-08
const EVENTS = ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'] as const;

/** Cierra la sesión después de 10 minutos sin actividad del usuario. */
@Injectable({ providedIn: 'root' })
export class InactivityService {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    for (const event of EVENTS) {
      this.document.addEventListener(event, this.reset, { passive: true });
    }
    this.destroyRef.onDestroy(() => {
      for (const event of EVENTS) {
        this.document.removeEventListener(event, this.reset);
      }
      this.clear();
    });

    effect(() => {
      if (this.auth.isAuthenticated()) {
        this.reset();
      } else {
        this.clear();
      }
    });
  }

  private readonly reset = (): void => {
    this.clear();
    this.timer = setTimeout(() => {
      if (this.auth.isAuthenticated()) {
        this.auth.logout();
        this.toast.info('Sesión cerrada por inactividad (10 minutos)');
      }
    }, INACTIVITY_MS);
  };

  private clear(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
