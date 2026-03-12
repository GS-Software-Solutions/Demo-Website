const http = require('http');
const https = require('https');

const API_TARGET = 'https://api.sexytalk.io/inference';
const API_KEY = 'ct-9c0cceda-4e0c-45bf-8e3c-ccd1e9bb2178';
function loadOpenAIKey() {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  try {
    const env = require('fs').readFileSync(__dirname + '/.env', 'utf8');
    const m = env.match(/OPENAI_API_KEY=(.*)/);
    return m ? m[1].trim() : '';
  } catch(e) { return ''; }
}
const OPENAI_KEY = loadOpenAIKey();
const PORT = 3001;

http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method !== 'POST') { res.writeHead(405); res.end(); return; }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const pathname = new URL(req.url, 'http://localhost').pathname;

    if (pathname === '/langcheck') {
      // ── Language check via OpenAI ──
      const { message, sourceLanguage } = JSON.parse(body);

      const prompt = `You are a strict language identification system. Your primary function is to determine if a given text is predominantly ${sourceLanguage}.

Your response MUST be exactly one of these XML tags:
<YES/>
<NO/>

Do not output anything else.

Follow these rules precisely:

Predominantly ${sourceLanguage}:
If the text's grammar, vocabulary, and structure are ${sourceLanguage}, output <YES/>.
This includes text containing a few common loanwords from other languages that have been absorbed into ${sourceLanguage} usage.

Other Languages:
If the text is clearly written in any language other than ${sourceLanguage}, output <NO/>.

Mixed Language:
If a sentence contains a ${sourceLanguage} word but the core structure and majority of words are from another language, output <NO/>.
Reject mixed-language sentences unless they are clearly ${sourceLanguage} with only a couple of foreign loanwords.
Keep in mind swiss german equals normal german!

Edge Cases:
If the input is completely empty or contains only one word → output <YES/>.
If the input contains ONLY numbers, emojis (e.g. 😎), or punctuation (e.g. "?", "!", ".") → output <YES/>.
Short universal words like "Hey", "Hi", "Baby", "sorry", "okay", "wow" should be treated as ${sourceLanguage} → output <YES/>.
When in doubt, if the message does not feel like it was written by a native ${sourceLanguage} speaker, output <NO/>.`;

      const payload = JSON.stringify({
        model: 'gpt-4.1-mini',
        temperature: 0.1,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message },
        ],
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const proxy = https.request(options, apiRes => {
        const chunks = [];
        apiRes.on('data', chunk => chunks.push(chunk));
        apiRes.on('end', () => {
          const data = Buffer.concat(chunks).toString('utf8');
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(data);
        });
      });
      proxy.on('error', err => {
        res.writeHead(502); res.end(JSON.stringify({ error: err.message }));
      });
      proxy.write(payload);
      proxy.end();

    } else {
      // ── Default: sexytalk API proxy ──
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
          res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(data);
        });
      });
      proxy.on('error', err => {
        res.writeHead(502); res.end(JSON.stringify({ error: err.message }));
      });
      proxy.write(body);
      proxy.end();
    }
  });
}).listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
