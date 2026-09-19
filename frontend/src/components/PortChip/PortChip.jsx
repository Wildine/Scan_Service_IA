import styles from "./PortChip.module.css";

export function PortChip({ port }) {
  return <span className={styles.chip}>{port}/tcp</span>;
}
