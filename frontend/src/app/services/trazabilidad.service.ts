import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { TrazabilidadFila } from '../models/trazabilidad.model';

@Injectable({ providedIn: 'root' })
export class TrazabilidadService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/trazabilidad`;

  /** GET /api/v1/trazabilidad/pedido/{id_pedido} — roles ADMIN | GERENTE | JEFE_COMERCIAL. */
  porPedido(idPedido: string) {
    return this.http.get<TrazabilidadFila[]>(
      `${this.base}/pedido/${encodeURIComponent(idPedido)}`,
    );
  }
}
