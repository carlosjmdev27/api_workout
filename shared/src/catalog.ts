/** Muscle groups of the exercise catalog (stored as these exact values). */
export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Bíceps', 'Tríceps', 'Core', 'Cardio'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = ['Barra', 'Mancuernas', 'Polea', 'Máquina', 'Peso Corporal'] as const;
export type Equipment = (typeof EQUIPMENT)[number];

export function isMuscleGroup(value: string): value is MuscleGroup {
  return (MUSCLE_GROUPS as readonly string[]).includes(value);
}

export function isEquipment(value: string): value is Equipment {
  return (EQUIPMENT as readonly string[]).includes(value);
}

/**
 * Search/uniqueness key: lowercase, no accents, single spaces.
 * "Press de Banca  con Barra" and "press de banca con barra" share the same key.
 * Used by the server (UNIQUE column + LIKE search) and the client (local filtering).
 */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Word-based match: every typed word must appear in the name, in any order
 * ("press banca" finds "Press de banca con barra"). Returns a rank (lower is
 * better: 0 = name starts with the query, 1 = a word starts with the first
 * typed word, 2 = other match) or null when it does not match.
 */
export function catalogMatchRank(name: string, query: string): number | null {
  const normalizedName = normalizeSearch(name);
  const normalizedQuery = normalizeSearch(query);
  if (normalizedQuery === '') return 2;

  const words = normalizedQuery.split(' ');
  if (!words.every((word) => normalizedName.includes(word))) return null;
  if (normalizedName.startsWith(normalizedQuery)) return 0;
  const first = words[0] ?? '';
  return normalizedName.split(' ').some((word) => word.startsWith(first)) ? 1 : 2;
}

/** Filters and orders items by catalogMatchRank, then alphabetically. Same on server and client. */
export function searchCatalog<T extends { name: string }>(items: readonly T[], query: string): T[] {
  return items
    .flatMap((item) => {
      const rank = catalogMatchRank(item.name, query);
      return rank === null ? [] : [{ item, rank, key: normalizeSearch(item.name) }];
    })
    .sort((a, b) => a.rank - b.rank || a.key.localeCompare(b.key))
    .map(({ item }) => item);
}
