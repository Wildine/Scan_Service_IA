# AI Port Scanner - package de test

Ce dépôt contient uniquement la fonctionnalité **"Scanner de ports"** du
projet (backend + frontend), extraite pour permettre de la tester
indépendamment du reste.

- **Backend** : API en Python (FastAPI) qui effectue un scan SYN
  (Scapy) sur une cible, puis envoie les résultats à une IA
  (OpenRouter) pour générer un rapport de sécurité.
- **Frontend** : interface web en React (via Vite) qui permet de
  lancer un scan, suivre sa progression en direct, et consulter le
  rapport IA généré.

Les deux parties tournent en local, séparément, et communiquent entre
elles en HTTP.

---

## Prérequis

| Outil | Version conseillée | Vérifier avec |
|---|---|---|
| Python | 3.10 ou plus récent | `python3 --version` |
| pip | fourni avec Python | `pip --version` |
| **Node.js** | **18 ou plus récent (LTS)** | `node --version` |
| npm | fourni avec Node.js | `npm --version` |

⚠️ Le frontend est écrit en **React**, qui nécessite **Node.js** (ce
n'est pas du Python). Sans Node.js installé, `npm install` et
`npm run dev` ne fonctionneront pas.

Si Node.js n'est pas installé : [https://nodejs.org](https://nodejs.org)
(choisir la version **LTS**).

Il te faut aussi **une clé API OpenRouter** (gratuite) pour l'analyse
IA : [https://openrouter.ai](https://openrouter.ai) → créer un compte
→ récupérer une clé API.

---

## 1. Lancer le backend (API)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Puis ouvrir le fichier `.env` créé et renseigner ta clé :

```env
OPENROUTER_API_KEY=ta_clé_ici
```

Enfin, lancer le serveur :

```bash
sudo .venv/bin/uvicorn app.main:app --reload --port 8000
```

> `sudo` (droits root) est nécessaire car le scan de ports utilise
> Scapy, qui manipule directement les paquets réseau.

Le backend tourne maintenant sur **http://localhost:8000**.
Tu peux vérifier qu'il répond en ouvrant
[http://localhost:8000/api/health](http://localhost:8000/api/health)
dans un navigateur (doit afficher `{"status":"ok"}`).

---

## 2. Lancer le frontend (interface web)

Dans un **second terminal**, en laissant le backend tourner :

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Ouvrir **http://localhost:5173** dans un navigateur.

---

## Utilisation

1. Renseigner une cible (IP ou nom d'hôte) que tu es autorisé à
   scanner.
2. Choisir la plage de ports (ex: `1-1024`).
3. Lancer le scan et suivre la progression en direct.
4. Une fois terminé, consulter le rapport de sécurité généré par
   l'IA (ports détectés, niveau de risque, recommandations avec
   commandes concrètes).

---

## Problèmes fréquents

- **`npm: command not found`** → Node.js n'est pas installé (voir
  Prérequis ci-dessus).
- **Erreur de connexion / JSON invalide côté frontend** → vérifier
  que le backend tourne bien sur le port 8000 et que le fichier
  `.env` du frontend contient `VITE_API_URL=http://localhost:8000`.
- **`Permission denied` au lancement du backend** → il manque
  `sudo` devant la commande `uvicorn`.
- **Erreur liée à `OPENROUTER_API_KEY`** → vérifier que la clé est
  bien renseignée dans `backend/.env` (et qu'il n'y a pas d'espace
  ou de guillemets autour).

---