import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "openrouter/free")

    # Origines autorisées pour le frontend React (Vite: 5173 par défaut)
    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")

    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    SCANS_DB_FILE: str = os.path.join(DATA_DIR, "scans_history.json")


settings = Settings()
