# AGENTS.md

## Stack & commands

- Angular 22.3 standalone app (no NgModules), `@angular/build`, npm 11.19.0 (`npm ci`). Tailwind 4 is configured via `.postcssrc.json` (`@tailwindcss/postcss`) and `@import "tailwindcss"` in `src/styles.css` — **run `npm install` before building** if `node_modules` predates those devDependencies.
- `npm start` → dev server at `http://localhost:4200`. `npm run build` → `dist/frontend/` (production default). `npm run watch` → development rebuild on change.
- `npm test` → Vitest via `@angular/build:unit-test`, in Node/jsdom. Watch defaults **on in a TTY**: use `npm test -- --watch=false` for one-shot runs; single file via `--include=app/app.spec.ts` (paths resolve relative to `src/`); by name via `--filter=App`.
- `npm run serve:ssr:frontend` → `node dist/frontend/server/server.mjs`; needs a build first. `PORT` overrides 4000.
- No lint, typecheck, or e2e script (`ng e2e` in README is boilerplate). No CI or pre-commit. Format with `npx prettier --write .` (printWidth 100, single quotes, `angular` parser for HTML).

## Backend contract (sibling `../backend`)

- Full API/domain notes live in `../backend/AGENTS.md`; its 8 routes (7 de dominio + `GET /`) son la superficie completa. `environment.apiUrl = http://localhost:8000/api/v1` (uvicorn default port + `/api/v1` prefix).
- `POST /auth/login` is **form-encoded** (`OAuth2PasswordRequestForm`: `username`, `password`), not JSON. Response is `{ access_token, token_type }`. JWT claims: `ID_Usuario`, `rol`, `nombre_completo`, `exp`.
- Roles are `ADMIN`, `GERENTE`, `JEFE_PRODUCCION`, `JEFE_COMERCIAL`, `RESP_SOCIAL`; every non-login route is role-gated. Errors are FastAPI's `{ detail }` (string, or 422 array of `{loc,msg,type}`).
- Only 7 domain endpoints exist: POST `/produccion/siembras`, GET `/produccion/siembras` (nuevo listado con `response_model=list[SiembraResponse]`), PATCH `/produccion/siembras/{id_siembra}/cosecha`, POST `/comercial/pedidos`, GET `/trazabilidad/pedido/{id_pedido}`, POST `/social/entregas`, plus GET `/`. No hay otros listados, maestros CRUD, dashboard/reportes, mermas, export ni PUT/DELETE. Do not add routes for them without a backend change.
- `PedidoCreate.detalles` is `list[dict[str, Any]]` with **no defined keys**, and traceability rows have no connected `response_model` — render them dynamically rather than assuming field names.

## Architecture

- `core/auth` (JWT decode + session), `core/guards` (auth + role), `core/interceptors` (Bearer + FastAPI `detail` toast), `core/services/inactivity.service.ts` (10 min RNF-08).
- `models/` mirrors Pydantic names exactly (including `ID_*` uppercase). `services/` = one `HttpClient` service per backend router.
- `shared/` = responsive shell/sidebar drawer, toast, modal, confirm dialog, status badge. `features/` = one folder per available endpoint.
- Signal Forms live in `@angular/forms/signals`. In installed Angular 22.3 the directive is **`[formField]`** (selector `[formField]`, input alias `formField`), not the older `[field]`. Field state is read as `f.campo().errors()`, `.touched()`, `.invalid()`; validators are `required`, `min`, `maxLength`, `pattern`, `validate` from the same package. No `ReactiveFormsModule`/`FormGroup`/`NgModel`.
- `app.routes.server.ts` uses `RenderMode.Client` for `**`: auth state comes from `localStorage`, so prerendering would bake a redirect into the HTML.

## Gotchas

- `.vscode/launch.json` "ng test" still points to the old Karma URL (`localhost:9876`); Vitest runs in Node.
- Do not copy the backend `SECRET_KEY` into frontend code; decoding the JWT client-side is presentation-only, not authorization.
