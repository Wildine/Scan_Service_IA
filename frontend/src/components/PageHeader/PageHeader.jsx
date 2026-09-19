import styles from "./PageHeader.module.css";

export function PageHeader({ title, description }) {
  return (
    <div className={styles.header}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}