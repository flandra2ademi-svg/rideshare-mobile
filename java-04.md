# RideShare — Java 4 · Neon dhe PostgreSQL

## Çfarë ndërtova

Lista dhe detajet e udhëtimeve lexohen nga databaza Neon përmes funksioneve `lexoUdhetimet` dhe `gjejUdhetimin`. Lidhja me databazën përdor `DATABASE_URL` dhe mbahet vetëm në server. Aplikacioni shfaq veçmas rastin kur lista është bosh dhe rastin kur lidhja me databazën mungon.

## Provat që bëra

### Prova 1: Ndryshimi në databazë shfaqet në aplikacion

Ndryshova përkohësisht orën e udhëtimit me ID `2` nga `08:15` në `08:25` në Neon SQL Editor. Pas rifreskimit, `08:25` u shfaq në listën e udhëtimeve dhe në faqen e detajit `/udhetimi/2`. E riktheva orën në `08:15` dhe pas rifreskimit lista dhe detajet treguan përsëri `08:15`.

### Prova 2: Lista bosh dhe rikthimi

Shtova përkohësisht `WHERE false` vetëm te pyetja e `lexoUdhetimet` dhe rifreskova aplikacionin. Lista u shfaq bosh me mesazhin “Nuk ka udhëtime për momentin.” dhe pa kartat e udhëtimeve. E hoqa `WHERE false`, rifreskova dhe u kthyen përsëri tri kartat.

### Prova 3: Lidhja mungon, rikthimi dhe siguria

Ndryshova përkohësisht emrin `DATABASE_URL` në `DATABASE_URL_PA_TEST` te `.env.local` dhe rinisa serverin. Aplikacioni shfaqi mesazhin “Nuk u lidhëm me databazën. Provo përsëri.” E riktheva emrin `DATABASE_URL`, rinisa serverin dhe pas rifreskimit u kthyen përsëri tri kartat. Skedari `.env.local` nuk publikohet në GitHub sepse është i përjashtuar nga `.gitignore`.

## Çfarë mbetet për përmirësim

Kërkesa për vend mbetet simulim: nuk ruhet rezervim real në databazë dhe nuk njoftohet shoferi.
