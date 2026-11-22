// Vercel Serverless Function: /api/espn?path=/apis/site/v2/sports/soccer/eng.1/scoreboard?dates=20261122
//
// بۆچی؟
//  - وەڵامەکان لە CDN ی Vercel کاش دەکرێن (٢٠ چرکە)، بۆیە ٥٠٠ بەکارهێنەر = تەنها چەند داواکارییەک بۆ ESPN.
//  - ئەگەر ESPN CORS گۆڕی یان بلۆکی کرد، سایتەکەت ناڕووخێت.
//  - تەنها ناونیشانەکانی تۆپی پێ (soccer) ڕێگەپێدراون، بۆیە ناتوانرێت وەک proxy ی گشتی بەکاربهێنرێت.

const HOST = 'https://site.api.espn.com';
const ALLOWED_PREFIXES = ['/apis/site/v2/sports/soccer/', '/apis/v2/sports/soccer/'];

export default async function handler(req, res) {
  const path = String(req.query.path || '');

  const ok =
    ALLOWED_PREFIXES.some((p) => path.startsWith(p)) &&
    !path.includes('..') &&
    !path.includes('//') &&
    !path.includes('@') &&
    path.length < 400;

  if (!ok) {
    res.status(400).json({ error: 'bad path' });
    return;
  }

  try {
    const upstream = await fetch(HOST + path, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LiveSportKRD/1.0)' },
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `upstream ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=20, stale-while-revalidate=60');
    res.status(200).json(data);
  } catch {
    res.status(502).json({ error: 'upstream failed' });
  }
}
