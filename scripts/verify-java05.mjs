// Read-only database assertions plus real unauthenticated HTTP requests.
// Does not create sessions or bypass authentication; never logs response bodies.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

process.loadEnvFile('.env.local');
const base = process.env.TEST_BASE_URL ?? 'http://localhost:3000';
const sql = neon(process.env.DATABASE_URL);
const snapshot = () => sql`SELECT u.id,u.ora,p.roli,p.id IS NOT NULL AS has_owner
  FROM udhetimet u LEFT JOIN profilet p ON p.id = u.shofer_id
  WHERE u.id IN ('1','2') ORDER BY u.id`;

async function run() {
  const before = await snapshot();
  assert.equal(before.find(r => r.id === '1')?.ora, '08:00');
  assert.equal(before.find(r => r.id === '2')?.ora, '08:15');
  assert.ok(before.every(r => r.has_owner && r.roli === 'shofer'));
  console.log('PASS: Neon initial values: ID 1=08:00; ID 2=08:15; both have driver owners');

  for (const path of ['/', '/udhetimi/1', '/udhetimi/2', '/udhetimi/3', '/udhetimi/2/kerkesa', '/udhetimi/3/kerkesa', '/panel']) {
    const response = await fetch(base + path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(!html.includes('Nuk u lidhëm'), path);
    assert.ok(!html.includes('name="ora"'), `No anonymous edit form on ${path}`);
    if (path === '/') {
      for (const id of ['1', '2', '3']) assert.ok(html.includes(`/udhetimi/${id}`));
    }
    if (path === '/panel') assert.ok(html.includes('Hyr me GitHub'));
    console.log(`PASS: public ${path}, no anonymous edit form`);
  }
  assert.equal((await fetch(base + '/udhetimi/mungon')).status, 404);
  console.log('PASS: missing trip returns 404');

  const providersResponse = await fetch(base + '/api/auth/providers');
  assert.equal(providersResponse.status, 200);
  assert.equal((await providersResponse.json()).github.id, 'github');
  const sessionResponse = await fetch(base + '/api/auth/session');
  assert.equal(sessionResponse.status, 200);
  assert.ok(!(await sessionResponse.json()).user);
  console.log('PASS: v4 GitHub provider and signed-out session endpoints');

  const csrfResponse = await fetch(base + '/api/auth/csrf');
  assert.equal(csrfResponse.status, 200);
  const { csrfToken } = await csrfResponse.json();
  assert.ok(csrfToken);
  const cookie = csrfResponse.headers.getSetCookie().map(value => value.split(';')[0]).join('; ');
  const signInResponse = await fetch(base + '/api/auth/signin/github', {
    method: 'POST', headers: { Cookie: cookie, Origin: base },
    body: new URLSearchParams({ csrfToken, callbackUrl: base + '/panel', json: 'true' }),
  });
  assert.equal(signInResponse.status, 200);
  const authorizationUrl = new URL((await signInResponse.json()).url);
  assert.equal(authorizationUrl.origin, 'https://github.com');
  assert.equal(authorizationUrl.pathname, '/login/oauth/authorize');
  assert.equal(authorizationUrl.searchParams.get('redirect_uri'), base + '/api/auth/callback/github');
  assert.ok(authorizationUrl.searchParams.get('client_id'));
  assert.ok(authorizationUrl.searchParams.get('state'));
  console.log('PASS: real CSRF-protected GitHub OAuth initiation with correct callback; external consent NOT RUN');

  const signOutResponse = await fetch(base + '/api/auth/signout', {
    method: 'POST', headers: { Cookie: cookie, Origin: base },
    body: new URLSearchParams({ csrfToken, callbackUrl: base + '/panel', json: 'true' }),
  });
  assert.equal(signOutResponse.status, 200);
  assert.equal((await signOutResponse.json()).url, base + '/panel');
  console.log('PASS: CSRF-protected signout endpoint while anonymous; authenticated logout NOT RUN');

  const manifest = JSON.parse(readFileSync('.next/server/server-reference-manifest.json', 'utf8'));
  const actionId = Object.entries(manifest.node).find(([, action]) => action.exportedName === 'ruajOren')?.[0];
  assert.ok(actionId, 'Built server action exists');
  for (const id of ['1', '2']) {
    // React's multipart wire format: argument 0 is a FormData reference.
    const data = new FormData();
    data.set('0', '["$K1"]'); data.set('1_id', id); data.set('1_ora', '08:25');
    const response = await fetch(base + '/panel', {
      method: 'POST', headers: { 'Next-Action': actionId, Origin: base, Accept: 'text/x-component' }, body: data,
    });
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Duhet të identifikohesh me GitHub/);
    console.log(`PASS: real server action rejects anonymous update of ID ${id}`);
  }
  const after = await snapshot();
  assert.deepEqual(after, before);
  console.log('PASS: Neon unchanged after real rejected requests: ID 1=08:00; ID 2=08:15');
}

run().catch(() => {
  console.error('FAIL: Java 5 HTTP/database verification. Details suppressed to protect private data.');
  process.exitCode = 1;
});
