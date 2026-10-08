import Link from "next/link";
import { notFound } from "next/navigation";
import { gjejUdhetimin } from "@/lib/udhetimet";

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

  return (
    <main>
      <Link className="back-link" href={`/udhetimi/${id}`}>← Kthehu te detajet</Link>
      {udhetim.vende > 0 ? (
        <section className="status-card" aria-live="polite">
          <p className="status-icon" aria-hidden="true">◷</p>
          <p className="eyebrow">Kërkesa për vend</p>
          <h1>Simulim: Në pritje</h1>
          <p>Kërkesa për udhëtimin nga {udhetim.nisja} nuk është dërguar te shoferi.</p>
          <p>Ruajtjen dhe konfirmimin real do t’i shtojmë më vonë.</p>
        </section>
      ) : (
        <section className="status-card"><h1>Nuk ka vende të lira.</h1><p>Ky udhëtim nuk pranon kërkesa të reja.</p></section>
      )}
    </main>
  );
}
