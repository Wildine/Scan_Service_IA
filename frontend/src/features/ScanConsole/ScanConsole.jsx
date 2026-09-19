import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useScans } from "../../hooks/useScans";
import { ScanForm } from "../ScanForm/ScanForm";
import { ScanList } from "../ScanList/ScanList";
import styles from "./ScanConsole.module.css";

export function ScanConsole() {
  const { scans, addScan, error, stopRunningScan } = useScans();
  const [launchError, setLaunchError] = useState(null);
  const [formOpen, setFormOpen] = useState(true);

  async function handleLaunch(payload) {
    setLaunchError(null);
    try {
      await addScan(payload);
      setFormOpen(false);
    } catch (e) {
      setLaunchError(e.message);
    }
  }

  return (
    <div className={styles.grid}>
      <section className={styles.panel}>
        <button
          type="button"
          className={styles.panelToggle}
          onClick={() => setFormOpen((o) => !o)}
        >
          <h2 className={styles.panelTitle}>Nouveau scan</h2>
          {formOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {formOpen && (
          <>
            <ScanForm onLaunch={handleLaunch} />
            {launchError && <p className={styles.error}>{launchError}</p>}
          </>
        )}
      </section>

      <section className={styles.panel}>
        {error && <p className={styles.error}>{error}</p>}
        <ScanList scans={scans} onStop={stopRunningScan} />
      </section>
    </div>
  );
}
