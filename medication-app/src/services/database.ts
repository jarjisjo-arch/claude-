import medicationsData from '../data/medications.json';
import Fuse from 'fuse.js';

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

const fuse = new Fuse(medications, {
  keys: ['nameEn', 'nameAr', 'searchTerms'],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 2,
});

export function getSuggestions(query: string, language = 'en', limit = 6): string[] {
  if (!query || query.trim().length < 2) return [];
  return fuse
    .search(query.trim(), { limit })
    .map(r => (language === 'ar' ? r.item.nameAr : r.item.nameEn))
    .filter(Boolean);
}

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

  // 5. Word-level match — any word in query matches any word in a search term
  const queryWords = normalizedQuery.split(/\s+/).filter((w) => w.length > 3);
  if (queryWords.length > 0) {
    const wordMatch = medications.find((med) =>
      med.searchTerms.some((term) =>
        queryWords.some((word) => term.toLowerCase().includes(word))
      )
    );
    if (wordMatch) return wordMatch;
  }

  return null;
}

/** Result of searching one ingredient from a combination medication */
export interface IngredientResult {
  names: string[];         // all name variants Gemini returned for this ingredient
  matchedName: string;     // the name that found a DB match (or first name if not found)
  medication: Medication | null;
}

/** Danger rank — higher = more dangerous. Used to sort combination results. */
export const CATEGORY_RANK: Record<string, number> = {
  X: 7, D: 6, C: 5, B3: 4, B2: 3, 'B1/B2': 3, 'A/B2': 2, B1: 2, A: 1,
};

/** Returns the most dangerous category across all found ingredients, or null if none found. */
export function getOverallCategory(results: IngredientResult[]): string | null {
  const found = results.filter((r) => r.medication !== null);
  if (found.length === 0) return null;
  return found.reduce((worst, r) => {
    const cat = r.medication!.pregnancyCategory;
    return (CATEGORY_RANK[cat] ?? 0) > (CATEGORY_RANK[worst] ?? 0) ? cat : worst;
  }, found[0].medication!.pregnancyCategory);
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    A: '#16a34a',
    'A/B2': '#22c55e',
    B1: '#22c55e',
    'B1/B2': '#22c55e',
    B2: '#4ade80',
    B3: '#84cc16',
    C: '#f59e0b',
    D: '#ea580c',
    X: '#dc2626',
  };
  return map[category] ?? '#6b7280';
}

export function getCategoryBgColor(category: string): string {
  const map: Record<string, string> = {
    A: '#dcfce7',
    'A/B2': '#dcfce7',
    B1: '#dcfce7',
    'B1/B2': '#dcfce7',
    B2: '#dcfce7',
    B3: '#f7fee7',
    C: '#fef3c7',
    D: '#ffedd5',
    X: '#fee2e2',
  };
  return map[category] ?? '#f3f4f6';
}
