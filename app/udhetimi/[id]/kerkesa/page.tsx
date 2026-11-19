import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { merrProfilin } from "@/lib/profilet";
import { lexoGjendjenKerkesave } from "@/lib/kerkesa";
import { KerkesaLive } from "@/components/KerkesaLive";

export const dynamic = "force-dynamic";

export default async function Kerkesa({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let udhetim;

  try {
    udhetim = await gjejUdhetimin(id);
  } catch {
    return (
      <main>
        <p className="eyebrow">RideShare</p>
        <h1>Nuk u lidhëm me databazën.</h1>
        <p role="alert">Provo përsëri pasi të kontrollosh lidhjen me Neon.</p>
        <Link className="action" href="/">Kthehu te lista</Link>
      </main>
    );
  }

  if (!udhetim) notFound();

  const profili = await merrProfilin().catch(() => null);
  const state = profili ? await lexoGjendjenKerkesave(id, profili.id).catch(() => null) : null;

  return (
    <main>
      <Link className="back-link" href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
      {state ? <KerkesaLive udhetimiId={id} fillestare={state} /> : <section className="status-card"><h1>Ky veprim kërkon hyrje.</h1><p>Kyçju me GitHub për të dërguar ose menaxhuar kërkesën.</p></section>}
    </main>
  );
}
