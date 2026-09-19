import { useState } from "react";
import { Field } from "../../components/Field/Field";
import { Checkbox } from "../../components/Checkbox/Checkbox";
import { Button } from "../../components/Button/Button";
import styles from "./ScanForm.module.css";

export function ScanForm({ onLaunch }) {
  const [target, setTarget] = useState("");
  const [ports, setPorts] = useState("1-1024");
  const [timeout, setTimeoutValue] = useState(1);
  const [useAi, setUseAi] = useState(true);
  const [launching, setLaunching] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLaunching(true);
    await onLaunch({ target, ports, timeout: Number(timeout), use_ai: useAi });
    setLaunching(false);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field
        label="Cible"
        placeholder="192.168.1.10"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        required
      />
      <Field
        label="Ports"
        placeholder="80 | 22,80,443 | 1-1024"
        value={ports}
        onChange={(e) => setPorts(e.target.value)}
        required
      />
      <Field
        label="Timeout (s)"
        type="number"
        step="0.1"
        min="0.1"
        value={timeout}
        onChange={(e) => setTimeoutValue(e.target.value)}
      />
      <Checkbox
        label="Analyse IA (OpenRouter)"
        checked={useAi}
        onChange={(e) => setUseAi(e.target.checked)}
      />
      <Button type="submit" disabled={launching}>
        {launching ? "Lancement…" : "Lancer le scan"}
      </Button>
      <p className={styles.note}>
        Le scan SYN nécessite les droits root côté serveur. N'utiliser que sur
        des cibles autorisées.
      </p>
    </form>
  );
}
