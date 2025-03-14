from fastapi import FastAPI
from database import init_db
from routes.user import router as user_router
from routes.company import router as company_router
from fastapi.middleware.cors import CORSMiddleware
from routes.branch import router as branch_router
app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(user_router, prefix="/user", tags=["User"])
app.include_router(company_router)
app.include_router(branch_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için sadece belirli frontend domainlerini ekleyebilirsiniz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0", port=8000)