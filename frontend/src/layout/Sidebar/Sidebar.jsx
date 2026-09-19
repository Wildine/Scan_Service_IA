import { Radar } from "lucide-react";
import styles from "./Sidebar.module.css";

const SECTIONS = [
  {
    label: "Surveillance",
    items: [{ id: "scanner", label: "Scanner" }],
  },
];

export function Sidebar({ active, onNavigate, isOpen, onNavigated }) {
  return (
    <nav className={`${styles.sidebar} ${isOpen ? "" : styles.closed}`}>
      {SECTIONS.map((section) => (
        <div key={section.label} className={styles.section}>
          <div className={styles.sectionLabel}>{section.label}</div>
          <ul className={styles.list}>
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  className={`${styles.link} ${active === item.id ? styles.active : ""}`}
                  onClick={() => {
                    onNavigate(item.id);
                    onNavigated?.();
                  }}
                >
                  <Radar size={16} className={styles.icon} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export { SECTIONS };
