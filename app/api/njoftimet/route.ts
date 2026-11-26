import { auth } from "@/lib/auth";
import { lexoNjoftimet } from "@/lib/njoftimet";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

function identiteti(session: Awaited<ReturnType<typeof auth>>) {
  const id = session?.user?.id;
  return id && /^\d+$/.test(id) ? id : null;
}

export async function GET() {
  const userId = identiteti(await auth());
  if (!userId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401, headers });
  try {
    return Response.json(await lexoNjoftimet(userId), { headers });
  } catch {
    return Response.json({ error: "Njoftimet nuk u lexuan." }, { status: 503, headers });
  }
}
