# Java 4 — RideShare me Neon

## Prova 1 — Ndryshimi ruhet në databazë

**Hapat:** Në Neon SQL Editor ndryshova përkohësisht orën e nisjes së udhëtimit me ID `2` nga `08:15` në `08:25`. Pas rifreskimit të aplikacionit, ndryshimi u shfaq në listën e udhëtimeve dhe në faqen e detajit të udhëtimit `/udhetimi/2`. Në fund e riktheva vlerën në `08:15`.

**Rezultati:** Ndryshimi i ruajtur në Neon u shfaq në aplikacion si në listë ashtu edhe në faqen e detajit. Pas rikthimit, udhëtimi me ID `2` u kthye në `08:15`.

## Prova 2 — Lista bosh nuk është gabim lidhjeje

**Hapat:** Shtova përkohësisht `WHERE false` te pyetja e `lexoUdhetimet`, ruajta ndryshimin dhe rifreskova aplikacionin. Pas provës e hoqa përsëri kushtin `WHERE false`.

**Rezultati:** Lista e udhëtimeve u shfaq bosh, duke konfirmuar se aplikacioni e dallon një listë pa rezultate nga një problem me lidhjen e databazës.

## Prova 3 — Lidhja mungon dhe rikthehet

**Hapat:** Riemërtova përkohësisht `DATABASE_URL` në `.env.local`, rinisa serverin dhe rifreskova aplikacionin. Më pas e riktheva emrin në `DATABASE_URL`, rinisa serverin dhe rifreskova përsëri.

**Rezultati:** Kur `DATABASE_URL` mungonte, aplikacioni shfaqi mesazhin **“Nuk u lidh me databazën”**. Pas rikthimit të `DATABASE_URL`, aplikacioni u lidh përsëri me Neon dhe tri kartat e udhëtimeve u shfaqën normalisht.

## Çfarë nuk punon ende

Kërkesa për vend mbetet simulim: nuk shkruhet asnjë rezervim në databazë dhe nuk njoftohet shoferi.
