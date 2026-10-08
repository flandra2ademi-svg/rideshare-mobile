# Java 4 - RideShare me Neon

## Prova 1 - Ndryshimi ruhet ne databaze

**Hapat:** Ne Neon SQL Editor ndryshova perkohesisht oren e udhetimit me ID `2` nga `08:15` ne `08:25`. Rifreskova aplikacionin dhe kontrollova listen e udhetimeve dhe detajet te `/udhetimi/2`. Ne fund e riktheva oren ne `08:15`.

**Rezultati:** Ora `08:25` u shfaq ne listen e udhetimeve dhe ne faqen e detajit `/udhetimi/2`. Pas rikthimit, ora u shfaq perseri `08:15`.

## Prova 2 - Lista bosh nuk eshte gabim lidhjeje

**Hapat:** Ne funksionin `lexoUdhetimet` shtova perkohesisht `WHERE false` ne pyetjen SQL dhe rifreskova aplikacionin. Pas testimit e hoqa perseri `WHERE false`.

**Rezultati:** Lista e udhetimeve u shfaq bosh me mesazhin "Nuk ka udhetime per momentin." Kjo konfirmoi se nje liste pa rezultate trajtohet si liste bosh dhe jo si gabim lidhjeje. Pas heqjes se `WHERE false`, tri kartat e udhetimeve u shfaqen perseri.

## Prova 3 - Lidhja mungon dhe rikthehet

**Hapat:** Ne `.env.local` riemerova perkohesisht `DATABASE_URL` ne `DATABASE_URL_PA_TEST`, ndalova dhe rinisa serverin dhe rifreskova aplikacionin. Pastaj e riktheva `DATABASE_URL` dhe rinisa serverin perseri.

**Rezultati:** Kur `DATABASE_URL` mungonte, aplikacioni shfaqi mesazhin "Nuk u lidhem me databazen. Provo perseri." Pas rikthimit te `DATABASE_URL`, aplikacioni u lidh perseri me Neon dhe tri kartat e udhetimeve u shfaqen normalisht.

## Cfare nuk punon ende

Kerkesa per vend mbetet simulim: nuk ruhet asnje rezervim ne databaze dhe nuk njoftohet shoferi.
