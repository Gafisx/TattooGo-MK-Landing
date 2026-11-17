import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
};

export function makeServer() {
  return createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      return res.end('Method not allowed');
    }
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://app.internal').pathname);
    } catch {
      res.writeHead(400);
      return res.end('Bad request');
    }
    const pageFiles = new Set(['/index.html', '/styles.css', '/script.js']);
    const assetPath = pathname.startsWith('/assets/') && !pathname.split('/').includes('..');
    const filename = pathname === '/' ? '/index.html' : pathname;
    if (!pageFiles.has(filename) && !assetPath) {
      res.writeHead(404);
      return res.end('Not found');
    }
    const fullPath = path.join(root, assetPath ? 'public' : '', filename);
    try {
      const content = await readFile(fullPath);
      res.writeHead(200, {
        'Content-Type': types[path.extname(fullPath)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
        'Content-Length': content.length,
      });
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch {
      res.writeHead(404);
      res.end('Not found');
    }
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5000);
  makeServer().listen(port, '0.0.0.0', () => {
    console.log(`TattooGo is listening on port ${port}`);
  });
}
