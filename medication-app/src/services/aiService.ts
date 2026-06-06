const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

type ImageMimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';

export async function recognizeMedicationFromImage(
  base64Image: string,
  mimeType: ImageMimeType = 'image/jpeg'
): Promise<string[][]> {
  if (!API_URL) {
    throw new Error('EXPO_PUBLIC_API_URL is not set in .env');
  }

  const response = await fetch(`${API_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, mimeType }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw: string = (data as any)?.result?.trim() ?? 'UNKNOWN';

  if (raw === 'UNKNOWN' || raw === '') return [['UNKNOWN']];

  const groups = raw
    .split('\n')
    .map((line: string) =>
      line
        .split(',')
        .map((n: string) => n.trim().toLowerCase())
        .filter((n: string) => n.length > 1)
    )
    .filter((group: string[]) => group.length > 0);

  return groups.length > 0 ? groups : [['UNKNOWN']];
}
