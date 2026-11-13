import "server-only";

import { auth } from "@/lib/auth";
import { getSql } from "@/lib/db";

export type GjendjePreferencash = {
  ruajtur: boolean;
  numer: number;
};

export type PreferencaSql = ReturnType<typeof getSql>;

export function validoUdhetimId(udhetimiId: unknown): udhetimiId is string {
  return typeof udhetimiId === "string" && udhetimiId.trim().length > 0 && udhetimiId.length <= 100;
}

export async function lexoGjendjenEPreferencave(
  udhetimiId: string,
  perdoruesiId: string,
  sql: PreferencaSql = getSql(),
): Promise<GjendjePreferencash> {
  const rows = await sql`
    SELECT
      EXISTS (
        SELECT 1
        FROM preferencat_udhetimeve
        WHERE perdoruesi_id = ${perdoruesiId} AND udhetimi_id = ${udhetimiId}
      ) AS ruajtur,
      COUNT(*)::int AS numer
    FROM preferencat_udhetimeve
    WHERE udhetimi_id = ${udhetimiId}
  `;

  const row = rows[0] as { ruajtur: boolean; numer: number } | undefined;
  return { ruajtur: row?.ruajtur === true, numer: Number(row?.numer ?? 0) };
}

export async function ruajPreferencen(
  udhetimiId: string,
  perdoruesiId: string,
  sql: PreferencaSql = getSql(),
): Promise<GjendjePreferencash> {
  const rows = await sql`
    WITH udhetimi_ekziston AS (
      SELECT id FROM udhetimet WHERE id = ${udhetimiId}
    ),
    shtuar AS (
      INSERT INTO preferencat_udhetimeve (perdoruesi_id, udhetimi_id)
      SELECT ${perdoruesiId}, id FROM udhetimi_ekziston
      ON CONFLICT (perdoruesi_id, udhetimi_id) DO NOTHING
      RETURNING udhetimi_id
    )
    SELECT
      EXISTS (SELECT 1 FROM udhetimi_ekziston) AS udhetimi_ekziston,
      EXISTS (
        SELECT 1
        FROM preferencat_udhetimeve
        WHERE perdoruesi_id = ${perdoruesiId} AND udhetimi_id = ${udhetimiId}
      ) AS ruajtur,
      COUNT(*)::int AS numer
    FROM preferencat_udhetimeve
    WHERE udhetimi_id = ${udhetimiId}
  `;

  const row = rows[0] as {
    udhetimi_ekziston: boolean;
    ruajtur: boolean;
    numer: number;
  } | undefined;

  if (!row?.udhetimi_ekziston) {
    throw new Error("UDHETIMI_NUK_EKZISTON");
  }

  return { ruajtur: row.ruajtur === true, numer: Number(row.numer ?? 0) };
}

export async function merrGjendjenEServerit(
  udhetimiId: string,
): Promise<GjendjePreferencash | null> {
  const session = await auth();
  const perdoruesiId = session?.user?.id;

  if (!perdoruesiId || !/^\d+$/.test(perdoruesiId)) return null;

  return lexoGjendjenEPreferencave(udhetimiId, perdoruesiId);
}
