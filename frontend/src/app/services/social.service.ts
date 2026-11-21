import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type { EntregaCreate, EntregaResponse } from '../models/social.model';

@Injectable({ providedIn: 'root' })
export class SocialService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/social`;

  /** POST /api/v1/social/entregas — 201, roles ADMIN | RESP_SOCIAL. */
  registrarEntrega(body: EntregaCreate) {
    return this.http.post<EntregaResponse>(`${this.base}/entregas`, body);
  }
}
