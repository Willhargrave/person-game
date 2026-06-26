import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import type { HistoricalPerson } from '../types.js';
import { clearPlaceLabelCacheForTests, fetchLocalizedPlaceLabels } from './wikidataPlaces.js';

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

const entityBody = (birthPlaceId?: string, deathPlaceId?: string) => ({
  entities: {
    Q1: {
      claims: {
        ...(birthPlaceId
          ? {
              P19: [
                {
                  mainsnak: {
                    datavalue: {
                      value: {
                        id: birthPlaceId,
                      },
                    },
                  },
                },
              ],
            }
          : {}),
        ...(deathPlaceId
          ? {
              P20: [
                {
                  mainsnak: {
                    datavalue: {
                      value: {
                        id: deathPlaceId,
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    },
  },
});

const labelsBody = () => ({
  entities: {
    Q10: {
      labels: {
        ja: { value: '出生地' },
        en: { value: 'Birthplace' },
      },
    },
    Q20: {
      labels: {
        en: { value: 'Death place' },
      },
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

describe('wikidata place labels', () => {
  afterEach(() => {
    clearPlaceLabelCacheForTests();
  });

  it('loads Japanese birth and death place labels from Wikidata', async () => {
    const fetchMock = mockFetch((url) => {
      if (url.includes('Special:EntityData')) {
        return createResponse(true, entityBody('Q10', 'Q20'));
      }

      return createResponse(true, labelsBody());
    });

    try {
      assert.deepEqual(
        await fetchLocalizedPlaceLabels(person, 'ja', new AbortController().signal),
        {
          birthPlace: '出生地',
          deathPlace: 'Death place',
        },
      );
      assert.equal(fetchMock.calls.some((url) => url.includes('languages=ja%7Cen')), true);
    } finally {
      fetchMock.restore();
    }
  });

  it('does not fetch place labels for English mode', async () => {
    const fetchMock = mockFetch(() => createResponse(true, {}));

    try {
      assert.deepEqual(
        await fetchLocalizedPlaceLabels(person, 'en', new AbortController().signal),
        {},
      );
      assert.deepEqual(fetchMock.calls, []);
    } finally {
      fetchMock.restore();
    }
  });

  it('returns no overrides when place claims are missing', async () => {
    const fetchMock = mockFetch((url) => {
      assert.equal(url.includes('Special:EntityData'), true);
      return createResponse(true, entityBody());
    });

    try {
      assert.deepEqual(
        await fetchLocalizedPlaceLabels(person, 'ja', new AbortController().signal),
        {},
      );
    } finally {
      fetchMock.restore();
    }
  });
});
