import { auth } from "@/lib/auth";
import { krijoKerkese, lexoGjendjenKerkesave, pranoKerkesen, validoKerkeseId } from "@/lib/kerkesa";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0" };

function identiteti(session: Awaited<ReturnType<typeof auth>>) {
  const id = session?.user?.id;
  return id && /^\d+$/.test(id) ? id : null;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = identiteti(await auth());
  if (!userId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401, headers });
  const { id } = await context.params;
  if (!validoKerkeseId(id)) return Response.json({ error: "ID-ja e udhëtimit nuk është e vlefshme." }, { status: 400, headers });
  try {
    const state = await lexoGjendjenKerkesave(id, userId);
    if (!state) return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404, headers });
    return Response.json(state, { headers });
  } catch { return Response.json({ error: "Gjendja nuk u lexua." }, { status: 503, headers }); }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = identiteti(await auth());
  if (!userId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401, headers });
  const { id } = await context.params;
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Trupi i kërkesës nuk është JSON." }, { status: 400, headers }); }
  const action = typeof body === "object" && body !== null && "action" in body ? (body as { action?: unknown }).action : undefined;
  try {
    if (action === "accept") {
      const requestId = typeof body === "object" && body !== null && "requestId" in body ? (body as { requestId?: unknown }).requestId : undefined;
      if (!validoKerkeseId(requestId)) return Response.json({ error: "ID-ja e kërkesës nuk është e vlefshme." }, { status: 400, headers });
      return Response.json({ accepted: await pranoKerkesen(requestId, userId) }, { headers });
    }
    if (action !== "create" || !validoKerkeseId(id)) return Response.json({ error: "Veprimi nuk është i vlefshëm." }, { status: 400, headers });
    const created = await krijoKerkese(id, userId);
    return Response.json({ request: created }, { status: 201, headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "UDHETIMI_NUK_EKZISTON_OSE_PRONESIA") return Response.json({ error: "Udhëtimi nuk u gjet ose nuk mund të kërkosh vendin tënd." }, { status: 404, headers });
    if (message === "NUK_JE_PRONAR") return Response.json({ error: "Vetëm pronari i këtij udhëtimi mund ta pranojë kërkesën." }, { status: 403, headers });
    if (message === "NUK_KA_VENDE") return Response.json({ error: "Nuk ka më vende të lira." }, { status: 409, headers });
    if (message === "KERKESA_NUK_EKZISTON") return Response.json({ error: "Kërkesa nuk u gjet." }, { status: 404, headers });
    return Response.json({ error: "Veprimi nuk u krye." }, { status: 500, headers });
  }
}
