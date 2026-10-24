// Department stock records.
//
//   GET  /api/stocks            every room
//   POST /api/stocks            save one room  { code, data, by }
//
// Reading needs a signed-in session; so does saving. The table is created and
// seeded from api/_rooms.js the first time this is called.

const { neon } = require('@neondatabase/serverless');
const session = require('./_session.js');
const { REGISTERS, SEED, ORDER } = require('./_rooms.js');

let ready = false;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set in Vercel yet.');
  return neon(url);
}

async function ensure(sql) {
  if (ready) return;
  await sql`
    create table if not exists room_stock (
      code       text primary key,
      data       jsonb       not null,
      updated_at timestamptz not null default now(),
      updated_by text
    )`;
  // Seed any room that has no row yet. Existing rows are never overwritten,
  // so a new room can be added to _rooms.js and it appears on the next call.
  for (const code of ORDER) {
    await sql`
      insert into room_stock (code, data)
      values (${code}, ${JSON.stringify(SEED[code])}::jsonb)
      on conflict (code) do nothing`;
  }
  ready = true;
}

/** Keeps only the shape we expect, so a bad client cannot write junk. */
function clean(input) {
  const src = input && typeof input === 'object' ? input : {};
  const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
  const num = v => {
    if (v === null || v === '' || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 && n < 1e6 ? Math.round(n) : null;
  };

  const meta = src.meta || {};
  const registers = {};
  for (const [key] of REGISTERS) {
    const r = (src.registers || {})[key] || {};
    const s = String(r.status || '').toLowerCase();
    registers[key] = {
      status: ['yes', 'no', 'na'].includes(s) ? s : '',
      updated: str(r.updated, 40),
      remarks: str(r.remarks, 400),
    };
  }

  return {
    meta: {
      name:        str(meta.name, 120),
      type:        str(meta.type, 60),
      incharge:    str(meta.incharge, 120),
      capacity:    str(meta.capacity, 20),
      established: str(meta.established, 20),
    },
    registers,
    systems: (Array.isArray(src.systems) ? src.systems : []).slice(0, 20).map(s => ({
      label: str(s && s.label, 80),
      count: num(s && s.count),
      spec:  str(s && s.spec, 400),
    })),
    items: (Array.isArray(src.items) ? src.items : []).slice(0, 60).map(i => ({
      name:     str(i && i.name, 80),
      register: num(i && i.register),
      present:  num(i && i.present),
      working:  num(i && i.working),
      damaged:  num(i && i.damaged),
    })),
    photos: (Array.isArray(src.photos) ? src.photos : []).slice(0, 60).map(p => ({
      url:     str(p && p.url, 600),
      caption: str(p && p.caption, 160),
      at:      str(p && p.at, 40),
    })).filter(p => /^https:\/\//i.test(p.url)),
    proofs: (Array.isArray(src.proofs) ? src.proofs : []).slice(0, 40).map(p => ({
      label: str(p && p.label, 120),
      url:   str(p && p.url, 600),
      note:  str(p && p.note, 300),
    })).filter(p => p.label || p.url),
    verification: {
      date: str((src.verification || {}).date, 40),
      by:   str((src.verification || {}).by, 120),
    },
  };
}

module.exports = async (req, res) => {
  if (!session.require(req, res)) return;

  let sql;
  try {
    sql = db();
    await ensure(sql);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
    return;
  }

  try {
    if (req.method === 'GET') {
      const rows = await sql`select code, data, updated_at, updated_by from room_stock`;
      const rooms = {};
      for (const r of rows) {
        rooms[r.code] = {
          ...r.data,
          _updated_at: r.updated_at,
          _updated_by: r.updated_by || '',
        };
      }
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({ ok: true, order: ORDER, registers: REGISTERS, rooms });
      return;
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) { body = {}; }
      }
      const code = body && typeof body.code === 'string' ? body.code : '';
      if (!ORDER.includes(code)) {
        res.status(400).json({ ok: false, error: 'Unknown room.' });
        return;
      }
      const data = clean(body.data);
      const by = typeof body.by === 'string' ? body.by.slice(0, 120) : '';

      const rows = await sql`
        insert into room_stock (code, data, updated_at, updated_by)
        values (${code}, ${JSON.stringify(data)}::jsonb, now(), ${by})
        on conflict (code) do update
          set data = excluded.data,
              updated_at = now(),
              updated_by = excluded.updated_by
        returning updated_at, updated_by`;

      res.status(200).json({
        ok: true,
        updated_at: rows[0].updated_at,
        updated_by: rows[0].updated_by || '',
      });
      return;
    }

    res.status(405).json({ ok: false, error: 'Use GET or POST.' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message || e) });
  }
};
