# Java 4 — RideShare me Neon

## Prova 1 — Ndryshimi ruhet në databazë

**Hapat:** Në Neon SQL Editor ndryshova përkohësisht orën e udhëtimit me ID `2` nga `08:15` në `08:25`. Rifreskova aplikacionin dhe kontrollova listën e udhëtimeve dhe detajet te `/udhetimi/2`. Në fund e riktheva orën në `08:15`.

**Rezultati:** Ora `08:25` u shfaq në listën e udhëtimeve dhe në faqen e detajit `/udhetimi/2`. Pas rikthimit, ora u shfaq përsëri `08:15`.

## Prova 2 — Lista bosh nuk është gabim lidhjeje

**Hapat:** Në funksionin `lexoUdhetimet` shtova përkohësisht `WHERE false` në pyetjen SQL dhe rifreskova aplikacionin. Pas testimit e hoqa përsëri `WHERE false`.

**Rezultati:** Lista e udhëtimeve u shfaq bosh me mesazhin “Nuk ka udhëtime për momentin.” Kjo konfirmoi se një listë pa rezultate trajtohet si listë bosh dhe jo si gabim lidhjeje. Pas heqjes së `WHERE false`, tri kartat e udhëtimeve u shfaqën përsëri.

## Prova 3 — Lidhja mungon dhe rikthehet

**Hapat:** Në `.env.local` riemërtova përkohësisht `DATABASE_URL` në `DATABASE_URL_PA_TEST`, ndalova dhe rinisa serverin dhe rifreskova aplikacionin. Pastaj e riktheva `DATABASE_URL` dhe rinisa serverin përsëri.

**Rezultati:** Kur `DATABASE_URL` mungonte, aplikacioni shfaqi mesazhin “Nuk u lidhëm me databazën. Provo përsëri.” Pas rikthimit të `DATABASE_URL`, aplikacioni u lidh përsëri me Neon dhe tri kartat e udhëtimeve u shfaqën normalisht.

## Çfarë nuk punon ende

Kërkesa për vend mbetet simulim: nuk ruhet asnjë rezervim në databazë dhe nuk njoftohet shoferi.
