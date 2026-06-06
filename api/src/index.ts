export interface Env {
  GEMINI_API_KEY: string;
}

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPT = `You are a pharmacist. Look at this medication image and list ALL active ingredients.

IMPORTANT: Many medications contain 2, 3, or 4 active ingredients. You MUST list every single one — do not stop after the first ingredient.

For each active ingredient, write one line with all its names separated by commas (generic name first).

Format — one ingredient per line:
genericName, brandName, alternativeSpelling

Examples:

Single ingredient:
ibuprofen, advil, brufen, nurofen

Two ingredients:
amoxicillin, amoxil, trimox
clavulanic acid, clavulanate

Three ingredients:
trimethoprim
sulfamethoxazole, sulphamethoxazole
codeine, methylmorphine

Output ONLY the ingredient lines, nothing else. If you cannot identify any medication, output exactly: UNKNOWN`;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Basic size guard — images shouldn't exceed 10 MB base64
    const contentLength = Number(request.headers.get('content-length') ?? 0);
    if (contentLength > 10_000_000) {
      return new Response(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    let body: { image?: string; mimeType?: string };
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const { image, mimeType = 'image/jpeg' } = body;
    if (!image) {
      return new Response(JSON.stringify({ error: 'Missing image field' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType, data: image } },
              { text: PROMPT },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    });

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ error: 'Gemini error', detail: data }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const raw: string =
      (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'UNKNOWN';

    return new Response(JSON.stringify({ result: raw }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  },
};
