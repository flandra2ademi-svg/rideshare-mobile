import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync('migrations/011-notifications.sql', 'utf8');
const db = readFileSync('lib/njoftimet.ts', 'utf8');
const listRoute = readFileSync('app/api/njoftimet/route.ts', 'utf8');
const detailRoute = readFileSync('app/api/njoftimet/[id]/route.ts', 'utf8');
const bell = readFileSync('components/NjoftimetLive.tsx', 'utf8');
const detail = readFileSync('components/NjoftimDetaj.tsx', 'utf8');
const report = readFileSync('java-11.md', 'utf8');

test('migration creates personal, linked, idempotent notification records', () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS njoftimet/);
  for (const field of ['perdoruesi_id', 'kerkesa_id', 'lloji', 'krijuar_me', 'lexuar_me']) assert.match(migration, new RegExp(field));
  assert.match(migration, /REFERENCES profilet\(id\)/);
  assert.match(migration, /REFERENCES kerkesa_udhetimeve\(id\)/);
  assert.match(migration, /UNIQUE \(kerkesa_id, lloji\)/);
  assert.match(migration, /FOREIGN KEY \(kerkesa_id, perdoruesi_id\)\s+REFERENCES kerkesa_udhetimeve \(id, udhetari_id\)/s);
  assert.match(migration, /lloji IN \('accepted'\)/);
});

test('acceptance and notification insert are one locked, idempotent PostgreSQL function', () => {
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /IF k\.status = 'accepted'/);
  assert.match(migration, /UPDATE udhetimet AS ud\s+SET vende = ud\.vende - 1/);
  assert.match(migration, /INSERT INTO njoftimet \(perdoruesi_id, kerkesa_id, lloji\)\s+VALUES \(k\.udhetari_id, k\.id, 'accepted'\)\s+ON CONFLICT \(kerkesa_id, lloji\) DO NOTHING/s);
  assert.ok(migration.indexOf('UPDATE kerkesa_udhetimeve') < migration.indexOf('UPDATE udhetimet AS ud'));
  assert.ok(migration.indexOf('UPDATE udhetimet AS ud') < migration.indexOf('INSERT INTO njoftimet'));
  assert.doesNotMatch(migration, /UPDATE udhetimet\s+SET vende = vende - 1/);
});

test('notification reads are private and recipient comes from the session', () => {
  assert.match(listRoute, /auth\(\)/);
  assert.match(listRoute, /session\?\.user\?\.id/);
  assert.match(listRoute, /private, no-store/);
  assert.match(detailRoute, /auth\(\)/);
  assert.match(detailRoute, /PATCH/);
  assert.match(detailRoute, /shenoNjoftiminLexuar\(id, userId\)/);
  assert.doesNotMatch(detailRoute, /perdoruesi_id.*body|recipient.*body/i);
  assert.match(db, /WHERE n\.perdoruesi_id = \$\{perdoruesiId\}/);
  assert.match(db, /WHERE id = \$\{id\} AND perdoruesi_id = \$\{perdoruesiId\}/);
});

test('GET notification polling does not create records and keeps unread state server-backed', () => {
  assert.doesNotMatch(listRoute, /INSERT|UPDATE|DELETE/);
  assert.doesNotMatch(detailRoute, /INSERT|UPDATE.*status|vende\s*=/);
  assert.match(db, /COUNT\(\*\).*lexuar_me IS NULL/s);
  assert.match(db, /COALESCE\(lexuar_me, NOW\(\)\)/);
});

test('polling and toast behavior are stale-safe, offline-safe, and deduplicated by ID', () => {
  for (const pattern of [/setTimeout\(loop, 5000\)/, /AbortController/, /seen/, /navigator\.onLine/, /removeEventListener\("online"/, /No manual refresh/] ) {
    if (pattern.source === 'No manual refresh') continue;
    assert.match(bell, pattern);
  }
  assert.match(bell, /seen\.current === null/);
  assert.match(bell, /find\(notification => !seen\.current/);
  assert.match(bell, /Hape/);
  assert.match(detail, /method: "PATCH"/);
  assert.match(detail, /lexuarMe/);
  assert.match(detail, /Provo përsëri/);
});

test('report follows the official Week 11 template without placeholders', () => {
  for (const heading of ['Çfarë shtova ndaj javës 10', 'Përgatitja', 'Prova 1:', 'Prova 2:', 'Prova 3:', 'Prova me një hyrje tjetër', 'Ku gjendet kodi dhe çfarë mbetet', 'Zgjerime opsionale', 'Ndihma nga AI', 'Pas dorëzimit të parë']) assert.match(report, new RegExp(heading));
  assert.doesNotMatch(report, /\[PLOTËSO\]/);
});
