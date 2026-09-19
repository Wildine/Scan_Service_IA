import { useState } from "react";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { Sidebar } from "../Sidebar/Sidebar";
import { ThemeToggle } from "../../components/ThemeToggle/ThemeToggle";
import styles from "./AppShell.module.css";

export function AppShell({
  active,
  onNavigate,
  theme,
  onToggleTheme,
  user,
  onLogout,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.brand}>
            <button
              type="button"
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label={sidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>
            <span className={styles.dot} />
            <h1>Console de scan</h1>
          </div>
          <div className={styles.headerActions}>
            {user && <span className={styles.username}>{user.username}</span>}
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <button
              type="button"
              className={styles.logoutBtn}
              onClick={onLogout}
              aria-label="Se déconnecter"
              title="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <p>
          Lance des scans SYN sur des cibles autorisées et consulte les
          analyses de sécurité générées par IA.
        </p>
      </header>

      <div className={styles.body}>
        <Sidebar
          active={active}
          onNavigate={onNavigate}
          isOpen={sidebarOpen}
          onNavigated={() => window.innerWidth < 760 && setSidebarOpen(false)}
        />
        <main className={styles.main}>
          <div className={styles.mainInner}>{children}</div>
        </main>
      </div>
    </div>
  );
}
