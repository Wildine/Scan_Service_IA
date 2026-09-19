import { useTheme } from "./hooks/useTheme";
import { AppShell } from "./layout/AppShell/AppShell";
import { Scanner } from "./features/Scanner/Scanner";

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <AppShell
      active="scanner"
      onNavigate={() => {}}
      theme={theme}
      onToggleTheme={toggleTheme}
      user={null}
      onLogout={() => {}}
    >
      <Scanner />
    </AppShell>
  );
}
