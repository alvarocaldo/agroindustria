import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import type {
  CosechaResponse,
  CosechaUpdate,
  SiembraCreate,
  SiembraResponse,
} from '../models/produccion.model';

@Injectable({ providedIn: 'root' })
export class ProduccionService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/produccion`;

  /** GET /api/v1/produccion/siembras — roles ADMIN | JEFE_PRODUCCION. */
  listarSiembras() {
    return this.http.get<SiembraResponse[]>(`${this.base}/siembras`);
  }

  /** POST /api/v1/produccion/siembras — 201, roles ADMIN | JEFE_PRODUCCION. */
  registrarSiembra(body: SiembraCreate) {
    return this.http.post<SiembraResponse>(`${this.base}/siembras`, body);
  }

  /** PATCH /api/v1/produccion/siembras/{id_siembra}/cosecha — roles ADMIN | JEFE_PRODUCCION. */
  registrarCosecha(idSiembra: string, body: CosechaUpdate) {
    return this.http.patch<CosechaResponse>(
      `${this.base}/siembras/${encodeURIComponent(idSiembra)}/cosecha`,
      body,
    );
  }
}
