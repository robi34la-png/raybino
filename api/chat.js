export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, image } = req.body;
  if (!message) return res.status(400).json({ error: 'Keine Nachricht' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API Key fehlt' });

  try {
    const content = [];
    if (image) {
      content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } });
    }
    content.push({ type: 'text', text: message });

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Du bist Bello, ein smarter KI-Assistent für Ray-Ban Meta Smart Glasses.
Antworte immer auf Deutsch, kurz (max 2-3 Sätze), klar und direkt.
Kein Markdown, keine Listen - nur fließender Text der gut vorgelesen klingt.
Du hilfst bei allem: Objekte erkennen, Fragen beantworten, übersetzen, navigieren, Coaching und mehr.`,
        messages: [{ role: 'user', content }]
      })
    });

    if (!response.ok) throw new Error('Claude API Fehler: ' + response.status);
    const data = await response.json();
    return res.status(200).json({ response: data.content[0].text });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
