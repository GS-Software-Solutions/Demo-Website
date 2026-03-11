const http = require('http');
const https = require('https');

const API_TARGET = 'https://api.sexytalk.io/chatcompletion';
const PORT = 3001;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST')    { res.writeHead(405); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const url = new URL(API_TARGET);
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': req.headers['x-api-key'] || '',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const proxy = https.request(options, apiRes => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
        res.end(data);
      });
    });

    proxy.on('error', err => {
      res.writeHead(502); res.end(JSON.stringify({ error: err.message }));
    });

    proxy.write(body);
    proxy.end();
  });
}).listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
