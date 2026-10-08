# Java 4 — RideShare me Neon

## Prova 1

**Hapat:** Në Neon SQL Editor ndryshova orën e udhëtimit me ID `2` nga `08:15` në `08:25`. Rifreskova aplikacionin dhe kontrollova listën dhe detajet te `/udhetimi/2`. Pastaj e riktheva orën në `08:15`.

**Rezultati:** Ora `08:25` u shfaq në listën e udhëtimeve dhe në detajet e udhëtimit `/udhetimi/2`. Pas rikthimit, ora u shfaq përsëri `08:15`.

## Prova 2

**Hapat:** Në funksionin `lexoUdhetimet` shtova përkohësisht `WHERE false` në pyetjen SQL dhe rifreskova aplikacionin. Pastaj e hoqa `WHERE false`.

**Rezultati:** Lista u shfaq bosh me mesazhin “Nuk ka udhëtime për momentin.” Pas heqjes së `WHERE false`, tri kartat e udhëtimeve u shfaqën përsëri.

## Prova 3

**Hapat:** Në `.env.local` riemërtova përkohësisht `DATABASE_URL` në `DATABASE_URL_PA_TEST`, ndalova dhe rinisa serverin dhe rifreskova aplikacionin. Pastaj e riktheva `DATABASE_URL` dhe rinisa serverin përsëri.

**Rezultati:** Kur `DATABASE_URL` mungonte, aplikacioni shfaqi mesazhin “Nuk u lidhëm me databazën. Provo përsëri.” Pas rikthimit të `DATABASE_URL`, tri kartat e udhëtimeve u shfaqën përsëri normalisht.

## Çfarë nuk punon ende

Kërkesa për vend mbetet simulim: nuk ruhet asnjë rezervim në databazë dhe nuk njoftohet shoferi.
