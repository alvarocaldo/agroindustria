import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * La sesión se lee desde localStorage, que no existe en el servidor. Renderizar en cliente
 * evita que una redirección del guard durante el prerender quede congelada en el HTML.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
