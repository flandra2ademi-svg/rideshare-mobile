"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "pending" | "accepted";
type State = {
  udhetim: { id: string; nisja: string; destinacioni: string; ora: string; vendtakimi: string; vende: number };
  eshteShofer: boolean;
  kerkesaIme: { id: string; status: Status } | null;
  kerkesa: { id: string; status: Status; emri: string }[];
};

export function KerkesaLive({ udhetimiId, fillestare }: { udhetimiId: string; fillestare: State }) {
  const [state, setState] = useState(fillestare);
  const [busy, setBusy] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(0);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    const sequence = ++latest.current;
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(udhetimiId)}/kerkesa`, { cache: "no-store", signal });
      if (!response.ok) throw new Error("Gjendja nuk u lexua.");
      const next = await response.json() as State;
      if (sequence >= latest.current) {
        setState(next);
        setOffline(false);
        setError("");
      }
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setOffline(true);
      setError("Po rilidhemi. Të dhënat e shfaqura mund të jenë të vjetruara.");
    }
  }, [udhetimiId]);

  useEffect(() => {
    let stopped = false;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const loop = async () => {
      if (stopped || !navigator.onLine) {
        if (!stopped) { setOffline(true); setError("Po rilidhemi. Të dhënat e shfaqura mund të jenë të vjetruara."); }
        timer = setTimeout(loop, 5000);
        return;
      }
      controller?.abort();
      controller = new AbortController();
      await refresh(controller.signal);
      if (!stopped) timer = setTimeout(loop, 5000);
    };
    const reconnect = () => { setOffline(true); void loop(); };
    const disconnect = () => { setOffline(true); setError("Po rilidhemi. Të dhënat e shfaqura mund të jenë të vjetruara."); controller?.abort(); };
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", disconnect);
    void loop();
    return () => { stopped = true; if (timer) clearTimeout(timer); controller?.abort(); window.removeEventListener("online", reconnect); window.removeEventListener("offline", disconnect); };
  }, [refresh]);

  const create = async () => {
    if (busy || offline || state.kerkesaIme) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(udhetimiId)}/kerkesa`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) });
      const result = await response.json() as { request?: { id: string; status: Status }; error?: string };
      if (!response.ok || !result.request) throw new Error(result.error ?? "Kërkesa nuk u dërgua.");
      setState(current => ({ ...current, kerkesaIme: result.request ?? null }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kërkesa nuk u dërgua."); }
    finally { setBusy(false); }
  };

  const accept = async (requestId: string) => {
    if (busy || offline) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/udhetimet/${encodeURIComponent(udhetimiId)}/kerkesa`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "accept", requestId }) });
      const result = await response.json() as { accepted?: { vende: number; status: Status }; error?: string };
      if (!response.ok || !result.accepted) throw new Error(result.error ?? "Pranimi nuk u krye.");
      setState(current => ({ ...current, udhetim: { ...current.udhetim, vende: result.accepted?.vende ?? current.udhetim.vende }, kerkesa: current.kerkesa.map(item => item.id === requestId ? { ...item, status: "accepted" } : item) }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Pranimi nuk u krye."); }
    finally { setBusy(false); }
  };

  return <section className="request-card" aria-label="Kërkesat e udhëtimit">
    <div className="detail-card request-summary"><p><strong>Vende të lira</strong><span>{state.udhetim.vende}</span></p><p><strong>Sinkronizimi</strong><span>{offline ? "Po rilidhemi" : "Aktiv · çdo 5 sekonda"}</span></p></div>
    {offline && <p className="request-warning" role="status">Po rilidhemi. Të dhënat e shfaqura mund të jenë të vjetruara.</p>}
    {error && <p className="request-error" role="alert">{error}</p>}
    {!state.eshteShofer && <div><p role="status" aria-live="polite">{state.kerkesaIme?.status === "accepted" ? "U pranua." : state.kerkesaIme ? "Në pritje të pranimit nga shoferi." : "Nuk ke dërguar ende kërkesë."}</p><button className="action action--wide" type="button" onClick={create} disabled={busy || offline || Boolean(state.kerkesaIme) || state.udhetim.vende <= 0}>{busy ? "Po dërgohet…" : state.kerkesaIme ? (state.kerkesaIme.status === "accepted" ? "Kërkesa u pranua" : "Në pritje") : "Kërko një vend"}</button></div>}
    {state.eshteShofer && <div><h2>Kërkesat që kanë mbërritur</h2>{state.kerkesa.length === 0 ? <p>Nuk ka kërkesa të reja.</p> : <ul className="request-list">{state.kerkesa.map(item => <li key={item.id}><span>{item.emri} · {item.status === "accepted" ? "U pranua" : "Në pritje"}</span>{item.status === "pending" && <button className="action" type="button" onClick={() => accept(item.id)} disabled={busy || offline || state.udhetim.vende <= 0}>{busy ? "Po pranohet…" : "Prano kërkesën"}</button>}</li>)}</ul>}</div>}
  </section>;
}
