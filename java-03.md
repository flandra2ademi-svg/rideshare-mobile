# Java 3 — RideShare: kartat dhe faqet

## Prova 1

Hapat: hapa faqen kryesore në `http://localhost:3000` dhe e kontrollova në pamjen e telefonit me gjerësi 375 px.

Rezultati real: shfaqen saktësisht tri karta udhëtimi, lidhjet janë të prekshme dhe nuk ka lëvizje horizontale.

## Prova 2

Hapat: klikova kartën e dytë, pastaj hapa kartën e tretë dhe adresën `/udhetimi/99`.

Rezultati real: `/udhetimi/2` shfaq vendtakimin “Te stacioni kryesor”; karta e tretë shfaq butonin e çaktivizuar “Nuk ka vende të lira”, ndërsa `/udhetimi/99` shfaq “Udhëtimi nuk u gjet”.

## Prova 3

Hapat: nga detajet e udhëtimit të dytë klikova “Kërko vend”, pastaj përdora lidhjet e kthimit.

Rezultati real: hapet mesazhi “Simulim: Në pritje”, dhe lidhjet kthejnë te detajet ose te lista pa bërë rezervim real.

## Çfarë nuk punon ende

Kërkesa është vetëm simulim: nuk ruhet në databazë, nuk dërgohet te shoferi dhe nuk ka pagesë.
