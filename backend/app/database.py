from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

Base = declarative_base()

_engine = None
_SessionFactory = None


def _normalize_database_url(url: str) -> str:
    if url.startswith("postgresql://"):
        return "postgresql+psycopg2://" + url[len("postgresql://"):]
    return url


def get_engine():
    global _engine, _SessionFactory
    if _engine is None:
        database_url = settings.DATABASE_URL
        if not database_url:
            raise RuntimeError(
                "DATABASE_URL no está configurada. Verifica el archivo .env en la raíz del proyecto."
            )
        database_url = _normalize_database_url(database_url)
        _engine = create_engine(
            database_url,
            pool_pre_ping=True,
            connect_args={"sslmode": "require"},
        )
        _SessionFactory = sessionmaker(autocommit=False, autoflush=False, bind=_engine)
    return _engine


def SessionLocal():
    global _SessionFactory
    if _SessionFactory is None:
        get_engine()
    return _SessionFactory()


