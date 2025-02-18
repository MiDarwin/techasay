# main.py
from fastapi import FastAPI
from routes.authRoutes import router as auth_router
from database import init_db

app = FastAPI()

# Veritabanını başlat
init_db()

app.include_router(auth_router)