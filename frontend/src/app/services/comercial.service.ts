import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { PedidoCreate, PedidoResponse } from '../models/comercial.model';

@Injectable({ providedIn: 'root' })
export class ComercialService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/comercial`;

  /** POST /api/v1/comercial/pedidos — 201, roles ADMIN | JEFE_COMERCIAL. */
  registrarPedido(body: PedidoCreate) {
    return this.http.post<PedidoResponse>(`${this.base}/pedidos`, body);
  }
}
