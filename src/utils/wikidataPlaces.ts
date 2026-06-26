import type { Language, LocalizedPerson } from '../i18n.js';
import type { HistoricalPerson } from '../types.js';

type PlaceKey = 'birthPlace' | 'deathPlace';
type WikidataPlaceClaim = 'P19' | 'P20';

interface WikidataEntityDataResponse {
  entities?: Record<
    string,
    {
      claims?: Partial<
        Record<
          WikidataPlaceClaim,
          Array<{
            mainsnak?: {
              datavalue?: {
                value?: {
                  id?: string;
                };
              };
            };
          }>
        >
      >;
    }
  >;
}

interface WikidataLabelsResponse {
  entities?: Record<
    string,
    {
      labels?: Partial<Record<Language, { value?: string }>>;
    }
  >;
}

export type LocalizedPlaceLabels = Partial<Pick<LocalizedPerson, PlaceKey>>;

const placeLabelCache = new Map<string, LocalizedPlaceLabels>();

const getWikidataEntityDataUrl = (wikidataId: string) =>
  `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikidataId)}.json`;

const getWikidataLabelsUrl = (entityIds: string[], language: Language) => {
  const languages = language === 'ja' ? 'ja|en' : 'en';
  const params = new URLSearchParams({
    action: 'wbgetentities',
    ids: entityIds.join('|'),
    props: 'labels',
    languages,
    format: 'json',
    origin: '*',
  });

  return `https://www.wikidata.org/w/api.php?${params.toString()}`;
};

const getPlaceEntityId = (
  entity: NonNullable<WikidataEntityDataResponse['entities']>[string] | undefined,
  claim: WikidataPlaceClaim,
): string | undefined => entity?.claims?.[claim]?.[0]?.mainsnak?.datavalue?.value?.id;

const getBestLabel = (
  labels: NonNullable<WikidataLabelsResponse['entities']>[string]['labels'] | undefined,
  language: Language,
): string | undefined => labels?.[language]?.value ?? labels?.en?.value;

export const fetchLocalizedPlaceLabels = async (
  person: HistoricalPerson,
  language: Language,
  signal: AbortSignal,
): Promise<LocalizedPlaceLabels> => {
  if (!person.wikidataId || language === 'en') {
    return {};
  }

  const cacheKey = `${person.wikidataId}:${language}`;
  const cachedLabels = placeLabelCache.get(cacheKey);

  if (cachedLabels) {
    return cachedLabels;
  }

  const entityResponse = await fetch(getWikidataEntityDataUrl(person.wikidataId), {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!entityResponse.ok) {
    throw new Error('Wikidata place claims unavailable');
  }

  const entityData = (await entityResponse.json()) as WikidataEntityDataResponse;
  const personEntity = entityData.entities?.[person.wikidataId];
  const placeEntityIds = {
    birthPlace: getPlaceEntityId(personEntity, 'P19'),
    deathPlace: getPlaceEntityId(personEntity, 'P20'),
  } satisfies Partial<Record<PlaceKey, string | undefined>>;
  const uniquePlaceIds = Array.from(
    new Set(Object.values(placeEntityIds).filter((id): id is string => Boolean(id))),
  );

  if (uniquePlaceIds.length === 0) {
    placeLabelCache.set(cacheKey, {});
    return {};
  }

  const labelsResponse = await fetch(getWikidataLabelsUrl(uniquePlaceIds, language), {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!labelsResponse.ok) {
    throw new Error('Wikidata place labels unavailable');
  }

  const labelsData = (await labelsResponse.json()) as WikidataLabelsResponse;
  const localizedLabels: LocalizedPlaceLabels = {};

  for (const [placeKey, entityId] of Object.entries(placeEntityIds) as Array<
    [PlaceKey, string | undefined]
  >) {
    if (!entityId) {
      continue;
    }

    const label = getBestLabel(labelsData.entities?.[entityId]?.labels, language);

    if (label) {
      localizedLabels[placeKey] = label;
    }
  }

  placeLabelCache.set(cacheKey, localizedLabels);
  return localizedLabels;
};

export const clearPlaceLabelCacheForTests = () => {
  placeLabelCache.clear();
};
