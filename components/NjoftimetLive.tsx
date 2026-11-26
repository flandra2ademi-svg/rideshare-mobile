"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type Njoftim = {
  id: string;
  kerkesaId: string;
  udhetimiId: string;
  lexuarMe: string | null;
  emriShoferit: string;
  nisja: string;
  destinacioni: string;
};

type Payload = { njoftimet: Njoftim[]; tePalexuara: number };

export function NjoftimetLive() {
  const [payload, setPayload] = useState<Payload>({ njoftimet: [], tePalexuara: 0 });
  const [available, setAvailable] = useState(true);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Njoftim | null>(null);
  const seen = useRef<Set<string> | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/njoftimet", { cache: "no-store", signal });
      if (response.status === 401) { setAvailable(false); return; }
      if (!response.ok) throw new Error("Njoftimet nuk u lexuan.");
      const next = await response.json() as Payload;
      const ids = new Set(next.njoftimet.map(notification => notification.id));
      if (seen.current === null) {
        seen.current = ids;
      } else {
        const newNotification = next.njoftimet.find(notification => !seen.current?.has(notification.id));
        if (newNotification) setToast(newNotification);
        seen.current = ids;
      }
      setPayload(next);
      setAvailable(true);
      setOffline(false);
      setError("");
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === "AbortError") return;
      setOffline(true);
      setError("Po rilidhemi. Njoftimet e fundit do të shfaqen pas rilidhjes.");
    }
  }, []);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    const loop = async () => {
      if (stopped) return;
      if (!navigator.onLine) {
        setOffline(true);
        timer = setTimeout(loop, 5000);
        return;
      }
      controller?.abort();
      controller = new AbortController();
      await refresh(controller.signal);
      if (!stopped) timer = setTimeout(loop, 5000);
    };
    const reconnect = () => { setOffline(false); void loop(); };
    const disconnect = () => { setOffline(true); controller?.abort(); };
    window.addEventListener("online", reconnect);
    window.addEventListener("offline", disconnect);
    void loop();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      controller?.abort();
      window.removeEventListener("online", reconnect);
      window.removeEventListener("offline", disconnect);
    };
  }, [refresh]);

  if (!available) return null;
  return (
    <section className="notifications" aria-label="Njoftimet">
      <details>
        <summary aria-label={`Njoftimet, ${payload.tePalexuara} të palexuara`}>
          <span aria-hidden="true">🔔</span>
          <span className="notification-badge">{payload.tePalexuara}</span>
        </summary>
        <div className="notification-panel">
          <div className="notification-panel__header"><strong>Njoftimet</strong><span>{payload.tePalexuara} të palexuara</span></div>
          {offline && <p className="notification-warning" role="status">Po rilidhemi…</p>}
          {error && <p className="notification-error" role="alert">{error}</p>}
          {payload.njoftimet.length === 0 ? <p>Nuk ke njoftime ende.</p> : <ul className="notification-list">
            {payload.njoftimet.map(notification => <li key={notification.id} className={notification.lexuarMe ? "notification notification--read" : "notification"}>
              <Link href={`/njoftimet/${encodeURIComponent(notification.id)}`} onClick={() => setToast(null)}>
                <span>{notification.lexuarMe ? "" : "I PALEXUAR · "}Shoferi {notification.emriShoferit} e pranoi kërkesën tënde.</span>
                <small>{notification.nisja} → {notification.destinacioni} · Kërkesa {notification.kerkesaId}</small>
              </Link>
            </li>)}
          </ul>}
        </div>
      </details>
      {toast && <p className="notification-toast" role="status">🔔 Shoferi e pranoi kërkesën tënde. <Link href={`/njoftimet/${encodeURIComponent(toast.id)}`} onClick={() => setToast(null)}>Hape</Link></p>}
    </section>
  );
}
