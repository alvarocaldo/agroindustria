# AGENTS.md

## Stack & run
- Python backend: FastAPI + SQLAlchemy (sync) + PostgreSQL/Supabase (`psycopg2-binary`), JWT auth (`PyJWT`) and password verification (`passlib[bcrypt]`).
- Install deps: `pip install -r requirements.txt`
- Run dev server: `uvicorn app.main:app --reload`
- Env config loaded from `.env` via `app/core/config.py` (`DATABASE_URL`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`); see `.env.example`.

## Architecture (strict layers)
- `app/api/` (routers/endpoints), `app/services/` (business logic + `HTTPException` 400/401/403/404), `app/repositories/` (data access only), `app/schemas/` (Pydantic), `app/models/` (SQLAlchemy).
- **No SQL in endpoints/services.** Repositories only: use `db.execute(text("SELECT * FROM rpc_nombre(:param)"), {...})` for Supabase RPCs and SQLAlchemy ORM for simple CRUD.
- DB session/engine in `app/database.py`; `get_db`/`get_current_user`/`RoleChecker` in `app/api/deps.py`; JWT/password helpers in `app/core/security.py`. Routers wired in `app/main.py` with CORS `allow_origins=["*"]`.

## Key domain/API facts
- Auth: `POST /api/v1/auth/login` calls RPC `login_usuario(:p_username)` returning `id_usuario,password_hash,rol,nombre_completo`; service verifies password and issues JWT containing `ID_Usuario` and `rol`.
- Producción (roles `ADMIN`,`JEFE_PRODUCCION`): `POST /api/v1/produccion/siembras` = ORM insert (`Siembras_Cosechas`), `GET /api/v1/produccion/siembras` = ORM listado ordenado por `fecha_siembra` descendente (`response_model=list[SiembraResponse]`), `PATCH /api/v1/produccion/siembras/{id}/cosecha` = RPC `registrar_cosecha(:p_id_siembra,:p_fecha_cosecha,:p_kg_cosechados)`.
- Comercial/Trazabilidad: `POST /api/v1/comercial/pedidos` (roles `ADMIN`,`JEFE_COMERCIAL`) calls RPC `registrar_pedido_completo(:p_id_pedido,:p_id_cliente,:p_id_usuario, CAST(:p_detalles AS jsonb))` with `p_id_usuario` from token; `GET /api/v1/trazabilidad/pedido/{id_pedido}` (roles `ADMIN`,`GERENTE`,`JEFE_COMERCIAL`) calls RPC `obtener_trazabilidad_pedido(:p_id_pedido)`.
- Social (roles `ADMIN`,`RESP_SOCIAL`): `POST /api/v1/social/entregas` = ORM insert (`Entregas_Programa`).
- No automated tests/CI config present in repo; verify changes by running the app and exercising endpoints against a configured Supabase DB/RPCs. When DB schema or RPC signatures differ from assumptions in code, align repositories/models/schemas to the real DB.
