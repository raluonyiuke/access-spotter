import { createServer } from 'node:http';

export const cleanPage = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Clean local fixture</title>
<style>body { color:#111; background:#fff; font:18px Arial; margin:24px; } button,input {font:inherit;min-height:44px;} button {padding:12px;}</style>
</head><body><main><h1>Contact us</h1><p>Send our team a question.</p>
<form><label for="email">Email address</label> <input type="email" id="email" autocomplete="email">
<button type="button">Save draft</button></form></main></body></html>`;

const brokenPage = `<!doctype html><html lang="en"><head><title>Broken local fixture</title></head><body><main>
<h1>Broken page</h1><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E">
<input id="unlabelled"><button id="empty-button"></button><a href="/clean" id="empty-link"></a>
<p id="bad-contrast" style="color:#aaa;background:#fff;font:16px Arial">Hard to read text</p>
</main></body></html>`;

export async function startFixture() {
  let origin;
  const visits = [];
  const server = createServer((request, response) => {
    const path = new URL(request.url, 'http://fixture').pathname;
    visits.push({ path, method: request.method });
    if (path === '/slow') return;
    if (path.startsWith('/browser-stall')) return;
    if (path.startsWith('/browser-mirror')) { response.writeHead(404); response.end('No browser archive'); return; }
    if (path === '/second-fails' && visits.filter(item => item.path === path).length > 1) {
      response.writeHead(500, { 'content-type': 'text/html' }); response.end('Second viewport failed'); return;
    }
    if (path === '/redirect') { response.writeHead(302, { location: `${origin.replace('127.0.0.1', 'localhost')}/clean` }); response.end(); return; }
    if (path === '/data') { response.writeHead(200, { 'content-type': 'application/json' }); response.end('{}'); return; }
    if (path === '/missing') { response.writeHead(404, { 'content-type': 'text/html' }); response.end(cleanPage); return; }
    response.writeHead(200, { 'content-type': path === '/spaced-content-type' ? 'text/html ; charset=utf-8' : 'text/html; charset=utf-8',
      ...(path === '/csp' ? { 'content-security-policy': "script-src 'none'; style-src 'unsafe-inline'" } : {}) });
    if (path === '/same-document') response.end(cleanPage.replace('</main>', `<script>setTimeout(() => { history.replaceState(null, '', location.pathname); location.hash='ready'; const p=document.createElement('p'); p.id='same-document-ready'; p.textContent='Ready'; document.querySelector('main').append(p); }, 50)</script></main>`));
    else if (path === '/late-same-origin') response.end(cleanPage.replace('</main>', `<script>setTimeout(() => location.href = '/navigated', 50)</script></main>`));
    else if (path === '/navigated') response.end(cleanPage.replace('<h1>', '<h1 id="navigated">'));
    else if (path === '/reload') response.end(cleanPage.replace('</main>', `<script>if (!sessionStorage.getItem('reloaded')) {sessionStorage.setItem('reloaded','1'); setTimeout(() => location.reload(), 50);} else {document.querySelector('h1').id='reloaded';}</script></main>`));
    else if (path === '/late-redirect') response.end(cleanPage.replace('</main>', `<script>setTimeout(() => location.href = ${JSON.stringify(origin.replace('127.0.0.1', 'localhost') + '/clean')}, 50)</script></main>`));
    else if (path === '/broken') response.end(brokenPage);
    else if (path === '/frame') response.end(cleanPage.replace('</main>', '<iframe title="Embedded form" src="/broken"></iframe></main>'));
    else if (path === '/review') response.end(cleanPage.replace('</main>', '<p style="background-image:linear-gradient(white,black);color:#999">Gradient text requires review</p></main>'));
    else if (path === '/targets') response.end(cleanPage.replace('</main>', '<div><button style="width:10px;height:10px;min-height:0;padding:0;font-size:6px">A</button><button style="width:10px;height:10px;min-height:0;padding:0;font-size:6px">B</button></div></main>'));
    else if (path === '/delayed') response.end(cleanPage.replace('</main>', '<script>setTimeout(() => { const b=document.createElement("button"); b.id="ready"; document.querySelector("main").append(b); }, 300)</script></main>'));
    else response.end(cleanPage);
  });
  await new Promise(resolve => server.listen(0, resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, visits, close: () => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }) };
}
