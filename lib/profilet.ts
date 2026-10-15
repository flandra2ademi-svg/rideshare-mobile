import "server-only";
import { auth } from "@/lib/auth";
import { getSql } from "./db";

export type Profil = {
  id: string;
  github_id: string;
  emri: string;
  roli: "udhetar" | "shofer";
};

export async function merrProfilin(): Promise<Profil | null> {
  const session = await auth();
  const githubId = session?.user?.id;

  if (!githubId || !/^\d+$/.test(githubId)) {
    return null;
  }

  const sql = getSql();

  const rows = await sql`
    INSERT INTO profilet (id, github_id, emri, roli)
    VALUES (
      ${githubId},
      ${githubId},
      ${session.user?.name ?? "Student"},
      'udhetar'
    )
    ON CONFLICT (github_id)
    DO UPDATE SET emri = EXCLUDED.emri
    RETURNING id, github_id, emri, roli
  `;

  return (rows[0] as Profil | undefined) ?? null;
}
