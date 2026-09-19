import styles from "./Button.module.css";

export function Button({ children, variant = "primary", ...rest }) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} {...rest}>
      {children}
    </button>
  );
}
