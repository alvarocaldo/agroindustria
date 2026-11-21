import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import type { BackendError, BackendValidationError } from '../../models/auth.model';
import { AuthService } from '../auth/auth.service';
import { SKIP_ERROR_TOAST } from '../http/skip-error-toast.context';
import { ToastService } from '../services/toast.service';

function extractMessage(error: HttpErrorResponse): string {
  const body = error.error as BackendError | string | null;
  if (typeof body === 'string' && body.length > 0) {
    return body;
  }
  const detail = body && typeof body === 'object' ? body.detail : undefined;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail
      .map((item: BackendValidationError) => {
        const location = Array.isArray(item.loc) ? item.loc.join('.') : 'campo';
        return `${location}: ${item.msg}`;
      })
      .join('; ');
  }
  return `Error ${error.status}: ${error.statusText}`;
}

/** Muestra el `detail` exacto devuelto por FastAPI (400/401/403/404/422/500). */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const message = extractMessage(error);
      if (!request.context.get(SKIP_ERROR_TOAST)) {
        toast.error(message);
      }

      if (error.status === 401 && auth.isAuthenticated()) {
        auth.logout(false);
        void router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
};
