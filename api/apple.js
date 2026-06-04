// /api/apple — Apple Health bridge (no native app needed).
//
//   POST  (from an Apple Shortcut on your iPhone): save your latest Health
//         metrics.  GET (from the dashboard): read them back.
//
// Apple won't let a website read Health directly, so an Apple Shortcut pushes
// the numbers here on a schedule. Stored in your own Supabase `app_state` table
// (row 'apple-health') using the SAME env vars the rest of the app uses:
//   SUPABASE_URL, SUPABASE_ANON_KEY
// Optional: set APPLE_SYNC_TOKEN in Vercel and put the same value in your
// Shortcut's URL (?token=…) so only you can write.

const SB_URL = (process.env.SUPABASE_URL || '').trim();
const SB_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const TOKEN  = (process.env.APPLE_SYNC_TOKEN || '').trim();
const ROW = 'apple-health';

function sbHeaders() { return { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }; }
function readBody(req) { return new Promise((resolve) => { let d = ''; req.on('data', (c) => d += c); req.on('end', () => resolve(d)); req.on('error', () => resolve('')); }); }
function num(x) { if (x == null || x === '') return null; const n = Number(String(x).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : null; }

module.exports = async (req, res) => {
  res.setHeader('content-type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return; }
  if (!SB_URL || !SB_KEY) { res.statusCode = 200; res.end(JSON.stringify({ ok: false, connected: false, error: 'not_configured' })); return; }

  // ---- read what the Shortcut last pushed ----
  if (req.method === 'GET') {
    try {
      const r = await fetch(SB_URL + '/rest/v1/app_state?key=eq.' + ROW + '&select=data', { headers: sbHeaders() });
      const arr = await r.json();
      const d = (Array.isArray(arr) && arr[0] && arr[0].data) ? arr[0].data : null;
      res.statusCode = 200;
      res.end(JSON.stringify(d ? Object.assign({ ok: true, connected: true }, d) : { ok: true, connected: false }));
    } catch (e) { res.statusCode = 200; res.end(JSON.stringify({ ok: false, connected: false, error: 'read_failed' })); }
    return;
  }

  // ---- Shortcut pushes new numbers ----
  if (req.method === 'POST') {
    const q = new URL(req.url, 'http://x').searchParams;
    if (TOKEN && q.get('token') !== TOKEN) { res.statusCode = 401; res.end(JSON.stringify({ ok: false, error: 'bad_token' })); return; }
    let body = {};
    try { const raw = await readBody(req); body = raw ? JSON.parse(raw) : {}; } catch (e) { body = {}; }
    const g = (k) => (body[k] != null ? body[k] : q.get(k));
    const data = {
      source: 'apple', connected: true, ts: Date.now(),
      recovery: num(g('recovery')),                 // Apple has no recovery score — leave blank or feed a readiness app
      sleepHours: num(g('sleepHours')),
      sleepPerf: num(g('sleepPerf')),
      sleepTargetHours: num(g('sleepTargetHours')) || 8,
      hrv: num(g('hrv')),
      rhr: num(g('rhr')),
      bedtime: g('bedtime') || null,
      wakeTime: g('wakeTime') || null,
      strain: num(g('strain')),
    };
    try {
      await fetch(SB_URL + '/rest/v1/app_state', {
        method: 'POST',
        headers: Object.assign(sbHeaders(), { Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify([{ key: ROW, data, updated_at: new Date(data.ts).toISOString() }]),
      });
      res.statusCode = 200; res.end(JSON.stringify({ ok: true, saved: data }));
    } catch (e) { res.statusCode = 200; res.end(JSON.stringify({ ok: false, error: 'write_failed' })); }
    return;
  }

  res.statusCode = 405; res.end(JSON.stringify({ ok: false, error: 'method_not_allowed' }));
};
