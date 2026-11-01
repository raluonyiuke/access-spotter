import assert from 'node:assert/strict';
import { test } from 'node:test';
import { profileTags, validateUrl, abortable } from '../dist/scan.js';
import { cleanText, publicUrl, safeText } from '../dist/output.js';

test('URL validation allows local HTTP/S and rejects unsupported or credentialed inputs', () => {
  assert.equal(validateUrl('http://localhost:3000'), 'http://localhost:3000/');
  for (const url of ['example.com', 'file:///tmp/a.html', 'javascript:alert(1)', 'https://user:secret@example.com']) assert.throws(() => validateUrl(url));
});

test('profiles select cumulative axe tags without confusing 2.2 with 2.0', () => {
  assert.deepEqual(profileTags('2.0'), ['wcag2a', 'wcag2aa']);
  assert.ok(profileTags('2.1').includes('wcag21aa'));
  assert.ok(!profileTags('2.1').includes('wcag22aa'));
  assert.ok(profileTags('2.2').includes('wcag22aa'));
});

test('output strips terminal controls and private URL components', () => {
  assert.equal(publicUrl('https://user:secret@example.com/path?token=private#part'), 'https://example.com/path');
  assert.equal(cleanText('\u001b[31mred\u001b[0m\u202e'), 'red');
  assert.ok(!safeText('Error at https://example.com/page?token=secret#private').includes('secret'));
  assert.ok(!safeText('[href="/path?token=secret"]').includes('secret'));
});

test('abort races reject without waiting for a stalled operation', async () => {
  const controller = new AbortController();
  const pending = abortable(new Promise(() => {}), controller.signal);
  controller.abort(new Error('cancelled'));
  await assert.rejects(pending, /cancelled/);
});
