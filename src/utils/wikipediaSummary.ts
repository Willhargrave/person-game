import type { Language } from '../i18n.js';
import type { HistoricalPerson } from '../types.js';

interface WikipediaSummaryResponse {
  extract?: string;
  thumbnail?: {
    source: string;
  };
  content_urls?: {
    desktop?: {
      page?: string;
    };
  };
}

interface WikidataEntityResponse {
  entities?: Record<
    string,
    {
      claims?: {
        P18?: Array<{
          mainsnak?: {
            datavalue?: {
              value?: string;
            };
          };
        }>;
      };
      sitelinks?: Partial<Record<'enwiki' | 'jawiki', { title?: string }>>;
    }
  >;
}

interface WikidataProfile {
  imageUrl?: string;
  sitelinks: Partial<Record<'enwiki' | 'jawiki', string>>;
}

interface SummaryCandidate {
  language: Language;
  title: string;
}

export interface PersonSummary {
  extract: string;
  imageUrl?: string;
  pageUrl?: string;
}

const wikidataProfileCache = new Map<string, WikidataProfile>();

const getSummaryUrl = (title: string, language: Language) =>
  `https://${language === 'ja' ? 'ja' : 'en'}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

const getWikidataEntityUrl = (wikidataId: string) =>
  `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikidataId)}.json`;

const getCommonsImageUrl = (filename: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=640`;

const fetchWikidataProfile = async (
  wikidataId: string,
  signal: AbortSignal,
): Promise<WikidataProfile> => {
  const cachedProfile = wikidataProfileCache.get(wikidataId);

  if (cachedProfile) {
    return cachedProfile;
  }

  const response = await fetch(getWikidataEntityUrl(wikidataId), {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Wikidata sitelinks unavailable');
  }

  const data = (await response.json()) as WikidataEntityResponse;
  const entity = data.entities?.[wikidataId];
  const imageFilename = entity?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
  const sitelinks = {
    enwiki: entity?.sitelinks?.enwiki?.title,
    jawiki: entity?.sitelinks?.jawiki?.title,
  };
  const profile = {
    imageUrl: imageFilename ? getCommonsImageUrl(imageFilename) : undefined,
    sitelinks,
  };

  wikidataProfileCache.set(wikidataId, profile);
  return profile;
};

const fetchWikipediaSummary = async (
  candidate: SummaryCandidate,
  signal: AbortSignal,
): Promise<PersonSummary> => {
  const response = await fetch(getSummaryUrl(candidate.title, candidate.language), {
    signal,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Summary unavailable');
  }

  const data = (await response.json()) as WikipediaSummaryResponse;

  if (!data.extract) {
    throw new Error('Summary unavailable');
  }

  const summary: PersonSummary = {
    extract: data.extract,
  };

  if (data.thumbnail?.source) {
    summary.imageUrl = data.thumbnail.source;
  }

  if (data.content_urls?.desktop?.page) {
    summary.pageUrl = data.content_urls.desktop.page;
  }

  return summary;
};

const getFallbackCandidates = (
  fallbackTitle: string,
  language: Language,
): SummaryCandidate[] => {
  const candidates: SummaryCandidate[] = [{ language, title: fallbackTitle }];

  if (language !== 'en') {
    candidates.push({ language: 'en', title: fallbackTitle });
  }

  return candidates;
};

export const fetchPersonSummary = async (
  person: HistoricalPerson,
  fallbackTitle: string,
  language: Language,
  signal: AbortSignal,
): Promise<PersonSummary> => {
  const candidates: SummaryCandidate[] = [];
  let wikidataImageUrl: string | undefined;

  if (person.wikidataId) {
    try {
      const wikidataProfile = await fetchWikidataProfile(person.wikidataId, signal);
      const { sitelinks } = wikidataProfile;

      wikidataImageUrl = wikidataProfile.imageUrl;

      if (language === 'ja') {
        if (sitelinks.jawiki) {
          candidates.push({ language: 'ja', title: sitelinks.jawiki });
        }

        if (sitelinks.enwiki) {
          candidates.push({ language: 'en', title: sitelinks.enwiki });
        }
      } else if (sitelinks.enwiki) {
        candidates.push({ language: 'en', title: sitelinks.enwiki });
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
    }
  }

  candidates.push(...getFallbackCandidates(fallbackTitle, language));

  const uniqueCandidates = candidates.filter(
    (candidate, index, allCandidates) =>
      allCandidates.findIndex(
        (otherCandidate) =>
          otherCandidate.language === candidate.language && otherCandidate.title === candidate.title,
      ) === index,
  );

  for (const candidate of uniqueCandidates) {
    try {
      const summary = await fetchWikipediaSummary(candidate, signal);

      if (wikidataImageUrl) {
        return {
          ...summary,
          imageUrl: wikidataImageUrl,
        };
      }

      return summary;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
    }
  }

  throw new Error('Summary unavailable');
};

export const clearSitelinkCacheForTests = () => {
  wikidataProfileCache.clear();
};
