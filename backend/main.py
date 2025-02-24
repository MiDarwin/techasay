from fastapi import FastAPI
from routes.authRoutes import router as auth_router
from routes.permissionRoutes import router as permission_router
from database import init_db
from fastapi.middleware.cors import CORSMiddleware
from routes.pingRoutes import router as ping_router
app = FastAPI()

# Veritabanını başlat
init_db()
app.include_router(ping_router)
app.include_router(auth_router)
app.include_router(permission_router)  # Permissions router'ı dahil edin

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için sadece belirli frontend domainlerini ekleyebilirsin
    allow_credentials=True,
    allow_methods=["*"],  # Tüm HTTP metotlarını kabul et (GET, POST, OPTIONS, vs.)
    allow_headers=["*"],  # Tüm başlıkları kabul et
)
