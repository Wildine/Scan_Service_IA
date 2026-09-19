import json
import os
import threading


class JsonStore:
    """Petite couche de persistance fichier JSON (clé -> dict), thread-safe."""

    def __init__(self, file_path: str):
        self._file_path = file_path
        self._lock = threading.Lock()
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

    def load(self) -> dict:
        if not os.path.exists(self._file_path):
            return {}
        with open(self._file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def save(self, data: dict) -> None:
        with open(self._file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def update(self, key: str, **kwargs) -> None:
        with self._lock:
            data = self.load()
            if key in data:
                data[key].update(kwargs)
                self.save(data)

    def set(self, key: str, value: dict) -> None:
        with self._lock:
            data = self.load()
            data[key] = value
            self.save(data)

    def delete(self, key: str) -> bool:
        with self._lock:
            data = self.load()
            if key not in data:
                return False
            del data[key]
            self.save(data)
            return True
