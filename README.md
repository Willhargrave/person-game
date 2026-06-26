# Trace My Life

Trace My Life is a browser guessing game about famous people. Each round starts with a map animation showing where a person was born, then follows a dotted route to where they died. The player uses those clues, dates, and optional hints to work out the hidden name.

## How the Game Works

The player chooses one of three modes from the start screen:

- **Daily**: a daily challenge with cause of death, gender, and profession clues revealed from the start.
- **Daily Hard**: a daily challenge where those clues can each be revealed only once per game.
- **Arcade**: an unlimited mode with score-based extra chances.

Each round loads in stages:

1. The map zooms to the birth location and shows the birth date and place.
2. A dotted line is drawn toward the death location.
3. The map follows the line to the death location and shows the death date and place.
4. The person card loads, then the player enters a guess.

After a guess, the result card reveals the person's name, image, birth/death facts, and a Wikipedia summary. On mobile, the result card can be flipped to read the full summary.

## Daily Rules

Daily modes reset at midnight UTC and use a deterministic daily person order. Obscure people are filtered out of the daily challenge list.

In **Daily**:

- Cause of death, gender, and profession are visible from the start.
- The player starts with one skip/chance.
- A wrong answer or skip uses that chance.
- Once the chance has been used, the skip button changes to **Give up**.
- The final score is the number of correct answers.

In **Daily Hard**:

- The player starts with one skip/chance.
- Cause of death, gender, and profession can be revealed as helper actions.
- Each helper can only be used once per game.
- The score is the number of correct answers plus two bonus points for each unused helper action.

At the end of a daily run, the player can enter a username for the local daily leaderboard. If the name is left blank, the score is saved as `anonymous`. The share button copies a Wordle-style score summary to the clipboard.

## Arcade Rules

Arcade has no daily limit and uses the same reveal helpers as Daily Hard.

- The player starts with one extra chance.
- Correct guesses score more points when fewer helper clues are revealed.
- A correct guess scores 5 points with no reveals, 3 points with one reveal, 2 points with two reveals, and 1 point with three reveals.
- Every 15 points earns one extra chance.
- A wrong answer or skip uses an available chance; once no chances remain, the run ends.

## Language Support

The start screen has English and Japanese language buttons. The selected language changes UI copy, dates, localized person names where available, Wikipedia summary language, and accepted guess names.

## Data

The main person dataset is stored locally in `src/data/historicalPeople.json`. Per-person clues such as cause of death, gender, and profession are stored in `src/data/personHints.ts`.

The app uses:

- **Wikidata** as the source for structured person data.
- **Wikipedia** for result-card profile summaries and images.
- A local profession-category mapper so in-game profession clues can be broad, such as `Politician`, `Entertainer`, or `Scientist`, without exposing overly specific occupations.

The app validates seed records before use and skips malformed entries.

## Tech Stack

- **React 19** for the UI.
- **TypeScript** for app types, game state, and data validation helpers.
- **Vite** for local development and production builds.
- **Leaflet** and **React Leaflet** for the interactive map.
- **CSS** for the responsive layout, map styling, card animations, and mobile result-card flip behavior.
- **Node test runner** with TypeScript compilation for utility tests.
- **ESLint** for static linting.

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Useful commands:

```bash
npm test
npm run lint
npm run build
```
