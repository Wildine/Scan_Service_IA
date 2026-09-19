import styles from "./Checkbox.module.css";

export function Checkbox({ label, ...inputProps }) {
  return (
    <label className={styles.row}>
      <input type="checkbox" className={styles.box} {...inputProps} />
      <span>{label}</span>
    </label>
  );
}
