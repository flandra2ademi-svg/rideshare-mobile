import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const migration = readFileSync('migrations/009-favorites.sql', 'utf8');
const server = readFileSync('lib/preferencat.ts', 'utf8');
const route = readFileSync('app/api/preferencat/route.ts', 'utf8');
const component = readFileSync('components/PreferencaUdhetimi.tsx', 'utf8');

function loadPersistence() {
  const mod = { exports: {} };
  const dependencies = {
    'server-only': {},
    '@/lib/auth': { auth: async () => null },
    '@/lib/db': { getSql: () => { throw new Error('getSql nuk duhet të thirret në testin e izoluar'); } },
  };
  const code = ts.transpileModule(readFileSync('lib/preferencat.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports: mod.exports,
    require: name => {
      assert.ok(Object.hasOwn(dependencies, name), `Unexpected import ${name}`);
      return dependencies[name];
    },
  });
  return mod.exports;
}

test('migration enforces real relationships and duplicate safety', () => {
  assert.match(migration, /REFERENCES profilet\(id\)/);
  assert.match(migration, /REFERENCES udhetimet\(id\)/);
  assert.match(migration, /UNIQUE \(perdoruesi_id, udhetimi_id\)/);
  assert.match(server, /ON CONFLICT \(perdoruesi_id, udhetimi_id\) DO NOTHING/);
});

test('server uses session identity and never accepts a client user id', () => {
  assert.match(route, /auth\(\)/);
  assert.match(route, /session\?\.user\?\.id/);
  assert.doesNotMatch(route, /userId|perdoruesiId\s*=\s*[^\n]*body/);
  assert.match(route, /status: 401/);
  assert.match(route, /status: 404/);
});

test('optimistic UI increments once, rolls back, and retries after failure', () => {
  assert.match(component, /setRuajtur\(true\)/);
  assert.match(component, /setNumer\(numer \+ 1\)/);
  assert.match(component, /setRuajtur\(ruajturMePare\)/);
  assert.match(component, /setNumer\(numerMePare\)/);
  assert.match(component, /status === "pending"/);
  assert.match(component, /Nuk u ruajt\. Provo përsëri\./);
  assert.match(component, /disabled=\{status === "pending" \|\| ruajtur\}/);
});

test('UI is accessible and remains server-backed after refresh', () => {
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /aria-pressed=\{ruajtur\}/);
  assert.match(component, /fetch\("\/api\/preferencat"/);
  assert.doesNotMatch(component, /localStorage|sessionStorage/);
});

test('persistence returns one saved row for repeated idempotent requests', async () => {
  const { ruajPreferencen } = loadPersistence();
  const queries = [];
  const sql = async (strings, ...values) => {
    queries.push({ text: strings.join('?'), values });
    if (queries.length === 1) return [{ id: '2' }];
    if (queries.length === 2) return [];
    return [{ ruajtur: true, numer: 1 }];
  };
  const first = await ruajPreferencen('2', '123', sql);
  const second = await ruajPreferencen('2', '123', sql);
  assert.equal(first.ruajtur, true);
  assert.equal(first.numer, 1);
  assert.equal(second.ruajtur, true);
  assert.equal(second.numer, 1);
  assert.equal(queries.length, 6);
  assert.match(queries[1].text, /ON CONFLICT \(perdoruesi_id, udhetimi_id\) DO NOTHING/);
  assert.match(queries[2].text, /SELECT[\s\S]*EXISTS[\s\S]*COUNT/);
  assert.doesNotMatch(queries[1].text, /WITH/);
});

test('regression: save reads the committed row after the insert statement', async () => {
  const { ruajPreferencen } = loadPersistence();
  const sql = async (strings) => {
    const text = strings.join('?');
    if (/SELECT id FROM udhetimet/.test(text)) return [{ id: '2' }];
    if (/INSERT INTO preferencat_udhetimeve/.test(text)) return [];
    if (/SELECT[\s\S]*EXISTS[\s\S]*COUNT/.test(text)) {
      return [{ ruajtur: true, numer: 1 }];
    }
    throw new Error(`Unexpected query: ${text}`);
  };
  const result = await ruajPreferencen('2', '123', sql);
  assert.deepEqual({ ruajtur: result.ruajtur, numer: result.numer }, { ruajtur: true, numer: 1 });
});

test('database failure is surfaced without a success result', async () => {
  const { ruajPreferencen } = loadPersistence();
  let writes = 0;
  const sql = async () => { writes += 1; throw new Error('controlled test failure'); };
  await assert.rejects(() => ruajPreferencen('2', '123', sql), /controlled test failure/);
  assert.equal(writes, 1);
});
