# RideShare — Java 10

## Çfarë ndërtova

Zëvendësova simulimin “Në pritje” me kërkesa reale për vende. Pas hyrjes me GitHub, udhëtari krijon një kërkesë të ruajtur në Neon; shoferi i udhëtimit sheh kërkesat e tij dhe mund të pranojë një kërkesë. Gjendja lexohet nga serveri dhe nuk ruhet vetëm në React, localStorage ose memorie.

Shtova migrimin `migrations/010-live-ride-requests.sql` me tabelën `kerkesa_udhetimeve`, foreign keys për udhëtimin dhe profilin, kufizim unik për kërkesën e të njëjtit udhëtar dhe gjendjet `pending`/`accepted`. Pranimi përdor funksionin PostgreSQL `prano_kerkese`: bllokon kërkesën dhe udhëtimin me `FOR UPDATE`, kontrollon pronësinë dhe vendet, pastaj i përditëson të dyja atomikisht. Pranimi i përsëritur kthen gjendjen ekzistuese pa zbritur vend tjetër.

U rregullua edhe ambiguiteti PostgreSQL në funksionin origjinal: kolona `vende` kualifikohet me aliasin e tabelës (`ud.vende`) në `UPDATE`, sepse `RETURNS TABLE` ekspozon një variabël me të njëjtin emër. Kjo është pjesë e migrimit të freskët dhe regression test-it të Week 10.

## Përgatitja e provës

Skenari i parashikuar përdor një udhëtim fiktiv ekzistues, p.sh. ID `2`, me dy vende. Duhet të përdoren dy sesione të ndara GitHub: një profil me `roli = 'udhetar'` për pasagjerin dhe profili që është `udhetimet.shofer_id` me `roli = 'shofer'` për shoferin. ID-të nuk dërgohen nga klienti; serveri i merr nga sesioni NextAuth.

Migrimi i korrigjuar u aplikua në Neon gjatë verifikimit real dhe u kontrollua problemi i ambiguitetit të PostgreSQL. Të dhënat ekzistuese u ruajtën; për këtë raport nuk u ekzekutuan komanda destruktive.

## Prova 1: Kërkesa mbërrin te shoferi

**Hapat:** Në udhëtimin fiktiv ID `2`, pasagjeri hyn në sesionin e vet dhe klikon “Kërko një vend”. Shoferi hap të njëjtin udhëtim në sesionin e pronarit.

**Pritshmëria:** Kërkesa ruhet me status `pending`; shoferi e sheh pa rifreskim manual; numri i vendeve mbetet `2`.

**Vëzhgimi real:** U testua me dy llogari reale GitHub: shoferi `flandra2ademi-svg` (`245901747`) dhe pasagjeri `vhynp89ymp-dotcom` (`361524593`). Kërkesa u shfaq në ekranin e shoferit dhe gjendja u ruajt në Neon.

## Prova 2: Pranimi përditëson të dy ekranet

**Hapat:** Me një kërkesë `pending`, shoferi klikon “Prano kërkesën”; më pas pritet polling-u në të dy ekranet dhe provohet pranimi i dytë i së njëjtës kërkesë.

**Pritshmëria:** Statusi bëhet `accepted`, vendet zbresin saktësisht nga `2` në `1`, dhe pranimi i dytë nuk e zbret në `0`.

**Vëzhgimi real:** Në Ride 2 kërkesa u pranua dhe vendet ndryshuan `1` në `0`; në Ride 10 kërkesa u pranua dhe vendet ndryshuan `2` në `1`. Të dy ekranet shfaqën statusin `accepted` dhe polling-u live i përditësoi pa rifreskim manual. Idempotency, locking, autorizimi i shoferit dhe mbrojtja nga zero vende mbeten të garantuara nga funksioni SQL. Një garë reale me dy pranime paralele nuk u ekzekutua veçmas.

## Prova 3: Ndërprerja dhe rilidhja

**Hapat:** Pasagjeri fik rrjetin; shoferi pranon kërkesën online; pasagjeri rilidhet.

**Pritshmëria:** Pasagjeri ruan gjendjen e fundit, shfaq “Po rilidhemi”, nuk shfaq zero të rreme dhe bllokon veprimet e rrjetit. Pas rilidhjes, leximi i suksesshëm e sjell statusin `accepted` dhe vendet `1` pa rifreskim manual.

**Vëzhgimi real:** Komponenti përdor `online/offline`, `AbortController`, polling single-flight çdo 5000 ms, ruan gjendjen gjatë gabimit dhe e zëvendëson vetëm pas leximit të suksesshëm. Ndërprerja reale në browser nuk u krye në këtë mjedis.

## Ku gjendet puna

- `migrations/010-live-ride-requests.sql` — tabela, kufizimet, indeks dhe funksioni atomik i pranimit.
- `lib/kerkesa.ts` — query-t e leximit/krijimit dhe thirrja e funksionit të pranimit.
- `app/api/udhetimet/[id]/kerkesa/route.ts` — GET/POST me identitet NextAuth, autorizim dhe cache `no-store`.
- `components/KerkesaLive.tsx` — ndërfaqet udhëtar/shofer, polling, offline/reconnect dhe statuset shqip.
- `app/udhetimi/[id]/page.tsx` dhe `app/udhetimi/[id]/kerkesa/page.tsx` — integrimi me faqet ekzistuese.
- `tests/java10.test.mjs` — kontrolle automatike strukturore për Week 10.
- `java-10.md` — ky raport.

## Prova me kolegun

U krye prova me dy llogari reale GitHub dhe Neon PostgreSQL, me rezultatet e dokumentuara te Prova 1 dhe Prova 2.

## Çfarë mbetet për përmirësim

Mbeten të paverifikuara në këtë dorëzim: testimi real browser-i për offline/reconnect dhe testimi real konkurrent me dy pranime paralele në PostgreSQL. Testet automatike strukturore mbulojnë regresionin e ambiguitetit SQL, ndërsa funksioni ruan locking, atomicitetin, autorizimin, idempotency dhe zero-seat protection.

## Ndihma nga AI

Codex ndihmoi me inspektimin e repository-t, korrigjimin e migrimit PostgreSQL, regression test-in për ambiguitetin, verifikimet automatike dhe këtë raport. Prova reale përdori llogaritë GitHub dhe të dhënat Neon të specifikuara më sipër; offline/reconnect dhe concurrency nuk po deklarohen si të kryera.

## Pas dorëzimit të parë

Në pritje të feedback-ut nga Issue zyrtare e Java 10. Pas aplikimit të migrimit dhe provës me dy sesione, ky seksion mund të plotësohet me ndryshimet e kërkuara nga feedback-u.
