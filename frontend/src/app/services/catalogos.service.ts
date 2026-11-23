import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, shareReplay, tap, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { OpcionCatalogo, OpcionesCatalogo } from '../models/catalogos.model';

/** Normaliza acentos, plurales y mayúsculas para tolerar variaciones del tipo en la vista. */
function normalizarTipo(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/s$/, '');
}

/** Expone el catálogo único de opciones y lo mantiene en memoria para todos los formularios. */
@Injectable({ providedIn: 'root' })
export class CatalogosService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/catalogos`;

  private readonly _opciones = signal<OpcionesCatalogo>({});
  readonly opciones = this._opciones.asReadonly();
  readonly cargando = signal(false);

  private peticion: Observable<OpcionesCatalogo> | null = null;

  /** GET /api/v1/catalogos/opciones — disponible para cualquier usuario autenticado. */
  cargarOpciones(): Observable<OpcionesCatalogo> {
    if (!this.peticion) {
      this.cargando.set(true);
      this.peticion = this.http.get<OpcionesCatalogo>(`${this.base}/opciones`).pipe(
        tap((opciones) => this._opciones.set(opciones ?? {})),
        catchError((error: unknown) => {
          this.peticion = null;
          return throwError(() => error);
        }),
        finalize(() => this.cargando.set(false)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.peticion;
  }

  /** Fuerza una nueva consulta tras crear un maestro. */
  recargarOpciones(): Observable<OpcionesCatalogo> {
    this.peticion = null;
    return this.cargarOpciones();
  }

  /**
   * Devuelve las opciones de uno o varios tipos (`LOTE`, `SIEMBRA`, `CLIENTE`, ...).
   * Se admiten alias en plural o sin acento para no depender de la exactitud de la vista SQL.
   */
  opcionesDe(...tipos: string[]): OpcionCatalogo[] {
    const destinos = new Set(tipos.map(normalizarTipo));
    const mapa = this.opciones();
    const opciones: OpcionCatalogo[] = [];
    const idsVistos = new Set<string>();

    for (const [tipo, lista] of Object.entries(mapa)) {
      if (!destinos.has(normalizarTipo(tipo))) {
        continue;
      }
      for (const opcion of lista ?? []) {
        if (opcion?.id && !idsVistos.has(opcion.id)) {
          idsVistos.add(opcion.id);
          opciones.push(opcion);
        }
      }
    }
    return opciones;
  }
}
