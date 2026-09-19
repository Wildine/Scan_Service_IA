from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ScanRequest(BaseModel):
    target: str = Field(..., description="IP ou hostname de la cible autorisée")
    ports: str = Field("1-1024", description="80 | 80,443 | 1-1024")
    timeout: float = Field(1.0, gt=0)
    use_ai: bool = True


class ScanRecord(BaseModel):
    id: str
    target: str
    ports: str
    timeout: float
    use_ai: bool
    status: str  # "running" | "done" | "error"
    open_ports: Optional[List[int]] = None
    # Objet structuré (voir ai_analyzer._empty_analysis pour le schéma :
    # summary, risk_level, risk_justification, risk_points, ports,
    # observations, recommendations, limitations, parse_error).
    ai_analysis: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    created_at: str
    finished_at: Optional[str] = None
    current_port: Optional[int] = None
    ports_scanned: Optional[int] = None
    total_ports: Optional[int] = None
