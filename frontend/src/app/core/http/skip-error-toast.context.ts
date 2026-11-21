import { HttpContextToken } from '@angular/common/http';

/**
 * Permite que una petición puntual suprima el toast genérico del interceptor
 * cuando la vista ya muestra un mensaje de error más concreto.
 */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);
