const http = require('http');
const fs = require('fs');
const path = require('path');
const root = __dirname;
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404).end('Not found'); return; }
    res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm'})[path.extname(file)] || 'application/octet-stream');
    res.end(content);
  });
}).listen(4173, '127.0.0.1', () => console.log('Preview: http://127.0.0.1:4173'));
