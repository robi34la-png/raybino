export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Keine Nachricht erhalten' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API Key nicht konfiguriert' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Du bist Bello, ein smarter KI-Assistent der direkt über Ray-Ban Meta Smart Glasses läuft. 
        
        Deine Antworten sind:
        - Kurz und präzise (max 2-3 Sätze)
        - Auf Deutsch
        - Klar verständlich wenn vorgelesen
        - Direkt und hilfreich
        - Kein Markdown, keine Listen - nur fließender Text
        
        Du hilfst bei allem: Objekte erkennen, Fragen beantworten, übersetzen, navigieren, Personen analysieren, Business-Coaching und mehr.`,
        messages: [
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API Fehler: ${response.status}`);
    }

    const data = await response.json();
    const answer = data.content[0].text;

    return res.status(200).json({ response: answer });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
