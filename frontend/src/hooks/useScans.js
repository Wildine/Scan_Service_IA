import { useCallback, useEffect, useRef, useState } from "react";
import { createScan, deleteScan, listScans, stopScan } from "../api/scans";

const POLL_INTERVAL = 800;

export function useScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  const refresh = useCallback(async () => {
    try {
      const data = await listScans();
      setScans(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  // Tant qu'un scan est "running", on repolle l'historique pour
  // récupérer son résultat (ports ouverts + analyse IA) une fois terminé.
  useEffect(() => {
    const hasRunning = scans.some((s) => s.status === "running");

    if (hasRunning && !pollRef.current) {
      pollRef.current = setInterval(refresh, POLL_INTERVAL);
    }

    if (!hasRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [scans, refresh]);

  async function addScan(payload) {
    const record = await createScan(payload);
    setScans((prev) => [record, ...prev]);
    return record;
  }

  async function removeScan(id) {
    await deleteScan(id);
    setScans((prev) => prev.filter((scan) => scan.id !== id));
  }

  async function stopRunningScan(id) {
    const updated = await stopScan(id);
    setScans((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }

  return { scans, addScan, removeScan, stopRunningScan, loading, error };
}
