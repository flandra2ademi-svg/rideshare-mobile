
"use server";

import { auth } from "@/auth";
import { getSql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function ndryshoOren(formData: FormData) {
  const session = await auth();
  const githubId = session?.user?.id;

  if (!githubId || !/^\d+$/.test(githubId)) {
    return { error: "Duhet të identifikohesh me GitHub." };
  }

  const id = formData.get("id");
  const ora = formData.get("ora");

  if (typeof id !== "string" || !/^[123]$/.test(id)) {
    return { error: "ID duhet të jetë 1, 2 ose 3." };
  }

  if (typeof ora !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(ora)) {
    return { error: "Ora nuk është e vlefshme." };
  }

  let rows;
  try {
    const sql = getSql();

    rows = await sql`
    UPDATE udhetimet
    SET ora = ${ora}
    WHERE id = ${id}
      AND shofer_id = (
        SELECT id FROM profilet
        WHERE github_id = ${githubId} AND roli = 'shofer'
      )
    RETURNING id
  `;
  } catch {
    return { error: "Nuk u lidhëm me databazën. Provo përsëri." };
  }

  if (rows.length === 0) {
    return { error: "Nuk ke leje ta ndryshosh këtë udhëtim." };
  }

  revalidatePath("/");
  revalidatePath(`/udhetimi/${id}`);
  revalidatePath("/panel");

  return { success: true };
}
