# Java 4 — RideShare me Neon

## Prova 1 — Ndryshimi ruhet në databazë

**Hapat:** Në Neon SQL Editor ndryshova përkohësisht orën e udhëtimit me ID `2` nga `08:15` në `08:25`. Rifreskova listën e udhëtimeve dhe hapa detajet e `/udhetimi/2`.

**Rezultati:** Ora `08:25` u shfaq në kartën e udhëtimit në listë dhe në faqen e detajit `/udhetimi/2`. Kjo konfirmoi se ndryshimi në Neon u lexua nga aplikacioni. Në fund e riktheva ID `2` në `08:15` dhe kontrollova që vlera u rikthye.

## Prova 2 — Lista bosh nuk është gabim lidhjeje

**Hapat:** Në funksionin `lexoUdhetimet` shtova përkohësisht `WHERE false` te pyetja SQL, ruajta ndryshimin dhe rifreskova aplikacionin. Pas testimit e hoqa përsëri `WHERE false`.

**Rezultati:** Të tri kartat e udhëtimeve u zhdukën dhe lista u shfaq bosh me mesazhin **“Nuk ka udhëtime për momentin.”** Kjo konfirmoi se një rezultat bosh i databazës trajtohet si listë bosh dhe jo si gabim lidhjeje. Pas heqjes së `WHERE false`, tri kartat u shfaqën përsëri.

## Prova 3 — Lidhja mungon dhe rikthehet

**Hapat:** Në `.env.local` riemërtova përkohësisht `DATABASE_URL` në `DATABASE_URL_TEST`, ndalova dhe rinisa serverin dhe rifreskova aplikacionin. Më pas e riktheva emrin në `DATABASE_URL` dhe rinisa serverin përsëri.

**Rezultati:** Kur `DATABASE_URL` mungonte, aplikacioni shfaqi mesazhin **“Nuk u lidh me databazën”**. Pas rikthimit të `DATABASE_URL`, aplikacioni u lidh përsëri me Neon dhe tri kartat e udhëtimeve u shfaqën normalisht.

## Çfarë nuk punon ende

Kërkesa për vend mbetet simulim: nuk shkruhet asnjë rezervim në databazë dhe nuk njoftohet shoferi.
