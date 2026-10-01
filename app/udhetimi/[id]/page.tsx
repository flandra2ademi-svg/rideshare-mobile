import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";

export default async function Detajet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const udhetim = gjejUdhetimin(id);
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
