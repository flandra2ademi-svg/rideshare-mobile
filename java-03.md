# Java 3 — RideShare: kartat dhe faqet

## Prova 1 — Lista në telefon

**Hapat:** Hapa faqen kryesore në `http://localhost:3000` dhe e kontrollova në pamjen e telefonit me gjerësi 375 px.

**Rezultati:** U shfaqën saktësisht tri karta udhëtimi, lidhjet ishin të prekshme dhe nuk pati lëvizje horizontale.

## Prova 2 — Detajet dhe kufijtë

**Hapat:** Klikova kartën e dytë, pastaj hapa kartën e tretë dhe adresën `/udhetimi/99`.

**Rezultati:** `/udhetimi/2` shfaqi vendtakimin “Te stacioni kryesor”; karta e tretë shfaqi butonin e çaktivizuar “Nuk ka vende të lira”, ndërsa `/udhetimi/99` shfaqi “Udhëtimi nuk u gjet”.

## Prova 3 — Kërkesa dhe kthimi

**Hapat:** Nga detajet e udhëtimit të dytë klikova “Kërko vend”, pastaj përdora lidhjet e kthimit.

**Rezultati:** U hap mesazhi “Simulim: Në pritje”, dhe lidhjet u kthyen te detajet ose te lista pa bërë rezervim real.

## Çfarë nuk punon ende

Kërkesa është vetëm simulim: nuk ruhet në databazë, nuk dërgohet te shoferi dhe nuk ka pagesë.
