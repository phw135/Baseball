const NAVER_BASE = 'https://api-gw.sports.naver.com';

const ALLOWED = [
  /^\/schedule\/games(?:\?|\/)/,
  /^\/statistics\/categories\/kbo\/seasons\/\d{4}\/teams(?:\?|$)/
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET only' });

  const path = typeof req.query.path === 'string' ? req.query.path : '';
  if (!path || !path.startsWith('/') || !ALLOWED.some((rule) => rule.test(path))) {
    return res.status(400).json({ error: 'Invalid KBO API path' });
  }

  try {
    const upstream = await fetch(NAVER_BASE + path, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Baseball-Live-Hub/1.0'
      }
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(text);
  } catch (error) {
    return res.status(502).json({ error: 'Upstream request failed', detail: String(error) });
  }
}
