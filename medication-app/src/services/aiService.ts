/**
 * AI service: uses Google Gemini Vision to identify all active ingredients
 * in a medication photo. Each ingredient is returned as its own group of names
 * so the caller can search each one independently in the local database.
 *
 * Set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.
 * Get a free key at: https://aistudio.google.com/apikey
 */

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

/**
 * Send a base64-encoded image to Gemini and identify ALL active ingredients.
 * Returns an array of ingredient groups — each group is an array of name
 * variants (generic name first, then brand names / alternative spellings).
 *
 * Example single ingredient:   [["ibuprofen", "advil", "brufen"]]
 * Example combination:         [["amoxicillin", "amoxil"], ["clavulanic acid", "clavulanate"]]
 */
export async function recognizeMedicationFromImage(
  base64Image: string,
  mimeType: ImageMimeType = 'image/jpeg'
): Promise<string[][]> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set. Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: { mime_type: mimeType, data: base64Image },
            },
            {
              text: `You are a pharmacist. Look at this medication image and list ALL active ingredients.

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

Output ONLY the ingredient lines, nothing else. If you cannot identify any medication, output exactly: UNKNOWN`,
            },
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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? 'UNKNOWN';

  if (raw === 'UNKNOWN' || raw === '') return [['UNKNOWN']];

  // Parse: each line = one ingredient, commas = alternative names for that ingredient
  const groups = raw
    .split('\n')
    .map((line) =>
      line
        .split(',')
        .map((n) => n.trim().toLowerCase())
        .filter((n) => n.length > 1)
    )
    .filter((group) => group.length > 0);

  return groups.length > 0 ? groups : [['UNKNOWN']];
}
