# RideShare — Java 11: Njoftimet dhe angazhimi

## Çfarë shtova ndaj javës 10

Shtova njoftime personale brenda aplikacionit kur shoferi pranon një kërkesë. Migrimi `migrations/011-notifications.sql` krijon tabelën `njoftimet` me ID të qëndrueshme, marrësin, kërkesën, llojin e përgjigjes, kohën e krijimit dhe kohën e leximit. Kufizimi unik `(kerkesa_id, lloji)` garanton një njoftim për një përgjigje.

Pranimi dhe krijimi i njoftimit ndodhin brenda të njëjtit funksion PostgreSQL, me locking dhe rollback atomik. Marrësi merret nga `kerkesa_udhetimeve.udhetari_id`, jo nga browser-i. Njoftimet e kërkesave të pranuara para migrimit nuk backfill-ohen; ato mbeten në historikun e vjetër pa njoftim të ri.

## Përgatitja

U ruajtën funksionalitetet e Java 10 dhe u shtua migrimi 011 pas `migrations/010-live-ride-requests.sql`. Gjatë provës reale u gjet gabimi PostgreSQL `column reference "kerkesa_id" is ambiguous` (SQLSTATE 42702), sepse output parameter-i `kerkesa_id` përplasej me `ON CONFLICT (kerkesa_id, lloji)`. U korrigjua me `ON CONFLICT ON CONSTRAINT njoftim_kerkesa_lloj_unique DO NOTHING` dhe korrigjimi u aplikua me sukses në Neon përmes `CREATE OR REPLACE FUNCTION`. Testet automatike kontrollojnë që forma ambigue të mos rikthehet.

### Prova 1: Rasti 1 · Përgjigjja bëhet njoftim

- Hapat dhe përgjigjja e shoferit: Në dy sesione të autentikuara browser-i u përdor Ride ID `11` me Request ID `5`. Pasagjeri krijoi kërkesën dhe shoferi e pranoi.
- Çfarë prisja te udhëtari: Një njoftim i palexuar që thotë se shoferi e pranoi kërkesën dhe që lidhet me kërkesën e saktë.
- ID-ja e njoftimit, numri i palexuar dhe çfarë pashë realisht: U krijua saktësisht një njoftim me Notification ID `3`, me recipient passenger `361524593` dhe type `accepted`. Pasagjeri pa `1` njoftim të palexuar. Këto u verifikuan në Neon PostgreSQL dhe në aplikacion.
- Cila kërkesë u hap dhe çfarë mbeti pas Refresh: Njoftimi lidhej me Request ID `5`; statusi u bë `accepted` dhe vendet ndryshuan nga `2` në `1`. Njoftimi mbeti në listë pas leximit.

### Prova 2: Rasti 2 · Hapja dhe shënimi si i lexuar

- ID-ja e njoftimit dhe cila kërkesë u hap realisht: Pasagjeri hapi Notification ID `3`, i cili hapi kërkesën e saktë Request ID `5`.
- Numri i palexuar para/pas konfirmimit nga serveri: Numri ndryshoi nga `1` në `0`. Serveri konfirmoi se Notification ID `3` u shënua si i lexuar.
- Çfarë mbeti në histori pas kthimit te lista dhe Refresh: Njoftimi mbeti në listë pas leximit dhe nuk ndryshoi statusin e kërkesës ose numrin e vendeve.
- Nëse provova dështimin e shënimit: Nuk e provova këtë skenar shtesë. UI-ja ruan njoftimin si të palexuar dhe shfaq gabim me mundësi riprovimi.

### Prova 3: Rasti 3 · Rilidhja pa njoftime të dyfishta

- ID-ja e kërkesës tjetër, dritarja offline dhe hapat: Nuk u krye prova browser-i offline/reconnect me një kërkesë të re në Neon.
- Çfarë prisja pas rilidhjes dhe pas dy leximeve të tjera: Njoftimi të merret pas rilidhjes, të mbetet një rekord dhe të mos shfaqet toast i dytë.
- Numri i rekordeve, ID-ja e njoftimit dhe alarmet që pashë realisht: Nuk ka vëzhgime reale për t’u raportuar. Testet kontrollojnë polling-un çdo 5 sekonda, AbortController, ruajtjen e gjendjes offline dhe deduplicimin sipas ID-së.

## Prova me një hyrje tjetër

Prova me një hyrje tjetër nuk u krye për Java 11. Autorizimi u kontrollua me teste burimore: API-ja merr identitetin nga NextAuth dhe SQL-ja filtron me `perdoruesi_id`; një përdorues tjetër nuk mund ta lexojë ose shënojë njoftimin.

## Ku gjendet kodi dhe çfarë mbetet

- `migrations/011-notifications.sql` — tabela e njoftimeve dhe funksioni atomik i pranimit.
- `lib/njoftimet.ts` — leximi i listës, numërimi, detaji dhe shënimi si i lexuar.
- `app/api/njoftimet/route.ts` — lista dhe numri privat i palexuar.
- `app/api/njoftimet/[id]/route.ts` — detaji i autorizuar dhe `PATCH` idempotent.
- `components/NjoftimetLive.tsx` — bell, listë, polling, offline/reconnect dhe toast dedup.
- `components/NjoftimDetaj.tsx` dhe `app/njoftimet/[id]/page.tsx` — hapja dhe konfirmimi i leximit.
- `tests/java11.test.mjs` — regression dhe kontrolle të sigurisë/rrjedhës.

Statusi i kërkesës dhe leximi i njoftimit janë gjendje të ndryshme: kërkesa mund të jetë `accepted` ndërsa njoftimi është ende i palexuar. Hapja e njoftimit nuk ndryshon vendet ose statusin e kërkesës.

Mbeten të paverifikuara me mjedis real: offline/reconnect dhe concurrency real kundër PostgreSQL. Këto nuk po deklarohen si të kryera. Korrigjimi i funksionit u aplikua në Neon; nuk u rikrijuan ride/request fixtures dhe nuk u modifikuan kërkesat e pranuara më parë. Nuk u ekzekutua backfill për kërkesat e vjetra.

## Zgjerime opsionale

Web Push dhe refuzimi i kërkesës nuk u implementuan, sepse janë opsionale në ushtrimin bazë. Zgjidhja përdor njoftime brenda aplikacionit dhe polling-un ekzistues.

## Ndihma nga AI (Artificial Intelligence — inteligjencë artificiale)

Codex ndihmoi me inspektimin e udhëzimeve, dizajnin e migrimit PostgreSQL, implementimin Next.js/TypeScript, korrigjimin e regresionit SQL, kontrollet e autorizimit, testet dhe raportin. Rezultatet e Ride 11 të dokumentuara këtu u verifikuan me Neon PostgreSQL dhe dy sesione reale browser-i. Offline/reconnect dhe concurrency nuk po deklarohen si të kryera.

## Pas dorëzimit të parë — përditëso më vonë

Ky është raporti fillestar i Java 11. Pas feedback-ut të profesorit do të shtohen linku i Issue-s, commit-i i kontrolluar dhe korrigjimet e kërkuara. GREEN teknik nuk zëvendëson provën funksionale në aplikacion.
