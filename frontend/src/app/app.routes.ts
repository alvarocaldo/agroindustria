import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { ROLES } from './models/auth.model';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'login',
    title: 'Iniciar sesión · Agroindustrial ODS 2',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'inicio',
        title: 'Inicio · Agroindustrial ODS 2',
        loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'produccion/siembras/nueva',
        title: 'Registrar siembra · Agroindustrial ODS 2',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.JEFE_PRODUCCION] },
        loadComponent: () =>
          import('./features/produccion/siembra-form/siembra-form.component').then((m) => m.SiembraFormComponent),
      },
      {
        path: 'produccion/cosechas/registrar',
        title: 'Registrar cosecha · Agroindustrial ODS 2',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.JEFE_PRODUCCION] },
        loadComponent: () =>
          import('./features/produccion/cosecha-form/cosecha-form.component').then((m) => m.CosechaFormComponent),
      },
      {
        path: 'comercial/pedidos/nuevo',
        title: 'Registrar pedido · Agroindustrial ODS 2',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.JEFE_COMERCIAL] },
        loadComponent: () =>
          import('./features/comercial/pedido-form/pedido-form.component').then((m) => m.PedidoFormComponent),
      },
      {
        path: 'trazabilidad',
        title: 'Trazabilidad · Agroindustrial ODS 2',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.GERENTE, ROLES.JEFE_COMERCIAL] },
        loadComponent: () => import('./features/trazabilidad/trazabilidad.component').then((m) => m.TrazabilidadComponent),
      },
      {
        path: 'social/entregas/nueva',
        title: 'Entrega social · Agroindustrial ODS 2',
        canActivate: [roleGuard],
        data: { roles: [ROLES.ADMIN, ROLES.RESP_SOCIAL] },
        loadComponent: () =>
          import('./features/social/entrega-form/entrega-form.component').then((m) => m.EntregaFormComponent),
      },
      {
        path: 'catalogos',
        title: 'Catálogos · Agroindustrial ODS 2',
        loadComponent: () => import('./features/catalogos/catalogos.component').then((m) => m.CatalogosComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'inicio' },
];
