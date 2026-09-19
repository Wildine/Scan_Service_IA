import { authHeaders, clearToken } from "./authToken";

const RAW_BASE = import.meta.env.VITE_API_URL ?? "";
const BASE = `${RAW_BASE}/api/scans`;

function handleUnauthorized(res) {
  if (res.status === 401) {
    clearToken();
    window.location.reload();
  }
}

export async function listScans() {
  const res = await fetch(BASE, { headers: authHeaders() });
  handleUnauthorized(res);
  if (!res.ok) throw new Error("Impossible de charger l'historique.");
  return res.json();
}

export async function createScan(payload) {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  handleUnauthorized(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Le lancement du scan a échoué.");
  }
  return res.json();
}

export async function stopScan(id) {
  const res = await fetch(`${BASE}/${id}/stop`, {
    method: "POST",
    headers: authHeaders(),
  });
  handleUnauthorized(res);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Impossible d'arrêter ce scan.");
  }
  return res.json();
}

export async function deleteScan(id) {
  const res = await fetch(`${BASE}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  handleUnauthorized(res);
  if (!res.ok) throw new Error("Suppression impossible.");
  return res.json();
}
