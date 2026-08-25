module.exports = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.json({ step: 'api_key', ok: false, error: 'GEMINI_API_KEY not set' }); return; }

  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.5-flash'];
  const results = [];

  for (const model of models) {
    try {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Di hola en una frase corta' }] }],
            systemInstruction: { parts: [{ text: 'Responde en español, una frase.' }] },
            generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
          }),
        }
      );
      const data = await r.json();
      if (r.ok) {
        const reply = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
        results.push({ model, ok: true, reply });
      } else {
        results.push({ model, ok: false, status: r.status, error: JSON.stringify(data).slice(0, 300) });
      }
    } catch (e) {
      results.push({ model, ok: false, error: String(e) });
    }
  }

  res.json({ results });
};
