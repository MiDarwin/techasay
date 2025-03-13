from fastapi import FastAPI
from database import init_db
from routes.user import router as user_router

app = FastAPI()

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(user_router, prefix="/user", tags=["User"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0", port=8000)