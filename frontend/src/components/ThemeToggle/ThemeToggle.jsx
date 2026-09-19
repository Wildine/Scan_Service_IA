import styles from "./ThemeToggle.module.css";

export function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      aria-label="Changer de thème"
      title={theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}
    >
      {theme === "dark" ? "☀ Clair" : "🌙 Sombre"}
    </button>
  );
}
