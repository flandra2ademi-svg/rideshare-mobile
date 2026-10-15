# RideShare — Java 5 · Hyrja dhe lejet

## Çfarë ndërtova

Teknologjitë: Next.js 16.3.8, React 19, TypeScript, NextAuth 4.24.15, GitHub OAuth dhe Neon PostgreSQL. Migrimi nga v5 u bë me ndryshime reale në konfigurim, rrugën GET/POST, `getServerSession`, tipat dhe butonat `callbackUrl`; jo vetëm në versionin e paketës. Versioni 4.24.15 deklaron mbështetje për Next.js 16/React 19 dhe implementimi i tij përdor `await headers()`, `await cookies()` dhe `await context.params`.

Identiteti merret nga GitHub: `account.providerAccountId` ruhet në JWT dhe pastaj në `session.user.id`; pranohet vetëm ID numerike. Sesioni zgjat dy orë. Roli lexohet nga Neon; profili i ri krijohet si `udhetar`, pa mundësi zgjedhjeje nga formulari. Pronësia është lidhja `udhetimet.shofer_id → profilet.id`; ID e profilit nuk supozohet e barabartë me `github_id` gjatë kontrollit të përditësimit. Pas migrimit kërkohet hyrje e re; nuk u krijuan cookies ose sesione artificiale për të kaluar testet.

Paneli shfaq hyrjen/daljen, emrin, ID-në GitHub dhe rolin. Shoferi pronar i ID 2 sheh formularin në panel; në detaje formulari shfaqet vetëm për shoferin pronar. Fshehja është vetëm për ndërfaqen: Server Action verifikon sesionin dhe validon ID 1/2/3 dhe orën `HH:mm`. Një UPDATE i parametrizuar kontrollon njëkohësisht pronarin dhe rolin aktual `shofer` në Neon. Formulari nuk cakton identitet, rol ose pronar. Zero rreshta të përditësuar japin refuzim. Gabimet e databazës shfaqin mesazh pa detaje private. Pas suksesit rifreskohen lista, detajet për ID-në përkatëse dhe paneli.

`schema-java05.sql` ruan skemën ekzistuese dhe shton rolin me vlerën fillestare `udhetar`. Migrimi u ekzekutua më 15.10.2026. U caktua pronari fiktiv vetëm te ID 1 pa pronar; pronari ekzistues i ID 2 mori rolin `shofer` si përgatitje administrative e laboratorit. Orët dhe rekordet ekzistuese nuk u fshinë ose rivendosën.

## Provat që bëra

### Verifikimi përfundimtar në shfletues — 15.10.2026

Rezultatet më poshtë u kryen manualisht dhe u raportuan nga studentja; agjenti nuk i ekzekutoi në shfletues. Ato përditësojnë statuset historike NOT RUN të provave përkatëse më poshtë, duke ruajtur rezultatet e mëparshme automatike.

| Prova manuale në shfletues | Rezultati |
| --- | --- |
| Hyrja me GitHub OAuth | PASS |
| Paneli shfaq përdoruesin e autentikuar të GitHub dhe rolin `shofer` | PASS |
| Ndryshimi i lejuar i ID 2 nga `08:15` në `08:25` | PASS |
| Detajet e ID 2 shfaqin `08:25` | PASS |
| ID 1 shfaq `08:00` dhe nuk shfaq formularin e ndryshimit | PASS |
| Rikthimi i ID 2 në `08:15` | PASS |

**NOT RUN manualisht:** kërkesë e falsifikuar e autentikuar për ndryshimin e ID 1. Mungesa e formularit nuk provon refuzimin e një kërkese të tillë nga serveri. Testet e izoluara dhe POST-et anonime të dokumentuara më poshtë janë prova të veçanta. Gjithashtu nuk u raportuan prova manuale për daljen nga sesioni aktiv, rifreskimin e sesionit, heqjen e rolit, formularin e vjetër pas daljes, listën pas ndryshimit ose kontrollin SQL pas ndryshimit. Nuk pretendohet se u ruajtën pamje.

### Regjistri i mëparshëm i provave teknike

### Rikontrolli i fundit i autorizimit — 15.10.2026

