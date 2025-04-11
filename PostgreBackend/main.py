from fastapi import FastAPI
from starlette.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes.user import router as user_router
from routes.company import router as company_router
from fastapi.middleware.cors import CORSMiddleware
from routes.branch import router as branch_router
from routes.inventory import router as inventory_router
from routes.permissions import router as permissions_router
from routes.inventoryHelper import router as inventory_helper_router
from routes.visit import router as visit_router
app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(user_router, prefix="/api/user", tags=["User"])
app.include_router(permissions_router, prefix="/api/permissions", tags=["Permissions"])

app.include_router(company_router, prefix="/api/companies", tags=["Companies"])
app.include_router(branch_router, prefix="/api/branches", tags=["Branches"])
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(inventory_helper_router, prefix="/api/inventory-helper", tags=["Inventory Helper"])
app.include_router(visit_router,prefix="/api/visits",tags=["Visits"])
app.mount("/api/visit_images", StaticFiles(directory="visit_images"), name="visit_images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://45.132.181.87:3000","http://localhost:3000","https://0.0.0.0:8000","https://45.132.181.87:8000","https://127.0.1:8000","https://localhost:8000/","https://gemtech.net.tr", "https://www.gemtech.net.tr"],  # Güvenlik için sadece belirli frontend domainlerini ekleyebilirsiniz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
