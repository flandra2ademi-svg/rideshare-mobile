"use client";

import { useState } from "react";
import type { GjendjePreferencash } from "@/lib/preferencat";

type Props = { udhetimiId: string; fillestare: GjendjePreferencash };

export function PreferencaUdhetimi({ udhetimiId, fillestare }: Props) {
  const [ruajtur, setRuajtur] = useState(fillestare.ruajtur);
  const [numer, setNumer] = useState(fillestare.numer);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");

  const ruaj = async () => {
    if (status === "pending" || ruajtur) return;
    const ruajturMePare = ruajtur;
    const numerMePare = numer;
    setRuajtur(true);
    setNumer(numer + 1);
    setStatus("pending");

    try {
      const response = await fetch("/api/preferencat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId: udhetimiId }),
      });
      const result = await response.json() as GjendjePreferencash & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Ruajtja dështoi");
      setRuajtur(result.ruajtur);
      setNumer(result.numer);
      setStatus("success");
    } catch {
      setRuajtur(ruajturMePare);
      setNumer(numerMePare);
      setStatus("error");
    }
  };

  const tekst = status === "pending"
    ? "Po ruhet…"
    : status === "success"
      ? "U ruajt te të preferuarat."
      : status === "error"
        ? "Nuk u ruajt. Provo përsëri."
        : ruajtur
          ? "U ruajt te të preferuarat."
          : "Nuk është te të preferuarat.";

  return (
    <section className="favorite-card" aria-label="Të preferuarat">
      <button
        type="button"
        className="favorite-button"
        onClick={ruaj}
        disabled={status === "pending" || ruajtur}
        aria-pressed={ruajtur}
        aria-label={ruajtur ? "Udhëtimi është te të preferuarat" : "Ruaj udhëtimin"}
      >
        <span aria-hidden="true">{ruajtur ? "★" : "☆"}</span>
        <span>{ruajtur ? "U ruajt" : "Ruaj udhëtimin"}</span>
      </button>
      <p className="favorite-status" role="status" aria-live="polite">{tekst}</p>
      <p className="favorite-count">Të preferuara për këtë udhëtim: {numer}</p>
    </section>
  );
}
