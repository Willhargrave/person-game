# Sketch Atlas Guess

A React + TypeScript browser game prototype where the player sees a sketch-style world map and two location clues: birthplace and death place. The dates and place names are shown, but the person's name is hidden until the player submits a guess.

## Run

```bash
npm install
npm run dev
npm run build
```

The dev server is powered by Vite. Open the local URL printed by `npm run dev`.

The game uses Leaflet with real world map tiles styled through CSS to fit the pencil-and-paper art direction. It does not use Google Maps.

## Game Idea

Each round chooses a random historical person from a local JSON seed dataset. The map shows:

- an orange birth marker
- a purple death marker
- a dashed line connecting the two
- birth and death dates and place names

The player enters a name, submits it, and the game compares the guess case-insensitively against the hidden `name`. After submission, the answer is revealed and the player can start the next round.

## Data Structure

Seed data is in `src/data/historicalPeople.json` and follows this TypeScript shape:

```ts
interface Coordinates {
  lat: number;
  lng: number;
}

interface HistoricalPerson {
  id: string;
  name: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  deathPlace: string;
  birthCoordinates: Coordinates;
  deathCoordinates: Coordinates;
  fameScore?: number;
  wikidataId?: string;
}
```

The app validates records before using them. Malformed records are skipped and a small warning is shown.

## Wikidata Strategy

Wikidata is a good source for building the seed dataset because it has structured properties for people, dates, places, coordinates, and Wikidata IDs. The game should not query Wikidata live every round because live queries add latency, can fail offline, may hit rate limits, and make gameplay dependent on an external service.

Instead, Wikidata should be used as a periodic data-build source. A maintainer can fetch candidates, clean names and coordinates, review quality, assign a game-friendly `fameScore`, then commit the resulting JSON. See `scripts/fetchWikidataSeed.mjs` for an example SPARQL fetch-and-clean script.

## Future Improvements

- Add alternate accepted names and aliases.
- Add difficulty tiers based on fame score, distance, era, or region.
- Add an offline map option using a curated Natural Earth GeoJSON file or packaged vector tiles.
- Add scoring, streaks, and guess history.
- Add accessibility improvements for keyboard-only map alternatives.
- Add tests for data validation and guess matching.
