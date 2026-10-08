# Java 4 — RideShare me Neon

## Prova 1 — Ndryshimi ruhet në databazë

**Hapat:** Në Neon SQL Editor ekzekuto `UPDATE udhetimet SET ora = '08:25' WHERE id = '2';`, pastaj rifresko listën dhe `/udhetimi/2`. Në fund rikthe vlerën `08:15`.

**Rezultati:** Plotësoje pasi të kesh provuar ndryshimin në databazën tënde.

## Prova 2 — Lista bosh nuk është gabim lidhjeje

**Hapat:** Shto përkohësisht `WHERE false` te pyetja e `lexoUdhetimet`, ruaj dhe rifresko. Hiqe kushtin pas provës.

**Rezultati:** Plotësoje pasi të konfirmosh mesazhin “Nuk ka udhëtime për momentin.”

## Prova 3 — Lidhja mungon dhe rikthehet

**Hapat:** Riemërto përkohësisht `DATABASE_URL` në `.env.local`, rinis serverin dhe rifresko. Rikthe emrin e saktë dhe rinis serverin.

**Rezultati:** Plotësoje pasi të konfirmosh mesazhin e gabimit dhe rikthimin e tri kartave.

## Çfarë nuk punon ende

Kërkesa për vend mbetet simulim: nuk shkruhet asnjë rezervim në databazë dhe nuk njoftohet shoferi.
