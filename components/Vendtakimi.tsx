"use client";

import { useState } from "react";

type LocationState = "idle" | "loading" | "success" | "denied" | "timeout" | "unavailable";

export function Vendtakimi({ showTestIds = false }: { showTestIds?: boolean }) {
  const [draft, setDraft] = useState("");
  const [confirmed, setConfirmed] = useState("");
  const [meetingError, setMeetingError] = useState("");
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [locationMessage, setLocationMessage] = useState("");
  const [accuracy, setAccuracy] = useState<number | null>(null);

  function confirmMeeting() {
    const value = draft.trim();
    if (!value) {
      setMeetingError("Shkruaj një vendtakim para konfirmimit.");
      return;
    }
    setConfirmed(value);
    setMeetingError("");
  }

  function locateMe() {
    setMeetingError("");
    setAccuracy(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationState("unavailable");
      setLocationMessage("Vendndodhja nuk mbështetet në këtë shfletues. Shkruaj vendtakimin vetë.");
      return;
    }
    setLocationState("loading");
    setLocationMessage("Po kërkojmë vendndodhjen…");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationState("success");
        setLocationMessage("Pozicioni u mor");
        setAccuracy(position.coords.accuracy);
      },
      (error) => {
        setAccuracy(null);
        if (error.code === 1) {
          setLocationState("denied");
          setLocationMessage("Leja u refuzua. Shkruaj vendtakimin vetë.");
        } else if (error.code === 3) {
          setLocationState("timeout");
          setLocationMessage("Koha e kërkimit mbaroi. Provo sërish ose shkruaj vendtakimin vetë.");
        } else {
          setLocationState("unavailable");
          setLocationMessage("Pozicioni nuk është i disponueshëm. Shkruaj vendtakimin vetë.");
        }
      },
      { timeout: 10000 },
    );
  }

  return (
    <section className="meeting-point" aria-label="Zgjedhja e vendtakimit">
      <h2>Zgjidh vendtakimin</h2>
      <label htmlFor="meeting-input">Shkruaj vendtakimin</label>
      <input id="meeting-input" type="text" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="p.sh. Biblioteka" data-testid={showTestIds ? "meeting-input" : undefined} />
      <button className="action" type="button" onClick={confirmMeeting} data-testid={showTestIds ? "confirm-meeting" : undefined}>Konfirmo në telefon</button>
      <p className="meeting-error" role="alert" data-testid={showTestIds ? "meeting-error" : undefined}>{meetingError}</p>
      <p className="confirmed-meeting" aria-live="polite" data-testid={showTestIds ? "confirmed-meeting" : undefined}>{confirmed ? `Vendtakimi i konfirmuar: ${confirmed}` : ""}</p>
      <button className="action action--secondary" type="button" onClick={locateMe} disabled={locationState === "loading"} data-testid={showTestIds ? "locate-me" : undefined}>{locationState === "loading" ? "Po kërkojmë…" : "Përdor vendndodhjen time"}</button>
      <p className="location-status" role="status" aria-live="polite" data-state={locationState} data-testid={showTestIds ? "location-status" : undefined}>{locationMessage}</p>
      <p className="location-accuracy" data-testid={showTestIds ? "location-accuracy" : undefined}>{accuracy === null ? "" : `Saktësia: ${Math.round(accuracy)} m`}</p>
    </section>
  );
}
