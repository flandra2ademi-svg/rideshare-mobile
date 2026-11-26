import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migration = readFileSync('migrations/010-live-ride-requests.sql', 'utf8');
const server = readFileSync('lib/kerkesa.ts', 'utf8');
const route = readFileSync('app/api/udhetimet/[id]/kerkesa/route.ts', 'utf8');
const component = readFileSync('components/KerkesaLive.tsx', 'utf8');
const report = readFileSync('java-10.md', 'utf8');

test('migration has real foreign keys, duplicate protection, and safe states', () => {
  assert.match(migration, /REFERENCES udhetimet\(id\)/);
  assert.match(migration, /REFERENCES profilet\(id\)/);
  assert.match(migration, /UNIQUE \(udhetimi_id, udhetari_id\)/);
  assert.match(migration, /status IN \('pending', 'accepted'\)/);
  assert.match(migration, /FOR UPDATE/);
  assert.match(migration, /vende = vende - 1/);
  assert.match(migration, /IF u\.vende <= 0/);
});

test('server derives passenger and driver identity from the session boundary', () => {
  assert.match(route, /auth\(\)/);
  assert.match(route, /session\?\.user\?\.id/);
  assert.doesNotMatch(route, /userId.*body|driverId.*body|shoferId.*body/i);
  assert.match(server, /ON CONFLICT \(udhetimi_id, udhetari_id\) DO NOTHING/);
  assert.match(server, /ride\.shofer_id === perdoruesiId/);
});

test('acceptance is server-authorized and idempotent', () => {
  assert.match(route, /action === "accept"/);
  assert.match(route, /status: 403/);
  assert.match(route, /status: 409/);
  assert.match(migration, /k\.status = 'accepted'/);
  assert.match(migration, /RETURN QUERY SELECT k\.id/);
});

test('regression: PostgreSQL return-column ambiguity is eliminated in the seat update', () => {
  assert.match(migration, /UPDATE udhetimet AS ud\s+SET vende = ud\.vende - 1\s+WHERE ud\.id = u\.id/);
  assert.doesNotMatch(migration, /UPDATE udhetimet\s+SET vende = vende - 1/);
  assert.match(migration, /RETURNS TABLE \(kerkesa_id BIGINT, udhetimi_id TEXT, vende INTEGER, status TEXT\)/);
});

test('polling is single-flight, abortable, stale-safe, and cleaned up', () => {
  assert.match(component, /setTimeout\(loop, 5000\)/);
  assert.match(component, /AbortController/);
  assert.match(component, /latest\.current/);
  assert.match(component, /clearTimeout/);
  assert.match(component, /removeEventListener\("online"/);
  assert.match(component, /navigator\.onLine/);
  assert.match(component, /Po rilidhemi/);
});

test('report contains the required honest Week 10 sections', () => {
  for (const heading of ['Çfarë ndërtova', 'Përgatitja e provës', 'Prova 1:', 'Prova 2:', 'Prova 3:', 'Ku gjendet puna', 'Prova me kolegun', 'Çfarë mbetet për përmirësim', 'Ndihma nga AI', 'Pas dorëzimit të parë']) assert.match(report, new RegExp(heading));
  assert.doesNotMatch(report, /\[PLOTËSO\]/);
});
