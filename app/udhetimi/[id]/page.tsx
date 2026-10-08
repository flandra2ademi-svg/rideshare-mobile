import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export default async function Detajet({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <main>
      <Link className="back-link" href="/">← Kthehu te lista</Link>
      <p className="eyebrow">Detajet e udhëtimit</p>
      <h1>{udhetim.nisja} <span aria-hidden="true">→</span> {udhetim.destinacioni}</h1>
      <section className="detail-card" aria-label="Të dhënat e udhëtimit">
        <p><strong>Ora</strong><span>{udhetim.ora}</span></p>
        <p><strong>Vendtakimi</strong><span>{udhetim.vendtakimi}</span></p>
        <p><strong>Vende të lira</strong><span>{udhetim.vende}</span></p>
      </section>
      {udhetim.vende > 0 ? (
        <Link className="action action--wide" href={`/udhetimi/${id}/kerkesa`}>Kërko vend</Link>
      ) : (
        <button className="action action--wide" disabled>Nuk ka vende të lira</button>
      )}
    </main>
  );
}
