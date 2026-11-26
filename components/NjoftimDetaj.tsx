"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Njoftim = {
  id: string;
  kerkesaId: string;
  udhetimiId: string;
  lexuarMe: string | null;
  emriShoferit: string;
  nisja: string;
  destinacioni: string;
  ora: string;
  statusKerkese: "pending" | "accepted";
  vende: number;
};

export function NjoftimDetaj({ id }: { id: string }) {
  const [notification, setNotification] = useState<Njoftim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readError, setReadError] = useState("");

  const markRead = async (notificationId: string) => {
    setReadError("");
    try {
      const response = await fetch(`/api/njoftimet/${encodeURIComponent(notificationId)}`, { method: "PATCH" });
      if (!response.ok) throw new Error("Leximi nuk u konfirmua nga serveri.");
      const result = await response.json() as { notification?: { lexuarMe: string } };
      if (!result.notification) throw new Error("Leximi nuk u konfirmua nga serveri.");
      setNotification(current => current ? { ...current, lexuarMe: result.notification?.lexuarMe ?? current.lexuarMe } : current);
    } catch (cause) {
      setReadError(cause instanceof Error ? cause.message : "Leximi nuk u ruajt.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/njoftimet/${encodeURIComponent(id)}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 404 ? "Njoftimi nuk u gjet ose nuk të përket." : "Njoftimi nuk u lexua.");
        const result = await response.json() as { notification: Njoftim };
        setNotification(result.notification);
        if (!result.notification.lexuarMe) await markRead(result.notification.id);
      } catch (cause) {
        if (!(cause instanceof DOMException && cause.name === "AbortError")) setError(cause instanceof Error ? cause.message : "Njoftimi nuk u lexua.");
      } finally { setLoading(false); }
    })();
    return () => controller.abort();
  }, [id]);

  if (loading) return <section className="status-card"><p>Po hapet njoftimi…</p></section>;
  if (error || !notification) return <section className="status-card"><p role="alert">{error || "Njoftimi nuk u gjet."}</p><Link className="action" href="/">Kthehu</Link></section>;
  return <section className="notification-detail" aria-label="Detajet e njoftimit">
    <p className="eyebrow">Njoftimi {notification.id}</p>
    <h1>Kërkesa u pranua</h1>
    <p>🎉 Shoferi <strong>{notification.emriShoferit}</strong> e pranoi kërkesën tënde.</p>
    <div className="detail-card">
      <p><strong>Kërkesa</strong><span>{notification.kerkesaId}</span></p>
      <p><strong>Udhëtimi</strong><span>{notification.nisja} → {notification.destinacioni}</span></p>
      <p><strong>Nisja</strong><span>{notification.ora}</span></p>
      <p><strong>Statusi i kërkesës</strong><span>{notification.statusKerkese === "accepted" ? "U pranua" : "Në pritje"}</span></p>
      <p><strong>Vende të lira</strong><span>{notification.vende}</span></p>
    </div>
    {notification.lexuarMe ? <p className="read-confirmation" role="status">Njoftimi u shënua si i lexuar nga serveri.</p> : <p className="notification-error" role="alert">Njoftimi mbetet i palexuar.</p>}
    {readError && <p className="notification-error" role="alert">{readError}</p>}
    {!notification.lexuarMe && <button className="action" type="button" onClick={() => void markRead(notification.id)}>Provo përsëri</button>}
    <div className="notification-detail__actions"><Link className="action" href={`/udhetimi/${encodeURIComponent(notification.udhetimiId)}/kerkesa`}>Hap kërkesën</Link><Link className="back-link" href="/">← Kthehu te njoftimet</Link></div>
  </section>;
}
