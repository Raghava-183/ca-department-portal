// Signed session cookie for the portal.
//
// The key is PORTAL_PASSWORD itself, so there is no second environment
// variable to set up. One consequence worth knowing: changing the password
// signs everyone out, which is what you want anyway.

const crypto = require('node:crypto');

const COOKIE = 'ca_portal';
const MAX_AGE = 60 * 60 * 12; // 12 hours

function key() {
  const k = process.env.PORTAL_PASSWORD;
  if (!k) throw new Error('PORTAL_PASSWORD is not set');
  return k;
}

const b64 = s => Buffer.from(s, 'utf8').toString('base64url');
const unb64 = s => Buffer.from(s, 'base64url').toString('utf8');
const sign = payload =>
  crypto.createHmac('sha256', key()).update(payload).digest('base64url');

function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function issue(res) {
  const body = b64(JSON.stringify({ iat: Date.now() }));
  const token = `${body}.${sign(body)}`;
  res.setHeader('Set-Cookie', [
    `${COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
    `Max-Age=${MAX_AGE}`,
  ].join('; '));
}

function valid(req) {
  const raw = req.headers.cookie || '';
  const hit = raw.split(';').map(c => c.trim())
    .find(c => c.startsWith(COOKIE + '='));
  if (!hit) return false;
  const token = hit.slice(COOKIE.length + 1);
  const dot = token.lastIndexOf('.');
  if (dot < 1) return false;
  const body = token.slice(0, dot);
  if (!safeEqual(token.slice(dot + 1), sign(body))) return false;
  try {
    const { iat } = JSON.parse(unb64(body));
    return typeof iat === 'number' && Date.now() - iat < MAX_AGE * 1000;
  } catch (e) {
    return false;
  }
}

/** Responds 401 and returns false when the caller is not signed in. */
function require_(req, res) {
  if (valid(req)) return true;
  res.status(401).json({ ok: false, error: 'Sign in again to save changes.' });
  return false;
}

module.exports = { issue, valid, require: require_ };
