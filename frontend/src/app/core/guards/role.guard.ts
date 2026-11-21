import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../services/toast.service';

/** Leer `data['roles']` con corchetes: noPropertyAccessFromIndexSignature está activo. */
export const roleGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const allowed = route.data['roles'] as string[] | undefined;

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  if (!allowed?.length || auth.hasAnyRole(allowed)) {
    return true;
  }

  toast.error('No tiene permisos para acceder a este recurso');
  return router.createUrlTree(['/inicio']);
};
