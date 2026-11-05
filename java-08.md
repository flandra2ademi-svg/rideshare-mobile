# RideShare — Java 8

## Çfarë ndërtova

GitHub: flandra2ademi-svg
Repository: https://github.com/flandra2ademi-svg/rideshare-mobile

Në rrjedhën ekzistuese të detajeve të udhëtimit shtova komponentin klient `components/Vendtakimi.tsx`. Komponenti ka dy gjendje të ndara për tekstin që po shkruhet dhe vendtakimin e konfirmuar. Vlera pastrohet me `trim()`, teksti bosh refuzohet me mesazh në shqip dhe konfirmimi i fundit ruhet derisa përdoruesi të bëjë një konfirmim të ri të vlefshëm.

Shtova edhe butonin `Përdor vendndodhjen time`. Kërkesa bëhet vetëm pas klikimit, kontrollon mbështetjen e shfletuesit, përdor `navigator.geolocation.getCurrentPosition()` me timeout 10000 ms dhe përfundon gjendjen e pritjes për sukses, refuzim, mungesë pozicioni ose timeout. Shfaqet vetëm saktësia në metra; koordinatat nuk dërgohen në server, Neon ose shofer dhe nuk ruhen.

Faqja `app/java-08-test/page.tsx` përdor të njëjtin komponent me të dhëna fiktive lokale dhe nuk kërkon login, Neon ose shërbime të jashtme. `mobile-week08.json` e aktivizon faqen për testimin zyrtar.

## Provat që bëra

### Prova 1: Leja nuk kërkohet sapo hapet faqja.

Hapat → Kontrollova komponentin dhe hapa build-in e route-it `/java-08-test`; nuk thirret Geolocation API në render, por vetëm brenda funksionit të butonit.
Pritshmëria → Faqja të hapet pa kërkuar leje.
Vëzhgimi → Build-i i Next.js e përfshiu faqen si `/java-08-test` dhe kodi e nis kërkesën vetëm pas klikimit. Kontrolli me browser interaktiv nuk u krye sepse host-i i browserit ishte i padisponueshëm në këtë mjedis.

### Prova 2: Refuzimi i lejes nuk e bllokon përdoruesin.

Hapat → Kontrollova degën `error.code === 1`, gjendjen `denied` dhe fushën manuale në të njëjtin komponent.
Pritshmëria → Të shfaqet “Leja u refuzua. Shkruaj vendtakimin vetë.”, pritja të përfundojë dhe konfirmimi manual të mbetet aktiv.
Vëzhgimi → Degëzimi dhe gjendja janë të implementuara; prova me leje të simuluar në browser nuk u krye për shkak të kufizimit të mjedisit.

Për timeout-in kontrollova veçmas `error.code === 3`, gjendjen `timeout` dhe mesazhin për provë sërish. Kjo degë është simulim i kontrolluar në kod, jo vëzhgim nga pajisje reale.

### Prova 3: Dëshmitë në GitHub nuk tregojnë adresën time reale.

Hapat → Kontrollova diff-in dhe komponentin e ri për koordinata, adresa private, `.env`, `node_modules` dhe `.next`; kontrollova gjithashtu që komponenti nuk përdor `fetch`, Neon ose ruajtje lokale për koordinata.
Pritshmëria → Repository të përmbajë vetëm të dhëna fiktive dhe kodin që shfaq saktësinë, pa koordinata reale ose adresa private.
Vëzhgimi → Testi statik kaloi: nuk u gjetën `latitude`, `longitude`, `localStorage`, `sessionStorage`, `fetch` ose Neon në komponentin e Java 8. Skedari `.env.local` mbetet i injoruar dhe nuk u përfshi në ndryshime.

## Ku gjendet puna

Skedarët kryesorë janë `components/Vendtakimi.tsx`, `app/java-08-test/page.tsx`, `app/udhetimi/[id]/page.tsx`, `app/globals.css`, `mobile-week08.json`, `tests/java08.test.mjs` dhe ky raport `java-08.md`. `package.json` dhe `package-lock.json` mbeten në rrënjë të repository-t. Faqja lokale është `/java-08-test`; nuk është publikuar veçmas në një demonstrim publik gjatë kësaj pune.

## Çfarë mbetet për përmirësim

Gjendja është vetëm lokale në komponentin e klientit. Pas rifreskimit mund të humbasë dhe vendtakimi ende nuk i dërgohet shoferit ose Neon-it. Hapi i ardhshëm do të kërkonte një kontratë serveri, autorizim dhe ruajtje të kujdesshme; kjo është jashtë Java 8. Testi real me leje GPS të simuluar në browser duhet të kryhet në kompjuterin ku browseri është i disponueshëm.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

Codex ndihmoi me inspektimin e repository-t dhe udhëzimeve, implementimin e komponentit dhe route-it, kontrollet statike, testet e projektit dhe plotësimin e raportit. Unë nuk po deklaroj prova manuale në pajisje reale ose rezultate të testit zyrtar GitHub që nuk janë ekzekutuar. Rezultatet e raportuara më sipër janë ato që u verifikuan në këtë mjedis.

## Prova me një hyrje të re

Kjo provë manuale nuk u krye në browser, sepse host-i i browserit ishte i padisponueshëm në mjedisin e punës.
- Hyrja që provova: Nuk u krye.
- Parashikimi im para klikimit: Teksti vetëm me hapësira duhet të japë gabim dhe të mos ndryshojë konfirmimin e mëparshëm.
- Çfarë pashë realisht: Nuk u vëzhgua në UI.
- Skedari dhe funksioni që e shpjegojnë: `components/Vendtakimi.tsx`, funksioni `confirmMeeting`.
- Çfarë kuptova ose korrigjova: Logjika përdor `trim()` dhe e përditëson `confirmed` vetëm për vlerë jo bosh; kjo u verifikua me test statik dhe TypeScript/build.

Këtë pjesë e shpjegoj në klasë. Kontrolli automatik nuk verifikon vërtetësinë e provës.