**NOT RUN: kërkesa e autentikuar pa pronësi për ID 1.** U inspektuan `lib/auth.ts`, `lib/ndrysho-oren.ts` dhe testet. Nuk u gjet sesion lokal testimi i ruajtur në projekt ose shfletues i lidhur i përdorshëm nga agjenti; nuk u ekspozuan cookies/kredenciale, nuk u falsifikuan JWT dhe nuk u anashkalua autentikimi. Sesioni i shfletuesit të studentes nuk ishte i disponueshëm për këtë test. Për këtë arsye nuk u dërgua kërkesë e autentikuar dhe nuk pretendohet refuzim real për shoferin tjetër.

**PASS: verifikimi real HTTP/Neon pa sesion**, përmes `scripts/verify-java05.mjs` me serverin në portin 3105. Server Action refuzoi POST-et anonime për ID 1 dhe ID 2 me kërkesë për identifikim. Leximi real i Neon para/pas konfirmoi ID 1=`08:00`, ID 2=`08:15` dhe të njëjtët pronarë/role. Kaluan faqet publike, mungesa e formularit për anonimët, 404, endpoint-et e sesionit/provider-it, nisja OAuth me CSRF dhe dalja anonime. Këto nuk zëvendësojnë provën e autentikuar pa pronësi. Tentativat fillestare dështuan përpara përfundimit të verifikimit brenda sandbox-it; përsëritja me akses të lejuar në Neon përfundoi me kod daljeje 0.

Riekzekutimi i fundit: **22/22 teste PASS**, **TypeScript PASS**, **ESLint PASS**, **build PASS**; instalimi real mbetet **NextAuth 4.24.15**. Testi i izoluar për refuzimin e ID 1 përdor zëvendësues të sesionit dhe SQL-së; ai nuk përbën sesion legjitim ose provë integrimi të autentikuar. Rezultatet manuale të studentes dhe regjistri i mëparshëm ruhen. Statusi i verifikimit të plotë mbetet **NOT READY** deri në kryerjen e provës së autentikuar pa pronësi.

Paragrafët vijues ruajnë rezultatet dhe hapat e verifikimit të mëparshëm; statuset e reja të shfletuesit janë në tabelën sipër.

### Prova 1: Hyrja, rifreskimi dhe dalja

**PASS për endpoint-et; NOT RUN për ciklin e plotë GitHub.** Në build-in v4, HTTP verifikoi `/panel` pa sesion, provider-in GitHub dhe sesionin bosh. Një POST real me CSRF nisi OAuth dhe ktheu URL-në e GitHub me state, Client ID dhe callback-un e saktë. POST i daljes me CSRF gjithashtu kaloi pa sesion. Këto nuk provojnë miratimin në GitHub, callback-un me kod real, panelin e autentikuar ose daljen nga sesion aktiv. Nuk ka shfletues të automatizuar/sesion personal të aksesueshëm; këto hapa mbeten NOT RUN.

Hapat: `npm run dev`, hap `http://localhost:3000/panel`, hyr me GitHub, kontrollo emrin/ID/rolin, rifresko dhe kliko Dil. Pas daljes paneli duhet të kërkojë hyrje përsëri. Përditëso këtë paragraf me rezultatin e vëzhguar dhe pamjet.

### Prova 2: Shoferi ndryshon udhëtimin e vet

**PASS në testin e izoluar; NOT RUN si ndryshim real i autentikuar.** Testi ekzekutoi Server Action me zëvendësues testimi për sesionin/SQL dhe konfirmoi suksesin për ID 2, orën 08:25, përdorimin e identitetit të sesionit në SQL dhe rifreskimin e tri rrugëve. Ky test nuk provon ekzekutimin e UPDATE në Neon. Leximi real fillestar në Neon konfirmoi ID 2 = `08:15`, me pronar dhe rol `shofer`; ora nuk u ndryshua gjatë këtij verifikimi.

Hapat realë: hyr si pronar i ID 2, shkruaj `08:25` në panel dhe ruaj. Kontrollo mesazhin e suksesit, listën `/`, `/udhetimi/2` dhe SQL-në më poshtë. Ruaj pamje, pastaj rikthe `08:15` përmes të njëjtit formular. Shkruaj këtu rezultatin real pas provës.

### Prova 3: Veprimi pa leje refuzohet

