
import Link from "next/link";
import Hyrja from "@/components/Hyrja";
import { FormaNdryshoOren } from "@/components/FormaNdryshoOren";
import { merrProfilin } from "@/lib/profilet";
import { gjejUdhetimin } from "@/lib/udhetimet";
import { mundTeNdryshoje } from "@/lib/lejet";

export const dynamic = "force-dynamic";

export default async function PanelPage() {
  let profili;
  let udhetim;
  try {
    profili = await merrProfilin();
    if (profili?.roli === "shofer") udhetim = await gjejUdhetimin("2");
  } catch {
    return <main><h1>Paneli im</h1><p role="alert">Nuk u lidhëm me databazën. Provo përsëri.</p><Link href="/panel">Provo përsëri</Link></main>;
  }

  return (
    <main>
      <p className="eyebrow">RideShare</p>
      <h1>Paneli im</h1>
      {profili ? <>
        <p>Mirë se erdhe, {profili.emri}! Roli: <strong>{profili.roli}</strong>.</p>
        <p>ID ime GitHub: <code>{profili.github_id}</code></p>
      </> : <p>Lista është publike. Për panelin hyr me llogarinë tënde GitHub.</p>}
      <Hyrja brenda={Boolean(profili)} />
      {udhetim && mundTeNdryshoje(profili, udhetim) && (
        <section>
          <h2>Ndrysho orën e udhëtimit tim</h2>
          <FormaNdryshoOren id={udhetim.id} ora={udhetim.ora} />
        </section>
      )}
      {profili?.roli === "udhetar" && <p>Si udhëtar mund të shohësh udhëtimet; nuk mund të ndryshosh orën e shoferit.</p>}
      <p><Link href="/">Kthehu te udhëtimet</Link></p>
      <p>Kërkesa për vend mbetet simulim këtë javë.</p>
    </main>
  );
}
