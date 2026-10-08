import { KartaUdhetimi } from "@/components/KartaUdhetimi";
import { lexoUdhetimet, type Udhetim } from "@/lib/udhetimet";

export const dynamic = "force-dynamic";

export default async function Home() {
  let udhetimet: Udhetim[];

  try {
    udhetimet = await lexoUdhetimet();
  } catch {
    return (
      <main>
        <p className="eyebrow">RideShare</p>
        <h1>Nuk u lidhëm me databazën.</h1>
        <p role="alert">Provo përsëri pasi të kontrollosh lidhjen me Neon.</p>
        <a className="action" href="/">Provo përsëri</a>
      </main>
    );
  }

  return (
    <main>
      <p className="eyebrow">RideShare</p>
      <h1>Udhëtimet për AAB</h1>
      <p className="intro">
        Burimi: Neon · të dhëna fiktive për ushtrime
      </p>
      {udhetimet.length === 0 ? (
        <p>Nuk ka udhëtime për momentin.</p>
      ) : (
        <div className="trip-list">
          {udhetimet.map((udhetim) => (
            <KartaUdhetimi key={udhetim.id} udhetim={udhetim} />
          ))}
        </div>
      )}
    </main>
  );
}
