import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { DniResponse } from '../../models/external.model';
import { SKIP_ERROR_TOAST } from '../http/skip-error-toast.context';

@Injectable({ providedIn: 'root' })
export class ExternalService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/external`;

  /** GET /api/v1/external/dni/{dni} — consulta a RENIEC, roles ADMIN | RESP_SOCIAL. */
  consultarDni(dni: string) {
    return this.http.get<DniResponse>(`${this.base}/dni/${dni}`, {
      // La vista muestra su propio toast: "DNI no encontrado o error de conexión".
      context: new HttpContext().set(SKIP_ERROR_TOAST, true),
    });
  }
}
