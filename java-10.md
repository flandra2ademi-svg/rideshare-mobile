# RideShare — Java 10

## Çfarë ndërtova

Zëvendësova simulimin “Në pritje” me kërkesa reale për vende. Pas hyrjes me GitHub, udhëtari krijon një kërkesë të ruajtur në Neon; shoferi i udhëtimit sheh kërkesat e tij dhe mund të pranojë një kërkesë. Gjendja lexohet nga serveri dhe nuk ruhet vetëm në React, localStorage ose memorie.

Shtova migrimin `migrations/010-live-ride-requests.sql` me tabelën `kerkesa_udhetimeve`, foreign keys për udhëtimin dhe profilin, kufizim unik për kërkesën aktive të të njëjtit udhëtar dhe gjendjet `pending`/`accepted`. Pranimi përdor funksionin PostgreSQL `prano_kerkese`: bllokon kërkesën dhe udhëtimin me `FOR UPDATE`, kontrollon pronësinë dhe vendet, pastaj i përditëson të dyja atomikisht. Pranimi i përsëritur kthen gjendjen ekzistuese pa zbritur vend tjetër.

## Përgatitja e provës

Skenari i parashikuar përdor një udhëtim fiktiv ekzistues, p.sh. ID `2`, me dy vende. Duhet të përdoren dy sesione të ndara GitHub: një profil me `roli = 'udhetar'` për pasagjerin dhe profili që është `udhetimet.shofer_id` me `roli = 'shofer'` për shoferin. ID-të nuk dërgohen nga klienti; serveri i merr nga sesioni NextAuth.

Në këtë mjedis u inspektua schema dhe u përgatit migrimi, por `DATABASE_URL` nuk u përdor për të ndryshuar të dhëna reale gjatë këtij verifikimi. Prandaj nuk po deklaroj aplikim të migrimit ose rezultat SQL real. Para provës finale ekzekuto `migrations/010-live-ride-requests.sql` në Neon SQL Editor dhe verifiko me `SELECT * FROM kerkesa_udhetimeve ORDER BY id;`.

## Prova 1: Kërkesa mbërrin te shoferi

**Hapat:** Në udhëtimin fiktiv ID `2`, pasagjeri hyn në sesionin e vet dhe klikon “Kërko një vend”. Shoferi hap të njëjtin udhëtim në sesionin e pronarit.

**Pritshmëria:** Kërkesa ruhet me status `pending`; shoferi e sheh pa rifreskim manual; numri i vendeve mbetet `2`.

**Vëzhgimi real:** Endpoint-i `POST /api/udhetimet/[id]/kerkesa` dhe UI-ja janë implementuar. Testi me dy llogari të autentikuara dhe verifikimi i rreshtit në Neon nuk u kryen në mjedisin e disponueshëm, ndaj rezultati praktik mbetet për t’u ekzekutuar.

## Prova 2: Pranimi përditëson të dy ekranet

**Hapat:** Me një kërkesë `pending`, shoferi klikon “Prano kërkesën”; më pas pritet polling-u në të dy ekranet dhe provohet pranimi i dytë i së njëjtës kërkesë.

**Pritshmëria:** Statusi bëhet `accepted`, vendet zbresin saktësisht nga `2` në `1`, dhe pranimi i dytë nuk e zbret në `0`.

**Vëzhgimi real:** Funksioni SQL e zbaton këtë atomikisht me locking, kontroll pronësie dhe kontroll `vende > 0`. Testi real konkurrent kundër PostgreSQL dhe dy ekranet reale nuk u kryen; nuk po e paraqes si sukses të vëzhguar.

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

Prova me kolegun nuk u krye ende.

## Çfarë mbetet për përmirësim

Duhet të aplikohet migrimi në Neon dhe të ekzekutohet prova me dy llogari reale. Duhet gjithashtu një test integrimi real me PostgreSQL për konkurrencën e dy pranimeve me vetëm një vend, si dhe testim browser-i për offline/reconnect. Nëse migrimi është aplikuar më parë nga administratori, verifikimi duhet të dokumentojë datën dhe rezultatin SQL real.

## Ndihma nga AI

Codex ndihmoi me inspektimin e repository-t, hartimin e modelit të kërkesave, migrimin PostgreSQL, endpoint-et, autorizimin server-side, polling-un, testet strukturore dhe këtë raport. Nuk u përdorën llogari demo për të zëvendësuar autentikimin dhe nuk po deklarohen prova reale që nuk u ekzekutuan.

## Pas dorëzimit të parë

Në pritje të feedback-ut nga Issue zyrtare e Java 10. Pas aplikimit të migrimit dhe provës me dy sesione, ky seksion mund të plotësohet me ndryshimet e kërkuara nga feedback-u.
