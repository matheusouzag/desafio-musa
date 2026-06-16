from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.mtr import router as mtr_router

app = FastAPI(
    title="MUSA Challenge API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    mtr_router,
    tags=["MTR"]
)

@app.get("/")
def home():
    return {"status": "ok"}