**PASS në testin e izoluar dhe për POST real pa sesion; NOT RUN si tentativë e shoferit tjetër të autentikuar.** Testi me përgjigje SQL pa rreshta konfirmoi mesazhin “Nuk ke leje ta ndryshosh këtë udhëtim.” dhe mungesën e rifreskimit të cache-it. Testi kontrollon që SQL përfshin pronësinë dhe rolin. U dërguan POST reale te Server Action për ID 1 dhe ID 2 pa cookies: të dyja kthyen “Duhet të identifikohesh me GitHub.” Leximet reale në Neon para/pas konfirmuan ID 1=`08:00`, ID 2=`08:15`, të pandryshuara. Prova me shofer të autentikuar që falsifikon ID-në mbetet NOT RUN.

Hapat realë: si shofer, hap panelin; në DevTools ndrysho input-in e fshehur `name="id"` nga `2` në `1`, vendos `08:25` dhe ruaj. Duhet të refuzohet dhe SQL duhet të tregojë ID 1 ende `08:00`. Rifresko panelin, kontrollo që ID 2 është sërish `08:15` dhe dokumento mesazhin/pamjet. Opsionale: provo formularin e vjetër pas heqjes së rolit ose daljes; çdo ruajtje duhet të refuzohet.

```sql
SELECT u.id, u.ora, u.shofer_id, p.roli
FROM udhetimet u
LEFT JOIN profilet p ON p.id = u.shofer_id
ORDER BY u.id;
```

## Testet dhe provat teknike

Riekzekutimi përfundimtar më 15.10.2026: **PASS** për `npm.cmd test` (22/22), `npx.cmd tsc --noEmit`, `npm.cmd run lint` dhe `npm.cmd run build`. `npm.cmd ls next-auth --depth=0` konfirmoi instalimin real `next-auth@4.24.15`. Simulimi lokal me kontrolluesin ekzistues në `%TEMP%/ride-checker.cjs` dha **5/5**. Në këtë riekzekutim nuk u shkarkua version i ri i kontrolluesit dhe nuk u riekzekutuan HTTP/Neon ose auditimi; rezultatet e tyre të mëparshme ruhen më poshtë. PowerShell bllokoi fillimisht skriptet `npm.ps1`/`npx.ps1`; të njëjtat kontrolle përfunduan me sukses përmes `npm.cmd`/`npx.cmd` pa ndryshuar politikën e sistemit.

- PASS: `npm test` — 22 teste: 16 për veprimin dhe 6 për konfigurimin v4, alias-et e variablave private, jetëgjatësinë e JWT, identitetin GitHub, refuzimin e identiteteve jo numerike dhe `getServerSession`. Testet e veprimit përfshijnë validimin e orës/ID, File në vend të tekstit, refuzimin dhe gabimet pa ekspozim detajesh. Zëvendësuesit e SQL nuk janë provë e ndryshimit real në Neon.
- PASS: `npx tsc --noEmit`.
- PASS: `npm run lint`.
- PASS: `npm run build`.
- PASS: HTTP për listën, tri detajet dhe dy faqet e simulimit; ID që mungon jep 404; paneli publik shfaq hyrjen pa formular ndryshimi.
- PASS: `scripts/verify-java05.mjs` — lista, tri detajet, dy simulimet e kërkesave, paneli pa formular për anonimët, 404, endpoint-et e sesionit/OAuth, nisja reale OAuth me CSRF, dalja pa sesion, dy POST anonime të refuzuara dhe pandryshueshmëria e Neon. U përdor `NEXTAUTH_URL=http://localhost:3105` vetëm në procesin e testit sepse porti 3000 ishte i zënë. Procesi ekzistues nuk u ndal. Ky test nuk verifikon consent/callback interaktiv në GitHub.
- PASS: `npm audit --omit=dev --json` — zero dobësi në varësitë e prodhimit. Auditimi i plotë raporton 5 dobësi high në zinxhirin e mjeteve ESLint (`braces`/`micromatch`/`fast-glob`); nuk u përdor `audit fix --force`, sepse sugjeron ulje të papërshtatshme të konfigurimit Next.js në 14.x. Ky kufizim i mjeteve të zhvillimit mbetet i dokumentuar.
- Në verifikimin e mëparshëm: NOT RUN për OAuth interaktiv dhe ndryshimet reale të orës; tani PASS sipas tabelës së shfletuesit. Prova me rol të hequr dhe formular të vjetër pas daljes mbeten NOT RUN.
- NOT RUN: publikim, Git push dhe dorëzim; kërkojnë veprimin e studentes.

