import styles from "./RiskBadge.module.css";

const LABELS = {
  low: "faible",
  medium: "moyen",
  high: "élevé",
  critical: "critique",
};

export function RiskBadge({ level }) {
  return (
    <span className={`${styles.badge} ${styles[level] || ""}`}>
      {LABELS[level] || level}
    </span>
  );
}