import "server-only";

import { getSql } from "@/lib/db";

export type Njoftim = {
  id: string;
  kerkesaId: string;
  udhetimiId: string;
  lloji: "accepted";
  krijuarMe: string;
  lexuarMe: string | null;
  emriShoferit: string;
  nisja: string;
  destinacioni: string;
  ora: string;
  statusKerkese: "pending" | "accepted";
  vende: number;
};

export function validoNjoftimId(value: unknown): value is string {
  return typeof value === "string" && /^\d+$/.test(value) && value.length <= 20;
}

function mapNjoftim(row: Record<string, unknown>): Njoftim {
  return {
    id: String(row.id),
    kerkesaId: String(row.kerkesa_id),
    udhetimiId: String(row.udhetimi_id),
    lloji: row.lloji as "accepted",
    krijuarMe: String(row.krijuar_me),
    lexuarMe: row.lexuar_me ? String(row.lexuar_me) : null,
    emriShoferit: String(row.emri_shoferit),
    nisja: String(row.nisja),
    destinacioni: String(row.destinacioni),
    ora: String(row.ora),
    statusKerkese: row.status_kerkese as "pending" | "accepted",
    vende: Number(row.vende),
  };
}

export async function lexoNjoftimet(perdoruesiId: string, sql = getSql()) {
  const rows = await sql`
    SELECT n.id::text, n.kerkesa_id::text, k.udhetimi_id::text,
           n.lloji, n.krijuar_me, n.lexuar_me,
           shofer.emri AS emri_shoferit,
           u.nisja, u.destinacioni, u.ora, k.status AS status_kerkese, u.vende
    FROM njoftimet n
    JOIN kerkesa_udhetimeve k ON k.id = n.kerkesa_id
    JOIN udhetimet u ON u.id = k.udhetimi_id
    LEFT JOIN profilet shofer ON shofer.id = u.shofer_id
    WHERE n.perdoruesi_id = ${perdoruesiId}
    ORDER BY n.krijuar_me DESC, n.id DESC
  `;
  const unread = await sql`
    SELECT COUNT(*)::int AS count
    FROM njoftimet
    WHERE perdoruesi_id = ${perdoruesiId} AND lexuar_me IS NULL
  `;
  return { njoftimet: rows.map(row => mapNjoftim(row as Record<string, unknown>)), tePalexuara: Number(unread[0]?.count ?? 0) };
}

export async function gjejNjoftimin(id: string, perdoruesiId: string, sql = getSql()) {
  const rows = await sql`
    SELECT n.id::text, n.kerkesa_id::text, k.udhetimi_id::text,
           n.lloji, n.krijuar_me, n.lexuar_me,
           shofer.emri AS emri_shoferit,
           u.nisja, u.destinacioni, u.ora, k.status AS status_kerkese, u.vende
    FROM njoftimet n
    JOIN kerkesa_udhetimeve k ON k.id = n.kerkesa_id
    JOIN udhetimet u ON u.id = k.udhetimi_id
    LEFT JOIN profilet shofer ON shofer.id = u.shofer_id
    WHERE n.id = ${id} AND n.perdoruesi_id = ${perdoruesiId}
  `;
  return rows[0] ? mapNjoftim(rows[0] as Record<string, unknown>) : null;
}

export async function shenoNjoftiminLexuar(id: string, perdoruesiId: string, sql = getSql()) {
  const rows = await sql`
    UPDATE njoftimet
    SET lexuar_me = COALESCE(lexuar_me, NOW())
    WHERE id = ${id} AND perdoruesi_id = ${perdoruesiId}
    RETURNING id::text, lexuar_me
  `;
  return rows[0] ? { id: String(rows[0].id), lexuarMe: String(rows[0].lexuar_me) } : null;
}
