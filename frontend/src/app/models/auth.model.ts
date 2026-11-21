/** POST /api/v1/auth/login consume x-www-form-urlencoded (OAuth2PasswordRequestForm). */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Respuesta exacta del schema Pydantic Token. */
export interface Token {
  access_token: string;
  token_type: string;
}

/** Claims reales creados en app/core/security.py + app/services/auth_service.py. */
export interface JwtPayload {
  ID_Usuario: number;
  rol: string;
  nombre_completo: string | null;
  exp: number;
}

/** Formato estándar de error de FastAPI (sin handlers personalizados en el backend). */
export interface BackendValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface BackendError {
  detail: string | BackendValidationError[];
}

/** Valores literales usados por RoleChecker en app/api/deps.py y los routers. */
export const ROLES = {
  ADMIN: 'ADMIN',
  GERENTE: 'GERENTE',
  JEFE_PRODUCCION: 'JEFE_PRODUCCION',
  JEFE_COMERCIAL: 'JEFE_COMERCIAL',
  RESP_SOCIAL: 'RESP_SOCIAL',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLES_LABEL: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  GERENTE: 'Gerente',
  JEFE_PRODUCCION: 'Jefe de Producción',
  JEFE_COMERCIAL: 'Jefe Comercial',
  RESP_SOCIAL: 'Responsable de Programas Sociales',
};

export function isUserRole(value: string | null | undefined): value is UserRole {
  return !!value && Object.values(ROLES).includes(value as UserRole);
}
