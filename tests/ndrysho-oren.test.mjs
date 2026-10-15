import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Execute the real action with isolated boundary doubles. No live sessions,
// secrets, network calls or database writes are created by these unit tests.
function setup({ session = { user: { id: '123' } }, rows = [{ id: '2' }], fails = false } = {}) {
  const queries = [], paths = [];
  const sql = async (strings, ...values) => {
    queries.push({ query: strings.join('?'), values });
    if (fails) throw new Error('private database details');
    return rows;
  };
  const mod = { exports: {} };
  const dependencies = {
    '@/auth': { auth: async () => session },
    '@/lib/db': { getSql: () => sql },
    'next/cache': { revalidatePath: path => paths.push(path) },
  };
  const code = ts.transpileModule(readFileSync('lib/ndrysho-oren.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports: mod.exports, require: name => {
    assert.ok(Object.hasOwn(dependencies, name), `Unexpected import ${name}`);
    return dependencies[name];
  } });
  return { action: mod.exports.ndryshoOren, queries, paths };
}
function form(id = '2', ora = '08:25') {
  const data = new FormData();
  data.set('id', id); data.set('ora', ora);
  return data;
}

test('successful update binds session identity, owner and current driver role in SQL', async () => {
  const ctx = setup();
  const data = form(); data.set('github_id', 'attacker'); data.set('roli', 'shofer');
  assert.equal((await ctx.action(data)).success, true);
  assert.deepEqual(ctx.queries[0].values, ['08:25', '2', '123']);
  assert.match(ctx.queries[0].query, /shofer_id\s*=\s*\(\s*SELECT id FROM profilet\s*WHERE github_id = \? AND roli = 'shofer'/);
  assert.deepEqual(ctx.paths, ['/', '/udhetimi/2', '/panel']);
});
test('trip 1 denied by database result, no invalidation', async () => {
  const ctx = setup({ rows: [] });
  assert.match((await ctx.action(form('1'))).error, /Nuk ke leje/);
  assert.deepEqual(ctx.paths, []);
});
test('revoked role or missing trip denied by zero-row update', async () => {
  const ctx = setup({ rows: [] });
  assert.match((await ctx.action(form())).error, /Nuk ke leje/);
});
for (const session of [null, { user: {} }, { user: { id: 'DEMO-SHOFER-2' } }]) {
  test(`reject invalid or absent session ${JSON.stringify(session)}`, async () => {
    const ctx = setup({ session });
    assert.match((await ctx.action(form())).error, /identifikohesh/);
    assert.equal(ctx.queries.length, 0);
  });
}
for (const [id, ora] of [['', '08:25'], ['4', '08:25'], ['1 OR 1=1', '08:25'], ['2', '24:00'], ['2', '08:60'], ['2', '8:25'], ['2', '08:25:00'], ['2', '']]) {
  test(`reject invalid input ${id}/${ora}`, async () => {
    const ctx = setup();
    assert.ok((await ctx.action(form(id, ora))).error);
    assert.equal(ctx.queries.length, 0);
  });
}
test('reject uploaded file instead of time', async () => {
  const ctx = setup(), data = form();
  data.set('ora', new Blob(['08:25']), 'time.txt');
  assert.ok((await ctx.action(data)).error);
  assert.equal(ctx.queries.length, 0);
});
test('database errors produce safe feedback without success or cache changes', async () => {
  const ctx = setup({ fails: true });
  const result = await ctx.action(form());
  assert.match(result.error, /databazën/);
  assert.doesNotMatch(result.error, /private/);
  assert.deepEqual(ctx.paths, []);
});
