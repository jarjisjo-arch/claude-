import medicationsData from '../data/medications.json';

export interface Medication {
  id: number;
  searchTerms: string[];
  nameEn: string;
  nameAr: string;
  pregnancyCategory: string;
  descriptionEn: string;
  descriptionAr: string;
  warningEn: string;
  warningAr: string;
}

const medications: Medication[] = medicationsData.medications as Medication[];

/**
 * Search for a medication by name.
 * Matches against all searchTerms (case-insensitive, partial match supported).
 * Returns only from the local database — no external lookup.
 */
export function searchMedication(query: string): Medication | null {
  if (!query || query.trim().length === 0) return null;

  const normalizedQuery = query.trim().toLowerCase();

  // 1. Exact match first
  const exactMatch = medications.find((med) =>
    med.searchTerms.some((term) => term.toLowerCase() === normalizedQuery)
  );
  if (exactMatch) return exactMatch;

  // 2. Starts-with match
  const startsWithMatch = medications.find((med) =>
    med.searchTerms.some((term) => term.toLowerCase().startsWith(normalizedQuery))
  );
  if (startsWithMatch) return startsWithMatch;

  // 3. Contains match
  const containsMatch = medications.find((med) =>
    med.searchTerms.some((term) => term.toLowerCase().includes(normalizedQuery))
  );
  if (containsMatch) return containsMatch;

  // 4. Query contains one of the search terms
  const reverseMatch = medications.find((med) =>
    med.searchTerms.some((term) => normalizedQuery.includes(term.toLowerCase()))
  );
  if (reverseMatch) return reverseMatch;

  return null;
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    A: '#16a34a',
    B: '#22c55e',
    C: '#f59e0b',
    'C/D': '#f97316',
    D: '#ea580c',
    X: '#dc2626',
  };
  return map[category] ?? '#6b7280';
}

export function getCategoryBgColor(category: string): string {
  const map: Record<string, string> = {
    A: '#dcfce7',
    B: '#dcfce7',
    C: '#fef3c7',
    'C/D': '#ffedd5',
    D: '#ffedd5',
    X: '#fee2e2',
  };
  return map[category] ?? '#f3f4f6';
}
