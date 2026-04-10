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
              text: `Read this medication packaging image carefully. Extract the medication name(s) exactly as printed on the label.

Instructions:
- Read the EXACT text printed on the box/label for the drug name
- Include the main brand name, generic name, and active ingredient(s) if visible
- Reply with ONLY a comma-separated list of the names you can read, in English
- Do NOT guess or infer — only include names actually printed on the packaging
- If the label is in Arabic, transliterate the drug name to English

Example reply: augmentin, amoxicillin, clavulanate

If you cannot read any medication name, reply with exactly: UNKNOWN`,
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
