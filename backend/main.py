from fastapi import FastAPI
from routes.authRoutes import router as auth_router
from routes.permissionRoutes import router as permission_router
from database import init_db

app = FastAPI()

# Veritabanını başlat
init_db()

app.include_router(auth_router)
app.include_router(permission_router)  # Permissions router'ı dahil edin
