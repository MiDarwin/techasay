from fastapi import FastAPI
from routes.authRoutes import router as auth_router
from routes.permissionRoutes import router as permission_router
from routes.excelChangingRoutes import router as excel_router  # Tek bir isim yeterli
from database import init_db
from fastapi.middleware.cors import CORSMiddleware
from routes.pingRoutes import router as ping_router
from routes.bpetHataTakipRoutes import router as bpetHataTakip_router

app = FastAPI()

# Veritabanını başlat
init_db()
app.include_router(bpetHataTakip_router)
# Route'ları dahil et
app.include_router(ping_router)
app.include_router(auth_router)
app.include_router(permission_router)
app.include_router(excel_router)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için sadece belirli frontend domainlerini ekleyebilirsiniz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)