import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, BackgroundTasks, HTTPException

from app.core.config import settings
from app.db.json_store import JsonStore
from app.models.scan import ScanRecord, ScanRequest
from app.services.ai_analyzer import analyze_scan
from app.services.port_scanner import parse_ports, port_scan

router = APIRouter(prefix="/api/scans", tags=["scans"])

store = JsonStore(settings.SCANS_DB_FILE)


def run_scan_job(scan_id: str, target: str, ports_arg: str, timeout: float, use_ai: bool) -> None:
    try:
        ports = parse_ports(ports_arg)

        # Throttle : on n'écrit la progression sur disque que tous les
        # 10 ports (ou au dernier port) pour ne pas ralentir le scan.
        PROGRESS_EVERY = 10

        def on_progress(current_port: int, ports_scanned: int, total_ports: int) -> None:
            if ports_scanned % PROGRESS_EVERY == 0 or ports_scanned == total_ports:
                store.update(
                    scan_id,
                    current_port=current_port,
                    ports_scanned=ports_scanned,
                    total_ports=total_ports,
                )

        open_ports = list(port_scan(target, ports, timeout, on_progress=on_progress))

        ai_analysis = None
        if use_ai:
            ai_analysis = analyze_scan(target, open_ports)

        store.update(
            scan_id,
            status="done",
            open_ports=open_ports,
            ai_analysis=ai_analysis,
            finished_at=datetime.now(timezone.utc).isoformat(),
        )

    except Exception as e:
        store.update(
            scan_id,
            status="error",
            error=str(e),
            finished_at=datetime.now(timezone.utc).isoformat(),
        )


@router.post("", response_model=ScanRecord)
def create_scan(req: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    total_ports = len(list(parse_ports(req.ports)))

    record = {
        "id": scan_id,
        "target": req.target,
        "ports": req.ports,
        "timeout": req.timeout,
        "use_ai": req.use_ai,
        "status": "running",
        "open_ports": None,
        "ai_analysis": None,
        "error": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "finished_at": None,
        "current_port": None,
        "ports_scanned": 0,
        "total_ports": total_ports,
    }

    store.set(scan_id, record)

    background_tasks.add_task(
        run_scan_job, scan_id, req.target, req.ports, req.timeout, req.use_ai
    )

    return record


@router.get("", response_model=List[ScanRecord])
def list_scans():
    db = store.load()
    return sorted(db.values(), key=lambda r: r["created_at"], reverse=True)


@router.get("/{scan_id}", response_model=ScanRecord)
def get_scan(scan_id: str):
    db = store.load()
    if scan_id not in db:
        raise HTTPException(status_code=404, detail="Scan introuvable")
    return db[scan_id]


@router.delete("/{scan_id}")
def delete_scan(scan_id: str):
    if not store.delete(scan_id):
        raise HTTPException(status_code=404, detail="Scan introuvable")
    return {"ok": True}
