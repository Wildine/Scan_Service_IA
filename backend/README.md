# API - Console de scan

Backend FastAPI, découplé du frontend (React, servi séparément via Vite).

## Structure

```
app/
  main.py              point d'entrée FastAPI + CORS
  core/config.py        variables d'environnement
  api/routes/scans.py    endpoints /api/scans (feature Scanner)
  services/              logique métier (scapy, OpenRouter) - inchangée
  models/                schémas Pydantic
  db/json_store.py       persistance JSON générique
  data/scans_history.json
```

## Lancement

```
pip install -r requirements.txt
cp .env.example .env   # renseigner OPENROUTER_API_KEY
uvicorn app.main:app --reload --port 8000
```

Le scan SYN nécessite les droits root côté serveur.
