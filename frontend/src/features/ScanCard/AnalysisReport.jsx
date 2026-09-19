import { TriangleAlert, Terminal } from "lucide-react";
import { RiskBadge } from "../../components/RiskBadge/RiskBadge";
import { DataTable } from "../../components/DataTable/DataTable";
import styles from "./AnalysisReport.module.css";

export function AnalysisReport({ analysis }) {
  const {
    summary,
    risk_level,
    risk_justification,
    risk_points = [],
    ports = [],
    observations = [],
    recommendations = [],
    limitations,
    parse_error,
  } = analysis;

  return (
    <div className={styles.report}>
      {parse_error && (
        <div className={styles.warning}>
          <TriangleAlert size={14} />
          <span>{parse_error}</span>
        </div>
      )}

      {summary && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Résumé</h4>
          <p className={styles.text}>{summary}</p>
        </section>
      )}

      {(risk_level || risk_justification || risk_points.length > 0) && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Évaluation du risque</h4>
          <div className={styles.riskRow}>
            <RiskBadge level={risk_level} />
            {risk_justification && (
              <p className={styles.text}>{risk_justification}</p>
            )}
          </div>
          {risk_points.length > 0 && (
            <ul className={styles.list}>
              {risk_points.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      {ports.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Détail des ports</h4>
          <DataTable
            rowKey="port"
            rows={ports}
            columns={[
              { key: "port", header: "Port" },
              { key: "protocol", header: "Proto" },
              { key: "service", header: "Service probable" },
              { key: "description", header: "Description" },
              {
                key: "risk",
                header: "Risque",
                render: (row) => <RiskBadge level={row.risk} />,
              },
            ]}
          />
        </section>
      )}

      {observations.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Observations</h4>
          <ul className={styles.list}>
            {observations.map((obs, i) => (
              <li key={i}>{obs}</li>
            ))}
          </ul>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Recommandations de sécurisation</h4>
          <div className={styles.recoList}>
            {recommendations.map((reco, i) => (
              <div key={i} className={styles.recoCard}>
                <div className={styles.recoTitle}>{reco.title}</div>
                {reco.justification && (
                  <p className={styles.recoJustification}>{reco.justification}</p>
                )}
                {reco.commands?.length > 0 && (
                  <div className={styles.commands}>
                    <div className={styles.commandsHeader}>
                      <Terminal size={12} />
                      <span>Commandes</span>
                    </div>
                    {reco.commands.map((cmd, j) => (
                      <code key={j} className={styles.commandLine}>
                        $ {cmd}
                      </code>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {limitations && (
        <section className={styles.limitations}>
          <span className={styles.limitationsLabel}>Limites de l'analyse</span>
          <p className={styles.text}>{limitations}</p>
        </section>
      )}
    </div>
  );
}
