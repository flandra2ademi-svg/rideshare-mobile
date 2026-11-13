import { auth } from "@/lib/auth";
import {
  lexoGjendjenEPreferencave,
  ruajPreferencen,
  validoUdhetimId,
} from "@/lib/preferencat";

export const dynamic = "force-dynamic";

function identitetiNgaSesioni(session: Awaited<ReturnType<typeof auth>>): string | null {
  const id = session?.user?.id;
  return id && /^\d+$/.test(id) ? id : null;
}

export async function GET(request: Request) {
  const perdoruesiId = identitetiNgaSesioni(await auth());
  if (!perdoruesiId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401 });

  const udhetimiId = new URL(request.url).searchParams.get("rideId");
  if (!validoUdhetimId(udhetimiId)) {
    return Response.json({ error: "ID-ja e udhëtimit nuk është e vlefshme." }, { status: 400 });
  }

  try {
    return Response.json(await lexoGjendjenEPreferencave(udhetimiId, perdoruesiId));
  } catch {
    return Response.json({ error: "Preferencat nuk u lexuan." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const perdoruesiId = identitetiNgaSesioni(await auth());
  if (!perdoruesiId) return Response.json({ error: "Duhet të jesh i kyçur." }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Trupi i kërkesës nuk është JSON." }, { status: 400 });
  }

  const udhetimiId = typeof body === "object" && body !== null && "rideId" in body
    ? (body as { rideId?: unknown }).rideId
    : undefined;
  if (!validoUdhetimId(udhetimiId)) {
    return Response.json({ error: "ID-ja e udhëtimit nuk është e vlefshme." }, { status: 400 });
  }

  try {
    return Response.json(await ruajPreferencen(udhetimiId, perdoruesiId));
  } catch (error) {
    if (error instanceof Error && error.message === "UDHETIMI_NUK_EKZISTON") {
      return Response.json({ error: "Udhëtimi nuk u gjet." }, { status: 404 });
    }
    return Response.json({ error: "Udhëtimi nuk u ruajt." }, { status: 500 });
  }
}
