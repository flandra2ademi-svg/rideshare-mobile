import { auth } from "@/lib/auth";
import { gjejNjoftimin, shenoNjoftiminLexuar, validoNjoftimId } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

function identiteti(session: Awaited<ReturnType<typeof auth>>) {
  const id = session?.user?.id;
  return id && /^\d+$/.test(id) ? id : null;
}

async function contextId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return validoNjoftimId(id) ? id : null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = identiteti(await auth());
  if (!userId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401, headers });
  const id = await contextId(context);
  if (!id) return Response.json({ error: "ID-ja e njoftimit nuk është e vlefshme." }, { status: 400, headers });
  try {
    const notification = await gjejNjoftimin(id, userId);
    return notification
      ? Response.json({ notification }, { headers })
      : Response.json({ error: "Njoftimi nuk u gjet." }, { status: 404, headers });
  } catch {
    return Response.json({ error: "Njoftimi nuk u lexua." }, { status: 503, headers });
  }
}

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = identiteti(await auth());
  if (!userId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401, headers });
  const id = await contextId(context);
  if (!id) return Response.json({ error: "ID-ja e njoftimit nuk është e vlefshme." }, { status: 400, headers });
  try {
    const notification = await shenoNjoftiminLexuar(id, userId);
    return notification
      ? Response.json({ notification }, { headers })
      : Response.json({ error: "Njoftimi nuk u gjet." }, { status: 404, headers });
  } catch {
    return Response.json({ error: "Njoftimi nuk u shënua si i lexuar." }, { status: 503, headers });
  }
}
