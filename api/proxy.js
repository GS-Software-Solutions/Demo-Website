const https = require('https');

const API_TARGET = 'https://api.sexytalk.io/inference';
const API_KEY = process.env.SEXYTALK_API_KEY || '';

module.exports = (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed.' }); return; }
  if (!API_KEY) { res.status(500).json({ error: 'Server proxy is not configured.' }); return; }

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
