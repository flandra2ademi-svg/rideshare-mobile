import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const component = readFileSync('components/Vendtakimi.tsx', 'utf8');
const testPage = readFileSync('app/java-08-test/page.tsx', 'utf8');
const config = JSON.parse(readFileSync('mobile-week08.json', 'utf8'));

test('Java 8 test page reuses the real meeting-point component and has local route data', () => {
  assert.match(testPage, /Vendtakimi/);
  assert.doesNotMatch(testPage, /lib\/udhetimet|Neon|database/i);
  assert.deepEqual(config, { version: 1, path: '/java-08-test' });
});

test('meeting-point component contains each required test hook and state model', () => {
  for (const id of ['meeting-input', 'confirm-meeting', 'confirmed-meeting', 'meeting-error', 'locate-me', 'location-status', 'location-accuracy']) {
    assert.equal(component.split(`data-testid={showTestIds ? "${id}" : undefined}`).length - 1, 1, `${id} should have one runtime hook`);
  }
  for (const state of ['idle', 'loading', 'success', 'denied', 'timeout', 'unavailable']) assert.match(component, new RegExp(`"${state}"`));
  assert.match(component, /draft\.trim\(\)/);
  assert.match(component, /getCurrentPosition/);
  assert.match(component, /timeout: 10000/);
});

test('GPS coordinates are not sent or persisted by the meeting-point component', () => {
  assert.doesNotMatch(component, /fetch\(|axios|localStorage|sessionStorage|database|Neon/i);
  assert.doesNotMatch(component, /latitude|longitude/);
});
