import type { HistoricalPerson } from '../types.js';
import type { Language } from '../i18n.js';
import { getLocalizedGuessNames } from '../i18n.js';
import { obscurePersonIds } from '../data/obscurePeople.js';

const hasCoordinates = (value: unknown): value is { lat: number; lng: number } => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const coordinates = value as { lat?: unknown; lng?: unknown };
  return (
    typeof coordinates.lat === 'number' &&
    Number.isFinite(coordinates.lat) &&
    coordinates.lat >= -90 &&
    coordinates.lat <= 90 &&
    typeof coordinates.lng === 'number' &&
    Number.isFinite(coordinates.lng) &&
    coordinates.lng >= -180 &&
    coordinates.lng <= 180
  );
};

export const isHistoricalPerson = (value: unknown): value is HistoricalPerson => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const person = value as Partial<HistoricalPerson>;
  return (
    typeof person.id === 'string' &&
    typeof person.name === 'string' &&
    typeof person.birthDate === 'string' &&
    typeof person.deathDate === 'string' &&
    typeof person.birthPlace === 'string' &&
    typeof person.deathPlace === 'string' &&
    hasCoordinates(person.birthCoordinates) &&
    hasCoordinates(person.deathCoordinates) &&
    (person.fameScore === undefined || typeof person.fameScore === 'number') &&
    (person.wikidataId === undefined || typeof person.wikidataId === 'string')
  );
};

export const getValidPeople = (data: unknown): HistoricalPerson[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isHistoricalPerson);
};

export const isObscurePerson = (person: HistoricalPerson): boolean =>
  obscurePersonIds.has(person.id);

export const orderPeopleWithObscurePeopleLast = (
  people: HistoricalPerson[],
): HistoricalPerson[] => {
  const visiblePeople: HistoricalPerson[] = [];
  const obscurePeople: HistoricalPerson[] = [];

  for (const person of people) {
    if (isObscurePerson(person)) {
      obscurePeople.push(person);
    } else {
      visiblePeople.push(person);
    }
  }

  return [...visiblePeople, ...obscurePeople];
};

export const normalizeGuess = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, ' ');

export const isCorrectGuess = (
  guess: string,
  person: HistoricalPerson,
  language: Language = 'en',
): boolean => {
  const normalizedGuess = normalizeGuess(guess);
  return getLocalizedGuessNames(person, language).some(
    (name) => normalizeGuess(name) === normalizedGuess,
  );
};

export const pickRandomPerson = (
  people: HistoricalPerson[],
  previousId?: string,
): HistoricalPerson | null => {
  if (people.length === 0) {
    return null;
  }

  if (people.length === 1) {
    return people[0];
  }

  const candidates = previousId ? people.filter((person) => person.id !== previousId) : people;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? people[0];
};

export const pickArcadePerson = (
  people: HistoricalPerson[],
  usedPersonIds: string[],
  openingCount = 5,
): HistoricalPerson | null => {
  const unseenPeople = people.filter((person) => !usedPersonIds.includes(person.id));

  if (unseenPeople.length === 0) {
    return null;
  }

  const openingRemaining = Math.max(openingCount - usedPersonIds.length, 0);
  const visibleOpeningPeople =
    openingRemaining > 0 ? unseenPeople.filter((person) => !isObscurePerson(person)) : unseenPeople;
  const candidates = visibleOpeningPeople.length > 0 ? visibleOpeningPeople : unseenPeople;

  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
};
