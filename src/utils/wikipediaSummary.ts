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
      sitelinks?: Partial<Record<'enwiki' | 'jawiki', { title?: string }>>;
    }
  >;
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

const sitelinkCache = new Map<string, Partial<Record<'enwiki' | 'jawiki', string>>>();

const getSummaryUrl = (title: string, language: Language) =>
  `https://${language === 'ja' ? 'ja' : 'en'}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

const getWikidataEntityUrl = (wikidataId: string) =>
  `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikidataId)}.json`;

const fetchWikidataSitelinks = async (
  wikidataId: string,
  signal: AbortSignal,
): Promise<Partial<Record<'enwiki' | 'jawiki', string>>> => {
  const cachedSitelinks = sitelinkCache.get(wikidataId);

  if (cachedSitelinks) {
    return cachedSitelinks;
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
  const sitelinks = {
    enwiki: entity?.sitelinks?.enwiki?.title,
    jawiki: entity?.sitelinks?.jawiki?.title,
  };

  sitelinkCache.set(wikidataId, sitelinks);
  return sitelinks;
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

  if (person.wikidataId) {
    try {
      const sitelinks = await fetchWikidataSitelinks(person.wikidataId, signal);

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
      return await fetchWikipediaSummary(candidate, signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error;
      }
    }
  }

  throw new Error('Summary unavailable');
};

export const clearSitelinkCacheForTests = () => {
  sitelinkCache.clear();
};
