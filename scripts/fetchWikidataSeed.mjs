/**
 * Example maintenance script for rebuilding src/data/historicalPeople.json later.
 *
 * This is intentionally not used by the game at runtime. Run it manually when
 * curating a new local seed dataset, then review the output before committing.
 */

const endpoint = 'https://query.wikidata.org/sparql';

const query = `
SELECT ?person ?personLabel ?birthDate ?deathDate ?birthPlaceLabel ?deathPlaceLabel
       ?birthCoord ?deathCoord ?sitelinks WHERE {
  ?person wdt:P31 wd:Q5;
          wdt:P569 ?birthDate;
          wdt:P570 ?deathDate;
          wdt:P19 ?birthPlace;
          wdt:P20 ?deathPlace;
          wikibase:sitelinks ?sitelinks.
  ?birthPlace wdt:P625 ?birthCoord.
  ?deathPlace wdt:P625 ?deathCoord.
  FILTER(?sitelinks > 80)
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 100
`;

const parsePoint = (point) => {
  const match = /^Point\(([-\d.]+) ([-\d.]+)\)$/.exec(point);
  if (!match) {
    return null;
  }

  return {
    lng: Number(match[1]),
    lat: Number(match[2]),
  };
};

const toDate = (value) => value.replace('T00:00:00Z', '');

const toId = (label) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const response = await fetch(`${endpoint}?query=${encodeURIComponent(query)}&format=json`, {
  headers: {
    Accept: 'application/sparql-results+json',
    'User-Agent': 'person-game-seed-builder/0.1 (local prototype)',
  },
});

if (!response.ok) {
  throw new Error(`Wikidata request failed: ${response.status} ${response.statusText}`);
}

const payload = await response.json();
const people = payload.results.bindings
  .map((row) => {
    const birthCoordinates = parsePoint(row.birthCoord.value);
    const deathCoordinates = parsePoint(row.deathCoord.value);

    if (!birthCoordinates || !deathCoordinates) {
      return null;
    }

    return {
      id: toId(row.personLabel.value),
      name: row.personLabel.value,
      birthDate: toDate(row.birthDate.value),
      deathDate: toDate(row.deathDate.value),
      birthPlace: row.birthPlaceLabel.value,
      deathPlace: row.deathPlaceLabel.value,
      birthCoordinates,
      deathCoordinates,
      fameScore: Number(row.sitelinks.value),
      wikidataId: row.person.value.split('/').pop(),
    };
  })
  .filter(Boolean);

console.log(JSON.stringify(people, null, 2));
