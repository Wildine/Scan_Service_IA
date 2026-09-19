import { PageHeader } from "../../components/PageHeader/PageHeader";
import { ScanConsole } from "../ScanConsole/ScanConsole";

export function Scanner() {
  return (
    <div>
      <PageHeader
        title="Scanner de ports"
        description="Lance un scan SYN sur une cible autorisée et consulte l'analyse IA associée."
      />
      <ScanConsole />
    </div>
  );
}