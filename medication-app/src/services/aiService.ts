/**
 * AI service: uses Claude Vision to identify a medication from a photo.
 * The identified name is then looked up ONLY in the local database.
 *
 * Set EXPO_PUBLIC_ANTHROPIC_API_KEY in your .env file.
 */

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Send a base64-encoded image to Claude and ask it to identify the medication name.
 * Returns the raw medication name string, or throws on failure.
 */
export async function recognizeMedicationFromImage(
  base64Image: string,
  mimeType: ImageMimeType = 'image/jpeg'
): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set. Please add it to your .env file.');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: 'Look at this medication image. What is the generic (non-brand) name of this medication shown on the packaging or label? Reply with ONLY the generic medication name in English — nothing else, no explanation, no punctuation. If you cannot identify any medication, reply with exactly: UNKNOWN',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const result: string = data?.content?.[0]?.text?.trim() ?? 'UNKNOWN';
  return result;
}
