"""
API FastAPI pour la console de scan.

Le frontend (React) est servi séparément (Vite) ; cette API expose
uniquement les endpoints JSON. On y ajoutera au fur et à mesure les
routers des autres outils (brute force, DoS, sniffer...).

Lancement :
    uvicorn app.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import scans

app = FastAPI(title="Console de scan - API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scans.router)
# app.include_router(bruteforce.router)  # à venir
# app.include_router(dos.router)         # à venir
# app.include_router(sniffer.router)     # à venir


@app.get("/api/health")
def health():
    return {"status": "ok"}
