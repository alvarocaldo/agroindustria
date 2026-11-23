/** Respuestas de GET/POST /api/v1/maestros/{entidad} (app/schemas/maestros.py). */

export interface Lote {
  id_lote: string;
  id_fundo: string;
  nombre_lote: string;
  hectareas: number | string;
}

export interface Categoria {
  id_categoria: string;
  nombre_categoria: string;
}

export interface Producto {
  id_producto: string;
  nombre_producto: string;
  id_categoria: string;
  precio_unit: number | string;
}

export interface Cliente {
  id_cliente: string;
  nombre_cliente: string;
  pais: string;
}

export interface Programa {
  id_programa: string;
  nombre_programa: string;
}

export interface Beneficiario {
  id_beneficiario: string;
  nombre_beneficiario: string;
  tipo_beneficiario: string;
}

export interface LoteCreate {
  id_fundo: string;
  nombre_lote: string;
  hectareas: number;
}

export interface CategoriaCreate {
  nombre_categoria: string;
}

export interface ProductoCreate {
  nombre_producto: string;
  id_categoria: string;
  precio_unit: number;
}

export interface ClienteCreate {
  nombre_cliente: string;
  pais: string;
}

export interface ProgramaCreate {
  nombre_programa: string;
}

export interface BeneficiarioCreate {
  nombre_beneficiario: string;
  tipo_beneficiario: string;
}

export interface MaestroPorEntidad {
  lotes: Lote;
  categorias: Categoria;
  productos: Producto;
  clientes: Cliente;
  programas: Programa;
  beneficiarios: Beneficiario;
}

export interface MaestroCreatePorEntidad {
  lotes: LoteCreate;
  categorias: CategoriaCreate;
  productos: ProductoCreate;
  clientes: ClienteCreate;
  programas: ProgramaCreate;
  beneficiarios: BeneficiarioCreate;
}

export type EntidadMaestro = keyof MaestroPorEntidad;
