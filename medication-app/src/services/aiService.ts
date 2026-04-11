/**
 * AI service: uses Google Gemini Vision to identify a medication from a photo.
 * The identified name is then looked up ONLY in the local database.
 *
 * Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.
 * Get a free key at: https://aistudio.google.com/apikey
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent`;

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Send a base64-encoded image to Gemini and ask it to identify the medication.
 * Returns a list of possible names (brand + generic) to try against the database.
 */
export async function recognizeMedicationFromImage(
  base64Image: string,
  mimeType: ImageMimeType = 'image/jpeg'
): Promise<string[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
            {
              text: `You are a pharmacist and medical expert. Analyze this medication image using your full knowledge.

Look at everything in the image: the packaging design, text in any language, logo, colors, pill shape, and any other visual cues. Use your medical knowledge to identify what medication this is.

Your response must be a comma-separated list of names for this medication in English, including:
1. The generic/active ingredient name (most important)
2. The brand name if you recognize it
3. Any alternative names or common spellings

Order them from most confident to least confident.

Examples:
- "amoxicillin, amoxil, trimox"
- "ibuprofen, advil, brufen, nurofen"
- "paracetamol, acetaminophen, panadol, tylenol"

Reply with ONLY the comma-separated list. If you truly cannot identify any medication, reply with exactly: UNKNOWN`,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'UNKNOWN';

  if (raw === 'UNKNOWN' || raw === '') return ['UNKNOWN'];

  // Parse comma-separated names, clean each one
  const names = raw
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter((n) => n.length > 1);

  return names.length > 0 ? names : ['UNKNOWN'];
}
