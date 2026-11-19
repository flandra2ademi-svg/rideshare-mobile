import "server-only";

import { getSql } from "@/lib/db";

export type KerkeseStatus = "pending" | "accepted";
export type Kerkese = { id: string; status: KerkeseStatus; emri: string };
export type GjendjeKerkesash = {
  udhetim: { id: string; nisja: string; destinacioni: string; ora: string; vendtakimi: string; vende: number };
  eshteShofer: boolean;
  kerkesaIme: { id: string; status: KerkeseStatus } | null;
  kerkesa: Kerkese[];
};

export function validoKerkeseId(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value) && value.length <= 20;
}

export async function lexoGjendjenKerkesave(udhetimiId: string, perdoruesiId: string, sql = getSql()): Promise<GjendjeKerkesash | null> {
  const rides = await sql`
    SELECT id, nisja, destinacioni, ora, vendtakimi, vende, shofer_id
    FROM udhetimet WHERE id = ${udhetimiId}
  `;
  if (rides.length === 0) return null;
  const ride = rides[0] as { id: string; nisja: string; destinacioni: string; ora: string; vendtakimi: string; vende: number; shofer_id: string | null };
  const profile = await sql`SELECT id, roli FROM profilet WHERE id = ${perdoruesiId}`;
  const eshteShofer = profile[0]?.roli === "shofer" && ride.shofer_id === perdoruesiId;
  const own = await sql`
    SELECT id::text, status FROM kerkesa_udhetimeve
    WHERE udhetimi_id = ${udhetimiId} AND udhetari_id = ${perdoruesiId}
  `;
  const incoming = eshteShofer ? await sql`
    SELECT k.id::text, k.status, p.emri
    FROM kerkesa_udhetimeve k JOIN profilet p ON p.id = k.udhetari_id
    WHERE k.udhetimi_id = ${udhetimiId}
    ORDER BY k.krijuar_me ASC
  ` : [];
  const ownRow = own[0] as { id: string; status: KerkeseStatus } | undefined;
  return {
    udhetim: { id: ride.id, nisja: ride.nisja, destinacioni: ride.destinacioni, ora: ride.ora, vendtakimi: ride.vendtakimi, vende: Number(ride.vende) },
    eshteShofer,
    kerkesaIme: ownRow ? { id: ownRow.id, status: ownRow.status } : null,
    kerkesa: incoming as Kerkese[],
  };
}

export async function krijoKerkese(udhetimiId: string, udhetariId: string, sql = getSql()) {
  const rows = await sql`
    INSERT INTO kerkesa_udhetimeve (udhetimi_id, udhetari_id)
    SELECT ${udhetimiId}, ${udhetariId}
    WHERE EXISTS (SELECT 1 FROM udhetimet WHERE id = ${udhetimiId} AND vende > 0 AND shofer_id IS DISTINCT FROM ${udhetariId})
    ON CONFLICT (udhetimi_id, udhetari_id) DO NOTHING
    RETURNING id::text, status
  `;
  if (rows.length === 0) {
    const existing = await sql`SELECT id::text, status FROM kerkesa_udhetimeve WHERE udhetimi_id = ${udhetimiId} AND udhetari_id = ${udhetariId}`;
    if (existing.length > 0) return existing[0];
    throw new Error("UDHETIMI_NUK_EKZISTON_OSE_PRONESIA");
  }
  return rows[0];
}

export async function pranoKerkesen(kerkesaId: string, shoferId: string, sql = getSql()) {
  const rows = await sql`SELECT * FROM prano_kerkese(${kerkesaId}::BIGINT, ${shoferId})`;
  if (rows.length === 0) throw new Error("PRANIMI_DESHTOI");
  return rows[0] as { kerkesa_id: string; udhetimi_id: string; vende: number; status: "accepted" };
}
