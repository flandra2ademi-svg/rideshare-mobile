# RideShare — Java 7 · Rrjedha listë → detaje → kërkesë

## Rasti im

- GitHub: `flandra2ademi-svg`
- Kodi: `P7-691`
- Skenari paraprak: `Rasti 1 · Lista dhe detajet`
- ID e verifikuar: `2` — në aplikacion dhe në Neon
- Të dhënat e përkohshme për provë: Ferizaj → AAB
- Ora e përdorur në provë: `09:05`
- Vende të përdorura në provë: `2`, pastaj `1`
- Ora e re për provë: `09:10`
- Gjendja fillestare u ruajt para ndryshimeve. Branch-i ishte `main`; remote-i ishte `https://github.com/flandra2ademi-svg/rideshare-mobile.git`. Ndryshimet e palidhura në `detyrapm/` dhe `skica.png` nuk u prekën.

## Parashikimi

Parashikoj që udhëtimi me ID 2 të shfaqë të njëjtat të dhëna në listë dhe në detaje: Ferizaj → AAB, ora 09:05 dhe 2 vende të lira. Pas ndryshimit të orës në 09:10 dhe rifreskimit, pres që ora e re të shfaqet në të dyja faqet. Për një ID që nuk ekziston, pres mesazhin “Udhëtimi nuk u gjet” dhe një lidhje për t’u kthyer te lista.

## Dy probleme

- E vëzhguar para korrigjimit: lista shfaqte “1 vende të lira”.
- Paqartësi nga inspektimi i kodit: `schema.sql` nuk krijon kolonën `shofer_id`, ndërsa `schema-java05.sql` e shton. Skedarët u verifikuan; kjo paqartësi nuk u riprodhua me instalim të freskët.

## Korrigjimi

- Skedari: `components/KartaUdhetimi.tsx`
- Ndryshimi real: për `vende === 1` shfaqet “1 vend i lirë”; për numra më të mëdhenj ruhet shumësi “vende të lira”; për `0` ruhet “E plotë”.
- Ndryshimet e përkohshme në Neon u përdorën vetëm për përgatitjen e provave dhe nuk janë korrigjimi i kodit.

## Provat që bëra

### Prova 1

- Hapat: Me të dhënat e përkohshme `Ferizaj → AAB`, hapa kërkesën e ID-së `2`.
- Pritshmëria: Të hapet detaji i udhëtimit dhe të paraqitet gjendja e kërkesës.
- Vëzhgimi: U shfaq “Simulim: Në pritje” dhe mesazhi se kërkesa nuk i është dërguar shoferit.

### Prova 2

- Hapat: Vendosa `vende = 1`, rifreskova listën dhe kontrollova kartën e udhëtimit.
- Pritshmëria: Lista të pasqyrojë numrin e ri të vendeve të lira.
- Vëzhgimi: U konfirmua teksti “1 vend i lirë”.

### Prova 3

- Hapat: Ndryshova vetëm orën nga `09:05` në `09:10` dhe kontrollova `/udhetimi/2`; më pas riktheva të dhënat origjinale.
- Pritshmëria: Ora e ndryshuar të shihet në detaje dhe të dhënat origjinale të rikthehen pas provës.
- Vëzhgimi: `09:10` u konfirmua te `/udhetimi/2`. Nuk kam konfirmim për shfaqjen e `09:10` në listë, prandaj kjo nuk deklarohet si e verifikuar. Rikthimi në `Prishtine → AAB`, `08:15`, “Te stacioni kryesor”, `1 vend` u verifikua me `SELECT` në Neon dhe në listën e aplikacionit.

## Versionet

- Para: https://github.com/flandra2ademi-svg/rideshare-mobile/commit/bb8546dc700ea6ff13c32ba7552d938ae74dee7f
- Pas: https://github.com/flandra2ademi-svg/rideshare-mobile/commit/5f380436154b63d89b871b24bc8b63dc0c1f6c93

## Ndryshimi i ri

U ndryshua vetëm ora nga `09:05` në `09:10` dhe `09:10` u konfirmua te `/udhetimi/2`. Nuk kam konfirmim për shfaqjen e `09:10` në listë, prandaj kjo nuk deklarohet si e verifikuar. Të dhënat e përkohshme në Neon u përdorën për përgatitjen e provave dhe nuk janë korrigjimi i kodit. Të dhënat origjinale të ID-së `2` — `Prishtine → AAB`, `08:15`, “Te stacioni kryesor”, `1 vend` — u rikthyen dhe rikthimi u verifikua me `SELECT` në Neon dhe në listën e aplikacionit. Demonstrimi me kolegun nuk është kryer.

Kjo pjesë nuk pretendon rezultate të testeve, TypeScript, lint ose build-it që nuk janë kryer si pjesë e provave të raportuara. Raporti u kontrollua me `git diff --check`.

## Ndihma nga AI

Codex ndihmoi në leximin e kërkesave, inspektimin e repository-t dhe kodit, hartimin e parashikimit, sugjerimin e kodit, kontrollet teknike dhe dokumentimin. Provat manuale u kryen dhe u raportuan nga studentja. Nuk pretendohet demonstrim me kolegun dhe nuk deklarohet si e verifikuar shfaqja e `09:10` në listë.

