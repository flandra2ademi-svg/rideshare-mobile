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
  const udhetimet = await sql`
    SELECT id FROM udhetimet WHERE id = ${udhetimiId}
  `;

  if (udhetimet.length === 0) {
    throw new Error("UDHETIMI_NUK_EKZISTON");
  }

  await sql`
    INSERT INTO preferencat_udhetimeve (perdoruesi_id, udhetimi_id)
    VALUES (${perdoruesiId}, ${udhetimiId})
    ON CONFLICT (perdoruesi_id, udhetimi_id) DO NOTHING
  `;

  // This is deliberately a new statement: PostgreSQL data-modifying CTEs
  // use one snapshot, so their main SELECT cannot see the inserted row.
  return lexoGjendjenEPreferencave(udhetimiId, perdoruesiId, sql);
}

export async function merrGjendjenEServerit(
  udhetimiId: string,
): Promise<GjendjePreferencash | null> {
  const session = await auth();
  const perdoruesiId = session?.user?.id;

  if (!perdoruesiId || !/^\d+$/.test(perdoruesiId)) return null;

  return lexoGjendjenEPreferencave(udhetimiId, perdoruesiId);
}
