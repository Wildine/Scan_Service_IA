import { ScanCard } from "../ScanCard/ScanCard";
import styles from "./ScanList.module.css";

export function ScanList({ scans, onStop }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <h2>Historique</h2>
        <span>{scans.length} scan(s)</span>
      </div>

      {scans.length === 0 ? (
        <p className={styles.empty}>Aucun scan pour l'instant.</p>
      ) : (
        scans.map((scan) => (
          <ScanCard key={scan.id} scan={scan} onStop={onStop} />
        ))
      )}
    </div>
  );
}
