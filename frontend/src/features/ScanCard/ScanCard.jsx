import { useState } from "react";
import { ChevronRight, Square } from "lucide-react";
import { Modal } from "../../components/Modal/Modal";
import { StatusPill } from "../../components/StatusPill/StatusPill";
import { PortChip } from "../../components/PortChip/PortChip";
import { AnalysisReport } from "./AnalysisReport";
import styles from "./ScanCard.module.css";

function formatDate(iso) {
  return new Date(iso).toLocaleString("fr-FR");
}

export function ScanCard({ scan, onStop }) {
  const [open, setOpen] = useState(false);
  const [stopping, setStopping] = useState(false);

  async function handleStop(e) {
    e.stopPropagation();
    setStopping(true);
    try {
      await onStop(scan.id);
    } finally {
      setStopping(false);
    }
  }

  return (
    <>
      <div className={styles.card}>
        <button className={styles.head} onClick={() => setOpen(true)}>
          <div>
            <div className={styles.target}>{scan.target}</div>
            <div className={styles.meta}>
              ports {scan.ports} · timeout {scan.timeout}s ·{" "}
              {formatDate(scan.created_at)}
            </div>
          </div>
          <div className={styles.headRight}>
            {scan.status === "running" && (
              <button
                type="button"
                className={styles.stopBtn}
                onClick={handleStop}
                disabled={stopping}
                title="Arrêter le scan"
              >
                <Square size={12} />
                {stopping ? "..." : "Arrêter"}
              </button>
            )}
            <StatusPill status={scan.status} />
            <ChevronRight size={16} className={styles.chevron} />
          </div>
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={scan.target}
        subtitle={`ports ${scan.ports} · timeout ${scan.timeout}s · ${formatDate(scan.created_at)}`}
      >
        <div className={styles.modalStatus}>
          <StatusPill status={scan.status} />
        </div>

        {scan.status === "running" && (
          <div className={styles.progress}>
            <p className={styles.placeholder}>
              {scan.total_ports
                ? `Port ${scan.current_port ?? "…"} · ${scan.ports_scanned ?? 0}/${scan.total_ports} scannés`
                : "Scan en cours…"}
            </p>
            {scan.total_ports > 0 && (
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.min(
                      100,
                      ((scan.ports_scanned ?? 0) / scan.total_ports) * 100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {scan.status === "error" && (
          <p className={styles.placeholder}>{scan.error}</p>
        )}

        {scan.status === "stopped" && (
          <>
            <p className={styles.placeholder}>
              Scan arrêté manuellement avant la fin.
            </p>
            {scan.open_ports && scan.open_ports.length > 0 && (
              <div className={styles.ports}>
                {scan.open_ports.map((p) => (
                  <PortChip key={p} port={p} />
                ))}
              </div>
            )}
          </>
        )}

        {scan.status === "done" && (
          <>
            <div className={styles.ports}>
              {scan.open_ports.length > 0 ? (
                scan.open_ports.map((p) => <PortChip key={p} port={p} />)
              ) : (
                <span className={styles.placeholder}>
                  Aucun port ouvert détecté.
                </span>
              )}
            </div>

            {scan.ai_analysis && <AnalysisReport analysis={scan.ai_analysis} />}
          </>
        )}
      </Modal>
    </>
  );
}
