import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type {
  EntidadMaestro,
  MaestroCreatePorEntidad,
  MaestroPorEntidad,
} from '../models/maestros.model';

/** GET/POST /api/v1/maestros/{lotes|categorias|productos|clientes|programas|beneficiarios}. */
@Injectable({ providedIn: 'root' })
export class MaestrosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/maestros`;

  listar<K extends EntidadMaestro>(entidad: K) {
    return this.http.get<MaestroPorEntidad[K][]>(`${this.base}/${entidad}`);
  }

  crear<K extends EntidadMaestro>(entidad: K, body: MaestroCreatePorEntidad[K]) {
    return this.http.post<MaestroPorEntidad[K]>(`${this.base}/${entidad}`, body);
  }
}
