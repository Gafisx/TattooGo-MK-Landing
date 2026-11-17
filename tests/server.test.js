import test from 'node:test';
import assert from 'node:assert/strict';
import { makeServer } from '../server.js';

test('serves the landing page and protects non-public files', async (t) => {
  const server = makeServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const route of ['/', '/styles.css', '/script.js', '/assets/images/cliente.png']) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    assert.ok((await response.arrayBuffer()).byteLength > 0, route);
  }
  for (const route of ['/server.js', '/package.json', '/.replit', '/missing', '/assets/%2e%2e%2fserver.js']) {
    assert.equal((await fetch(base + route)).status, 404, route);
  }
  assert.equal((await fetch(base, { method: 'POST' })).status, 405);
  const head = await fetch(base, { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});
