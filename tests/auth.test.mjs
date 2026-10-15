import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(env = {}) {
  const exports = {};
  const dependencies = {
    'server-only': {},
    'next-auth': { getServerSession: async options => ({ options }) },
    'next-auth/providers/github': { default: options => ({ id: 'github', options }) },
  };
  const code = ts.transpileModule(readFileSync('lib/auth.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, process: { env }, require: name => {
    assert.ok(Object.hasOwn(dependencies, name));
    return dependencies[name];
  } });
  return exports;
}

test('v4 config accepts existing v5 environment names and limits session lifetime', () => {
  const { authOptions: cfg } = load({ AUTH_SECRET: 'test-only', AUTH_GITHUB_ID: 'test-id', AUTH_GITHUB_SECRET: 'test-only' });
  assert.equal(cfg.secret, 'test-only');
  assert.equal(cfg.providers[0].options.clientId, 'test-id');
  assert.equal(cfg.session.maxAge, 7200);
  assert.equal(cfg.session.strategy, 'jwt');
});
test('official v4 environment names take precedence', () => {
  const { authOptions: cfg } = load({ NEXTAUTH_SECRET: 'official-test', AUTH_SECRET: 'alias-test', GITHUB_ID: 'official-id', AUTH_GITHUB_ID: 'alias-id' });
  assert.equal(cfg.secret, 'official-test');
  assert.equal(cfg.providers[0].options.clientId, 'official-id');
});
test('JWT identity uses verified GitHub account ID and survives refresh', async () => {
  const { authOptions: cfg } = load();
  const token = await cfg.callbacks.jwt({ token: {}, account: { provider: 'github', providerAccountId: '123' } });
  assert.equal(token.githubId, '123');
  assert.equal((await cfg.callbacks.jwt({ token, account: null })).githubId, '123');
});
test('session rejects missing or nonnumeric identities, including demo owner', async () => {
  const { authOptions: cfg } = load();
  for (const githubId of [undefined, 'DEMO-SHOFER-2', '123bad']) {
    const session = await cfg.callbacks.session({ session: { user: { id: 'stale' } }, token: { githubId } });
    assert.equal(session.user.id, undefined);
  }
});
test('session exposes numeric GitHub identity, not email, role or supplied sub', async () => {
  const { authOptions: cfg } = load();
  const session = await cfg.callbacks.session({ session: { user: {} }, token: { githubId: '123', sub: '456', roli: 'shofer' } });
  assert.equal(session.user.id, '123');
  assert.equal(session.user.roli, undefined);
});
test('auth delegates to v4 getServerSession with the real options', async () => {
  const { auth, authOptions } = load();
  assert.equal((await auth()).options, authOptions);
});
