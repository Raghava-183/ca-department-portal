// Room photographs.
//
//   POST   /api/photos   { code, name, dataUrl }   stores one photo
//   DELETE /api/photos   { url }                   removes one photo
//
// The browser shrinks each picture to at most 1600px and re-encodes it as
// JPEG before sending, so what arrives here is a few hundred kilobytes rather
// than the several megabytes a phone camera produces. That keeps us well
// inside the request size a serverless function accepts, and makes the
// gallery quick to open.
//
// Needs BLOB_READ_WRITE_TOKEN, which Vercel adds when you create a Blob store
// under Storage.

const { put, del } = require('@vercel/blob');
const session = require('./_session.js');
const { ORDER } = require('./_rooms.js');

const MAX_BYTES = 3 * 1024 * 1024;   // after shrinking, nothing should approach this

function token() {
  const t = process.env.BLOB_READ_WRITE_TOKEN;
  if (!t) throw new Error('BLOB_READ_WRITE_TOKEN is not set in Vercel yet.');
  return t;
}

function body(req) {
  let b = req.body;
  if (typeof b === 'string') {
    try { b = JSON.parse(b); } catch (e) { b = {}; }
  }
  return b && typeof b === 'object' ? b : {};
}

/** Turns a safe, recognisable file name out of whatever the browser sent. */
function safeName(name) {
  const base = String(name || 'photo')
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .trim()
    .slice(0, 48) || 'photo';
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stamp}-${base}-${rand}.jpg`;
}

module.exports = async (req, res) => {
  if (!session.require(req, res)) return;

  try {
    if (req.method === 'POST') {
      const b = body(req);
      const code = typeof b.code === 'string' ? b.code : '';
      if (!ORDER.includes(code)) {
        res.status(400).json({ ok: false, error: 'Unknown room.' });
        return;
      }

      const dataUrl = typeof b.dataUrl === 'string' ? b.dataUrl : '';
      const m = /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
      if (!m) {
        res.status(400).json({ ok: false, error: 'That file is not an image the portal can store.' });
        return;
      }

      const buf = Buffer.from(m[2], 'base64');
      if (buf.length > MAX_BYTES) {
        res.status(413).json({ ok: false, error: 'That photo is too large even after shrinking. Try one picture at a time.' });
        return;
      }

      const blob = await put(`rooms/${code}/${safeName(b.name)}`, buf, {
        access: 'public',
        contentType: 'image/jpeg',
        token: token(),
      });

      res.status(200).json({ ok: true, url: blob.url, at: new Date().toISOString() });
      return;
    }

    if (req.method === 'DELETE') {
      const b = body(req);
      const url = typeof b.url === 'string' ? b.url : '';
      if (!/^https:\/\/[a-z0-9.-]*\.(vercel-storage\.com|blob\.vercel-storage\.com)\//i.test(url)) {
        res.status(400).json({ ok: false, error: 'That is not a photo stored by this portal.' });
        return;
      }
      await del(url, { token: token() });
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ ok: false, error: 'Use POST or DELETE.' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
