// Exercícios usam Gemini quando configurado. As demais funções usam Anthropic.
// A chave fica só em variável de ambiente (nunca no código público).
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  const code = process.env.ACCESS_CODE;
  if (code && req.headers['x-access-code'] !== code) return res.status(401).json({ error: 'codigo' });
  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  } catch {
    return res.status(400).json({ error: 'entrada' });
  }
  const msgs = body?.messages;
  if (!Array.isArray(msgs) || !msgs.length || JSON.stringify(msgs).length > 20000)
    return res.status(400).json({ error: 'entrada' });
  const geminiKey = process.env.GEMINI_API_KEY;
  if (body.purpose === 'exercises' && geminiKey) return generateExercises(msgs, geminiKey, res);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'sem_chave' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5',
        max_tokens: 4000,
        system: 'Responda exatamente no formato pedido, sem texto extra antes ou depois.',
        messages: msgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) })),
      }),
    });
    if (r.status === 429) return res.status(429).json({ error: 'limite' });
    if (!r.ok) return res.status(502).json({ error: 'ia' });
    const j = await r.json();
    const text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
    return res.status(200).json({ text });
  } catch (e) {
    return res.status(502).json({ error: 'rede' });
  }
};


async function generateExercises(messages, key, res) {
  if (messages.length !== 1 || messages[0]?.role !== 'user' || typeof messages[0].content !== 'string')
    return res.status(400).json({ error: 'entrada' });
  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: messages[0].content }] }],
          generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 8192 },
        }),
      },
    );
    if (response.status === 429) return res.status(429).json({ error: 'limite' });
    if (!response.ok) return res.status(502).json({ error: 'ia' });
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.filter(part => !part.thought)
      .map(part => part.text || '').join('');
    if (!text) return res.status(502).json({ error: 'ia' });
    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: 'rede' });
  }
}
