from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import get_settings

settings = get_settings()

# PgBouncer transaction mode requires:
# - pool_pre_ping to detect stale connections
# - pool_size/max_overflow kept low (we rely on PgBouncer to multiplex)
# - prepared_statement_cache_size=0 (PgBouncer can't relay server-side prepared stmts)
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=300,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "options": "-c statement_timeout=30000",
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