Pamjet e nevojshme: paneli pas hyrjes me rol shofer; suksesi dhe ora 08:25 në panel/listë/detaje/SQL; refuzimi i ID 1 dhe SQL me 08:00; kthimi i ID 2 në 08:15; paneli pas daljes. Mos përfshi `.env.local`, kredenciale, tokens ose të dhëna private.

## Kontrolluesi teknik i profesorit

U rilexuan [udhëzimi zyrtar](https://arbenl.github.io/lendet/2026-2027/mobile/java-05/ushtrimet.html) dhe [kodi i kontrolluesit](https://github.com/arbenl/arbenl-mobile-assignments-2025/blob/main/scripts/check-mobile-submission.cjs). Versioni 4.24.15 dhe të gjitha rrugët e kërkuara përputhen. Migrimi përfshin kodin e autentikimit, tipat, rrugën dhe testet. Kontrolluesi nuk ekzekuton aplikacionin dhe nuk lidhet me Neon.

Raporti përmban statusin real të tri provave; kalimi i kontrollit statik të tekstit nuk nënkupton kalimin e provave funksionale. Rezultatet reale të raportuara janë në tabelën sipër; kërkesa e falsifikuar e autentikuar mbetet NOT RUN.

Simulimi përdor funksionin origjinal `checkFiles`, me skedarët lokalë të planifikuar për commit dhe pa përfshirë dosjen e vjetër/skicën. Rezultati lokal duhet dalluar nga kontrolli në Issue: nuk verifikohet nëse repository është publik ose nëse skedarët janë bërë push.

**PASS: 5/5 në simulimin lokal pas migrimit v4.** Raporti, projekti Next.js, tri seksionet e provave, skedarët/paketat e hyrjes dhe mungesa e skedarëve `.env` të planifikuar kaluan. Seksionet NOT RUN nuk u paraqitën si prova të kryera.

Riprodhimi i simulimit:

```powershell
Invoke-WebRequest 'https://raw.githubusercontent.com/arbenl/arbenl-mobile-assignments-2025/main/scripts/check-mobile-submission.cjs' -OutFile "$env:TEMP/ride-checker.cjs"
node scripts/check-java05.mjs "$env:TEMP/ride-checker.cjs"
```

## Siguria dhe integriteti

Rishikimi përfundimtar: ndryshimet ekzistuese lidhen me Java 5; në 46 skedarët e planifikuar nuk u gjetën modele të çelësave privatë, token-ëve GitHub ose URL-ve PostgreSQL me kredenciale. `.env.local` konfirmohet i përjashtuar nga Git. `git diff --check` kaloi dhe indeksi Git mbeti bosh. `detyrapm/` dhe `skica.png` mbeten jashtë komandës së përzgjedhur të dorëzimit dhe nuk u ndryshuan. Agjenti ndryshoi vetëm këtë raport; nuk kreu staging, commit, push ose dorëzim. Paragrafi vijues përshkruan sesionin e mëparshëm teknik; rikthimi manual i orës në sesionin e studentes dokumentohet në tabelën sipër.

Sekretet përdoren vetëm në server dhe `.env.local` përjashtohet nga Git. OAuth përdor CSRF/state dhe redirect-et standarde të NextAuth. Roli nuk ruhet si burim autoriteti në sesion dhe as merret nga klienti: kushti `roli = 'shofer'` është në të njëjtin UPDATE me pronësinë, kështu që një formular i vjetër nuk mjafton pas heqjes së rolit. Query-t janë të parametrizuara; kufizimi i orës ekziston edhe në PostgreSQL. Testet HTTP nuk krijuan identitete, cookies të nënshkruara ose rrugë testimi që anashkalojnë autentikimin. Në këtë sesion nuk u ndryshuan të dhënat e udhëtimeve dhe nuk pati nevojë rikthimi të orës.

## Ruajtja dhe dorëzimi

Pasi të përfundosh provat reale, përditëso raportin. Për OAuth lokal përdor Homepage `http://localhost:3000` dhe callback `http://localhost:3000/api/auth/callback/github`. Rinis serverin pas migrimit dhe hyr sërish. Variablat zyrtare janë `GITHUB_ID`, `GITHUB_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` dhe `DATABASE_URL`. Për kredencialet mbështeten edhe alias-et ekzistuese `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `AUTH_SECRET`, por origjina në v4 caktohet me `NEXTAUTH_URL`, jo vetëm `AUTH_URL`. Mos publiko vlerat private. `.env.local` nuk u ndryshua. Publikimi në Vercel është opsional dhe kërkon OAuth App të veçantë për prodhim.

Instalimi: `npm ci`; zhvillimi: `npm run dev`; prodhimi lokal: `npm run build` dhe `npm start`. Migrimi SQL ekziston në Neon; mos e rivendos databazën. Kontrollet: `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`. Me serverin të nisur në origjinën e saktë: `node scripts/verify-java05.mjs` (ose cakto `TEST_BASE_URL` për port tjetër).

```powershell
git status --short
git add -- auth.ts app components lib types scripts schema-java05.sql java-05.md tests package.json package-lock.json eslint.config.mjs tsconfig.json
git diff --cached --stat
git diff --cached --check
git commit -m "Complete Java 5 role and ownership authorization"
git push origin main
```

Kontrollo që lista e skedarëve për commit nuk përfshin `.env.local`, `detyrapm/` ose `skica.png`. Pas push kontrollo kodin online dhe përdor [formularin Java 5](https://github.com/arbenl/arbenl-mobile-assignments-2025/issues/new?template=mobile-submission.yml&week=Java%205). Dorëzo linkun kryesor të repository-t publik një herë. Lexo komentin pas 1–3 minutash; pas korrigjimeve bëj commit/push dhe shkruaj `rikontrollo` në të njëjtën Issue. Ruaj linkun e Issue-së. Këto komanda dhe dorëzimi nuk u ekzekutuan nga agjenti.

## Ku gjendet puna

Repository: https://github.com/flandra2ademi-svg/rideshare-mobile . Kodi punon nga rrënja pranë README; `detyrapm/` dhe `skica.png` nuk u ndryshuan. Nuk u publikua demo e re në Vercel.

Skedarët e Java 5: `auth.ts`, `lib/auth.ts`, `lib/profilet.ts`, `lib/lejet.ts`, `lib/ndrysho-oren.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/panel/page.tsx`, `app/panel/actions.ts`, `components/Hyrja.tsx`, `components/FormaNdryshoOren.tsx`, `types/next-auth.d.ts`, `schema-java05.sql`, `tests/ndrysho-oren.test.mjs`, `tests/auth.test.mjs`, `scripts/verify-java05.mjs`, `scripts/check-java05.mjs`. U përshtatën lista, detajet, leximi i pronarit, stilet dhe konfigurimet e kontrolleve; `package.json`/lock tani instalojnë v4 realisht. Dosja e vjetër përjashtohet nga TypeScript/lint.

## Çfarë mbetet për përmirësim

Kërkesa për vend mbetet simulim si në Java 4. Më pas do të shtoja rezervime reale me kontroll transaksional të vendeve dhe njoftim të shoferit. Hyrja, paneli i autentikuar dhe ndryshimi i lejuar janë verifikuar manualisht sipas tabelës. Mbeten pa provë manuale dalja nga sesioni aktiv dhe refuzimi i kërkesës së falsifikuar të autentikuar për ID 1. Mospërputhja e versionit është zgjidhur; kontrolli statik nuk zëvendëson demonstrimin funksional.

## Ndihma nga AI (Artificial Intelligence – inteligjencë artificiale)

Codex ndihmoi në leximin e kërkesave, shqyrtimin e kodit/skemas, migrimin shtues, validimin/autorizimin në SQL, integrimin e formularit, testet e izoluara dhe dokumentimin. Testet teknike u ekzekutuan nga agjenti. Gjashtë provat manuale në tabelë u kryen dhe u raportuan nga studentja. Provat e tjera nuk paraqiten si të kryera.
