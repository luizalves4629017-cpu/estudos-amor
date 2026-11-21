// Função serverless da Vercel: recebe {messages} e chama a API da Anthropic.
// A chave fica só em variável de ambiente (nunca no código público).
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'metodo' });
  const code = process.env.ACCESS_CODE;
  if (code && req.headers['x-access-code'] !== code) return res.status(401).json({ error: 'codigo' });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'sem_chave' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const msgs = body.messages;
  if (!Array.isArray(msgs) || !msgs.length || JSON.stringify(msgs).length > 20000)
    return res.status(400).json({ error: 'entrada' });
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
