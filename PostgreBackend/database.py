# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

DATABASE_URL = "postgresql+asyncpg://postgres:1420@localhost/postgres"

engine = create_engine(DATABASE_URL, connect_args={"server_settings": "time zone='UTC'"})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()