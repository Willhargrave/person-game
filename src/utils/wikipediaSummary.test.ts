import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import type { HistoricalPerson } from '../types.js';
import { clearSitelinkCacheForTests, fetchPersonSummary } from './wikipediaSummary.js';

const person: HistoricalPerson = {
  id: 'test-person',
  name: 'Test Person',
  birthDate: '1900',
  deathDate: '1980',
  birthPlace: 'Birth Place',
  deathPlace: 'Death Place',
  birthCoordinates: { lat: 0, lng: 0 },
  deathCoordinates: { lat: 1, lng: 1 },
  wikidataId: 'Q1',
};

const createResponse = (ok: boolean, body: unknown): Response =>
  ({
    ok,
    json: async () => body,
  }) as Response;

const wikidataBody = (sitelinks: Record<string, { title: string }>) => ({
  entities: {
    Q1: {
      sitelinks,
    },
  },
});

const summaryBody = (extract: string, imageUrl?: string) => ({
  extract,
  thumbnail: imageUrl ? { source: imageUrl } : undefined,
  content_urls: {
    desktop: {
      page: `https://example.test/${encodeURIComponent(extract)}`,
    },
  },
});

const mockFetch = (handler: (url: string) => Response) => {
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = String(input);
    calls.push(url);
    return handler(url);
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = originalFetch;
    },
  };
};

describe('wikipedia summary lookup', () => {
  afterEach(() => {
    clearSitelinkCacheForTests();
  });

  it('loads Japanese summary from a Wikidata jawiki sitelink', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('wikidata.org')) {
        return createResponse(true, wikidataBody({ jawiki: { title: '日本語記事' } }));
      }

      assert.equal(url.includes('ja.wikipedia.org'), true);
      return createResponse(true, summaryBody('日本語の概要', 'https://image.test/ja.jpg'));
    });

    try {
      assert.deepEqual(
        await fetchPersonSummary(person, 'Fallback Title', 'ja', new AbortController().signal),
        {
          extract: '日本語の概要',
          imageUrl: 'https://image.test/ja.jpg',
          pageUrl: 'https://example.test/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E6%A6%82%E8%A6%81',
        },
      );
    } finally {
      fetchMock.restore();
    }
  });

  it('falls back to English when Japanese sitelink is missing', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('wikidata.org')) {
        return createResponse(true, wikidataBody({ enwiki: { title: 'English Article' } }));
      }

      assert.equal(url.includes('en.wikipedia.org'), true);
      return createResponse(true, summaryBody('English summary'));
    });

    try {
      const summary = await fetchPersonSummary(
        person,
        'Fallback Title',
        'ja',
        new AbortController().signal,
      );

      assert.equal(summary.extract, 'English summary');
      assert.equal(fetchMock.calls.some((url) => url.includes('ja.wikipedia.org')), false);
    } finally {
      fetchMock.restore();
    }
  });

  it('falls back to English when Japanese summary request fails', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('wikidata.org')) {
        return createResponse(
          true,
          wikidataBody({
            jawiki: { title: '日本語記事' },
            enwiki: { title: 'English Article' },
          }),
        );
      }

      if (url.includes('ja.wikipedia.org')) {
        return createResponse(false, {});
      }

      return createResponse(true, summaryBody('English fallback'));
    });

    try {
      const summary = await fetchPersonSummary(
        person,
        'Fallback Title',
        'ja',
        new AbortController().signal,
      );

      assert.equal(summary.extract, 'English fallback');
      assert.equal(fetchMock.calls.some((url) => url.includes('ja.wikipedia.org')), true);
      assert.equal(fetchMock.calls.some((url) => url.includes('en.wikipedia.org')), true);
    } finally {
      fetchMock.restore();
    }
  });

  it('falls back to the current title when Wikidata lookup fails', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('wikidata.org')) {
        return createResponse(false, {});
      }

      assert.equal(url.includes('Fallback%20Title'), true);
      return createResponse(true, summaryBody('Fallback summary'));
    });

    try {
      const summary = await fetchPersonSummary(
        person,
        'Fallback Title',
        'en',
        new AbortController().signal,
      );

      assert.equal(summary.extract, 'Fallback summary');
    } finally {
      fetchMock.restore();
    }
  });

  it('keeps Japanese summary when it has no thumbnail', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('wikidata.org')) {
        return createResponse(
          true,
          wikidataBody({
            jawiki: { title: '日本語記事' },
            enwiki: { title: 'English Article' },
          }),
        );
      }

      assert.equal(url.includes('ja.wikipedia.org'), true);
      return createResponse(true, summaryBody('日本語の概要'));
    });

    try {
      assert.deepEqual(
        await fetchPersonSummary(person, 'Fallback Title', 'ja', new AbortController().signal),
        {
          extract: '日本語の概要',
          pageUrl: 'https://example.test/%E6%97%A5%E6%9C%AC%E8%AA%9E%E3%81%AE%E6%A6%82%E8%A6%81',
        },
      );
      assert.equal(fetchMock.calls.some((url) => url.includes('en.wikipedia.org')), false);
    } finally {
      fetchMock.restore();
    }
  });
});
