import Link from "next/link";
import type { Udhetim } from "@/lib/udhetimet";

export function KartaUdhetimi({ udhetim }: { udhetim: Udhetim }) {
  return (
    <article className="trip-card">
      <div className="trip-card__topline">
        <span className="time">{udhetim.ora}</span>
        <span className={udhetim.vende > 0 ? "availability" : "availability availability--full"}>
          {udhetim.vende > 0 ? `${udhetim.vende} vende të lira` : "E plotë"}
        </span>
      </div>
      <h2>{udhetim.nisja} <span aria-hidden="true">→</span> {udhetim.destinacioni}</h2>
      <p>Vendtakimi: {udhetim.vendtakimi}</p>
      <Link className="action" href={`/udhetimi/${udhetim.id}`}>
        Shiko detajet <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
