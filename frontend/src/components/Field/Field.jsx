import styles from "./Field.module.css";

export function Field({ label, hint, ...inputProps }) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input className={styles.input} {...inputProps} />
      {hint && <span className={styles.hint}>{hint}</span>}
    </label>
  );
}
