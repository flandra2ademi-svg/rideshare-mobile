import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import { udhetimet } from "@/lib/udhetimet";

export default function Home() {
  return (
    <main>
      <p className="eyebrow">RideShare</p>
      <h1>Udhëtimet për AAB</h1>
      <p className="intro">
        Zgjidh një nisje dhe lexo detajet para se të dërgosh kërkesën.
      </p>
      <div className="trip-list">
        {udhetimet.map((udhetim) => (
          <KartaUdhetimi key={udhetim.id} udhetim={udhetim} />
        ))}
      </div>
    </main>
  );
}
