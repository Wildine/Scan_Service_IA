# AI Port Scanner - package de test

Contient uniquement la fonctionnalité "Scanner de ports" (backend + frontend).

## 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# éditer .env : ajouter votre OPENROUTER_API_KEY
sudo .venv/bin/uvicorn app.main:app --reload --port 8000
```

(root/sudo nécessaire pour les scans Scapy)

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Ouvrir http://localhost:5173