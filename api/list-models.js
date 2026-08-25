// TEMP DEBUG endpoint — lists Gemini models available to this API key so we
// can pick a valid model id for chat.js. Safe to call (GET, no side effects).
// Delete this file once the correct model id is confirmed.

module.exports = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'missing_api_key' });
    return;
  }
  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await upstream.json();
    const models = (data.models || [])
      .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => m.name);
    res.status(upstream.status).json({ status: upstream.status, models });
  } catch (err) {
    res.status(500).json({ error: 'fetch_failed', message: String(err) });
  }
};
