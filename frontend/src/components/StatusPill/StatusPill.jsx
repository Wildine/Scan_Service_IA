import styles from "./StatusPill.module.css";

const LABELS = {
  running: "en cours",
  done: "terminé",
  error: "erreur",
  stopped: "arrêté",
  success: "réussi",
  failed: "échoué",
  trying: "en cours",
};

const TONE_CLASS = {
  running: "running",
  trying: "running",
  done: "done",
  success: "done",
  error: "error",
  failed: "error",
  stopped: "stopped",
};

export function StatusPill({ status }) {
  return (
    <span className={`${styles.pill} ${styles[TONE_CLASS[status] || status]}`}>
      {LABELS[status] || status}
    </span>
  );
}
