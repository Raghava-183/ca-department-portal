// Checks the department password.
// The password itself is NEVER in this file or in the web page — it lives in
// Vercel under Settings > Environment Variables, as PORTAL_PASSWORD.

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Use POST.' });
    return;
  }

  const expected = process.env.PORTAL_PASSWORD;
  if (!expected) {
    res.status(500).json({
      ok: false,
      error: 'PORTAL_PASSWORD is not set in Vercel yet.'
    });
    return;
  }

  // Vercel parses JSON bodies for us, but handle a raw string just in case.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const given = body && typeof body.password === 'string' ? body.password : '';

  // Small delay so the password can't be guessed by rapid-fire attempts.
  await new Promise(r => setTimeout(r, 400));

  if (given.length === expected.length && given === expected) {
    res.status(200).json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: "That password didn't work. Try again." });
  }
};
