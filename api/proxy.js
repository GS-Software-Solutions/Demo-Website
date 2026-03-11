const https = require('https');

const API_TARGET = 'https://api.sexytalk.io/inference';
const API_KEY = 'ct-9c0cceda-4e0c-45bf-8e3c-ccd1e9bb2178';

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

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
        'x-api-key': API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const proxy = https.request(options, apiRes => {
      const chunks = [];
      apiRes.on('data', chunk => chunks.push(chunk));
      apiRes.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        res.status(apiRes.statusCode).setHeader('Content-Type', 'application/json; charset=utf-8').end(data);
      });
    });

    proxy.on('error', err => {
      res.status(502).json({ error: err.message });
    });

    proxy.write(body);
    proxy.end();
  });
};
