/**
 * AI service: uses Google Gemini Vision to identify a medication from a photo.
 * The identified name is then looked up ONLY in the local database.
 *
 * Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.
 * Get a free key at: https://aistudio.google.com/apikey
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Send a base64-encoded image to Gemini and ask it to identify the medication name.
 * Returns the raw medication name string, or throws on failure.
 */
export async function recognizeMedicationFromImage(
  base64Image: string,
  mimeType: ImageMimeType = 'image/jpeg'
): Promise<string> {
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
              text: 'Look at this medication image. What is the generic (non-brand) name of this medication shown on the packaging or label? Reply with ONLY the generic medication name in English — nothing else, no explanation, no punctuation. If you cannot identify any medication, reply with exactly: UNKNOWN',
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const result: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'UNKNOWN';
  return result;
}
