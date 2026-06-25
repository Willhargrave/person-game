import type { HistoricalPerson, HintKey, PersonHints } from './types.js';

export type Language = 'en' | 'ja';

export interface LocalizedPerson {
  name: string;
  birthDate: string;
  deathDate: string;
  birthPlace: string;
  deathPlace: string;
  wikipediaTitle: string;
}

export interface UiCopy {
  appTitle: string;
  tagline: string;
  daily: string;
  easyDaily: string;
  practice: string;
  chooseGameMode: string;
  sourcePrefix: string;
  wikidata: string;
  sourceMiddle: string;
  wikipedia: string;
  noPlayableTitle: string;
  noPlayableBody: string;
  malformedSeed: (count: number) => string;
  rulesTitle: string;
  startDaily: string;
  startEasyDaily: string;
  whoAmI: string;
  guessPlaceholder: string;
  submit: string;
  skip: string;
  nextRound: string;
  viewLeaderboard: string;
  score: string;
  chanceAvailable: string;
  chanceUsed: string;
  chanceRemaining: string;
  chanceLabel: string;
  helperLabels: Record<HintKey, string>;
  helperAvailable: string;
  helperUsed: string;
  helperRevealed: string;
  knownClues: string;
  minimizePanel: string;
  restorePanel: string;
  bornPrompt: string;
  diedPrompt: string;
  hintsLabel: string;
  revealedDetails: string;
  birthplace: string;
  deathPlace: string;
  bornIn: (place: string, date: string) => string;
  diedIn: (place: string, date: string, cause?: string) => string;
  correct: string;
  skipped: string;
  incorrectGuess: (guess: string) => string;
  nothing: string;
  born: string;
  died: string;
  loadingSummary: string;
  summaryUnavailable: string;
  fullProfile: string;
  viewSummary: string;
  backToCard: string;
  loadingResult: string;
  revealing: string;
  sessionCompleteTitle: string;
  sessionCompleteBody: string;
  changeMode: string;
  dailyChallenge: (mode: string, date: string) => string;
  points: (score: number) => string;
  correctPeople: string;
  helperBonus: string;
  total: string;
  username: string;
  anonymousPlaceholder: string;
  addScore: string;
  shareScore: string;
  copiedShareText: string;
  shareUnavailable: string;
  playAgain: (mode: string) => string;
  leaderboard: string;
  noScores: string;
  dailyMode: string;
  easyDailyMode: string;
  ranOutOfChances: string;
  completedDaily: string;
}

const uiCopy: Record<Language, UiCopy> = {
  en: {
    appTitle: 'Trace My Life',
    tagline: 'Uncover famous people based on their birth and death',
    daily: 'Daily (hard mode)',
    easyDaily: 'Daily',
    practice: 'Practice',
    chooseGameMode: 'Choose game mode',
    sourcePrefix: 'All data sourced from',
    wikidata: 'Wikidata',
    sourceMiddle: 'and',
    wikipedia: 'Wikipedia',
    noPlayableTitle: 'No playable data found',
    noPlayableBody:
      'Check src/data/historicalPeople.json for missing names, dates, places, or coordinates.',
    malformedSeed: (count) =>
      `${count} malformed seed ${count === 1 ? 'record was' : 'records were'} skipped.`,
    rulesTitle: 'Rules',
    startDaily: 'Start Daily',
    startEasyDaily: 'Start Easy Daily',
    whoAmI: 'Who Am I?',
    guessPlaceholder: 'Enter a full name',
    submit: 'Submit',
    skip: 'Skip',
    nextRound: 'Next round',
    viewLeaderboard: 'View leaderboard',
    score: 'Score',
    chanceAvailable: 'Chance available',
    chanceUsed: 'Chance used',
    chanceRemaining: '1 chance remaining',
    chanceLabel: 'Chance',
    helperLabels: {
      methodOfDeath: 'Cause of Death',
      gender: 'Gender',
      profession: 'Profession',
    },
    helperAvailable: 'available',
    helperUsed: 'used',
    helperRevealed: 'revealed',
    knownClues: 'Known clues',
    minimizePanel: 'Minimize panel',
    restorePanel: 'Restore panel',
    bornPrompt: 'I was born in...',
    diedPrompt: 'I died in...',
    hintsLabel: 'Hints',
    revealedDetails: 'Revealed details',
    birthplace: 'Birthplace',
    deathPlace: 'Death place',
    bornIn: (place, date) => [`Born in ${place}`, `on ${date}`].join('\n'),
    diedIn: (place, date, cause) =>
      [`Died in ${place}`, `on ${date}`, ...(cause ? [`of ${cause}`] : [])].join('\n'),
    correct: 'Correct',
    skipped: 'Skipped!',
    incorrectGuess: (guess) => `Incorrect: you guessed "${guess}"`,
    nothing: 'nothing',
    born: 'Born',
    died: 'Died',
    loadingSummary: 'Loading Wikipedia summary...',
    summaryUnavailable: 'Wikipedia summary unavailable.',
    fullProfile: 'Full Profile',
    viewSummary: 'View summary',
    backToCard: 'Back to card',
    loadingResult: 'Loading result',
    revealing: 'Revealing...',
    sessionCompleteTitle: 'Session complete',
    sessionCompleteBody:
      'You have seen every person in this seed set. Refresh the page to start a new session.',
    changeMode: 'Change mode',
    dailyChallenge: (mode, date) => `${mode} Challenge ${date}`,
    points: (score) => `${score} points`,
    correctPeople: 'Correct',
    helperBonus: 'Helper bonus',
    total: 'Total',
    username: 'Username',
    anonymousPlaceholder: 'Leave blank for anonymous',
    addScore: 'Add score',
    shareScore: 'Share score',
    copiedShareText: 'Copied share text.',
    shareUnavailable: 'Share unavailable.',
    playAgain: (mode) => `Play ${mode} again`,
    leaderboard: 'Daily Leaderboard',
    noScores: 'No scores yet.',
    dailyMode: 'Daily',
    easyDailyMode: 'Easy Daily',
    ranOutOfChances: 'You ran out of chances.',
    completedDaily: 'You completed every person in today\'s challenge.',
  },
  ja: {
    appTitle: 'Trace My Life',
    tagline: '生没地を手がかりに有名人を見つけよう',
    daily: 'デイリー（ハード）',
    easyDaily: 'デイリー',
    practice: '練習',
    chooseGameMode: 'ゲームモードを選択',
    sourcePrefix: 'データ出典:',
    wikidata: 'Wikidata',
    sourceMiddle: 'および',
    wikipedia: 'Wikipedia',
    noPlayableTitle: 'プレイ可能なデータがありません',
    noPlayableBody:
      'src/data/historicalPeople.json の名前、日付、場所、座標を確認してください。',
    malformedSeed: (count) => `不完全なシードデータ ${count} 件をスキップしました。`,
    rulesTitle: 'ルール',
    startDaily: 'デイリーを開始',
    startEasyDaily: 'かんたんデイリーを開始',
    whoAmI: '私は誰？',
    guessPlaceholder: 'フルネームを入力',
    submit: '回答',
    skip: 'スキップ',
    nextRound: '次の問題',
    viewLeaderboard: 'ランキングを見る',
    score: 'スコア',
    chanceAvailable: 'チャンスあり',
    chanceUsed: 'チャンス使用済み',
    chanceRemaining: '残り1チャンス',
    chanceLabel: 'チャンス',
    helperLabels: {
      methodOfDeath: '死因',
      gender: '性別',
      profession: '職業',
    },
    helperAvailable: '使用可能',
    helperUsed: '使用済み',
    helperRevealed: '表示済み',
    knownClues: '手がかり',
    minimizePanel: 'パネルを最小化',
    restorePanel: 'パネルを戻す',
    bornPrompt: '生まれた場所',
    diedPrompt: '亡くなった場所',
    hintsLabel: 'ヒント',
    revealedDetails: '表示された情報',
    birthplace: '出生地',
    deathPlace: '死没地',
    bornIn: (place, date) => [`${date}`, `${place}で誕生`].join('\n'),
    diedIn: (place, date, cause) =>
      [`${date}`, `${place}で死去`, ...(cause ? [`死因: ${cause}`] : [])].join('\n'),
    correct: '正解',
    skipped: 'スキップ',
    incorrectGuess: (guess) => `不正解: 「${guess}」と回答しました`,
    nothing: '未入力',
    born: '誕生',
    died: '死去',
    loadingSummary: 'Wikipediaの概要を読み込み中...',
    summaryUnavailable: 'Wikipediaの概要を取得できませんでした。',
    fullProfile: '詳しいプロフィール',
    viewSummary: '概要を見る',
    backToCard: 'カードに戻る',
    loadingResult: '結果を読み込み中',
    revealing: '表示中...',
    sessionCompleteTitle: 'セッション完了',
    sessionCompleteBody:
      'このデータセットの人物をすべて見ました。ページを再読み込みすると新しいセッションを開始できます。',
    changeMode: 'モード変更',
    dailyChallenge: (mode, date) => `${mode}チャレンジ ${date}`,
    points: (score) => `${score} 点`,
    correctPeople: '正解数',
    helperBonus: 'ヒントボーナス',
    total: '合計',
    username: 'ユーザー名',
    anonymousPlaceholder: '空欄の場合は anonymous',
    addScore: 'スコアを追加',
    shareScore: 'スコアを共有',
    copiedShareText: '共有テキストをコピーしました。',
    shareUnavailable: '共有できませんでした。',
    playAgain: (mode) => `${mode}をもう一度`,
    leaderboard: 'デイリーランキング',
    noScores: 'まだスコアがありません。',
    dailyMode: 'デイリー',
    easyDailyMode: 'かんたんデイリー',
    ranOutOfChances: 'チャンスがなくなりました。',
    completedDaily: '今日のチャレンジをすべて完了しました。',
  },
};

const localizedPeople: Record<string, Partial<Record<Language, Partial<LocalizedPerson>>>> = {
  'emperor-meiji': {
    ja: {
      name: '明治天皇',
      birthPlace: '京都、日本',
      deathPlace: '東京、日本',
      wikipediaTitle: '明治天皇',
    },
  },
  'oda-nobunaga': {
    ja: {
      name: '織田信長',
      birthPlace: '尾張国、日本',
      deathPlace: '京都、日本',
      wikipediaTitle: '織田信長',
    },
  },
  'shinzo-abe': {
    ja: {
      name: '安倍晋三',
      birthPlace: '東京、日本',
      deathPlace: '奈良、日本',
      wikipediaTitle: '安倍晋三',
    },
  },
  'ryuichi-sakamoto': {
    ja: {
      name: '坂本龍一',
      birthPlace: '東京、日本',
      deathPlace: '東京、日本',
      wikipediaTitle: '坂本龍一',
    },
  },
};

const hintValueTranslations: Record<string, string> = {
  Suicide: '自殺',
  Assassination: '暗殺',
  Illness: '病気',
  'Illness in exile': '流刑中の病気',
  Uncertain: '不明',
  Unknown: '不明',
  Execution: '処刑',
  Stroke: '脳卒中',
  Cancer: 'がん',
  'Heart attack': '心臓発作',
  'Heart failure': '心不全',
  'Natural causes': '自然死',
  'Plane crash': '飛行機事故',
  'Car crash': '自動車事故',
  Murder: '殺害',
  'Gunshot wound': '銃創',
  Male: '男性',
  Female: '女性',
  Queen: '女王',
  King: '王',
  President: '大統領',
  'Prime minister': '首相',
  Politician: '政治家',
  'Political leader': '政治指導者',
  Activist: '活動家',
  Scientist: '科学者',
  Physicist: '物理学者',
  Artist: '芸術家',
  Painter: '画家',
  Playwright: '劇作家',
  Writer: '作家',
  Musician: '音楽家',
  Singer: '歌手',
  Composer: '作曲家',
  Actor: '俳優',
  Philosopher: '哲学者',
  Explorer: '探検家',
  Emperor: '皇帝',
  Daimyo: '大名',
  Dictator: '独裁者',
  'Military leader': '軍事指導者',
  Mathematician: '数学者',
  Inventor: '発明家',
  'Opposition leader': '野党指導者',
  Wrestler: 'レスラー',
  Cricketer: 'クリケット選手',
  Footballer: 'サッカー選手',
};

const dateFormat = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export const getUiCopy = (language: Language): UiCopy => uiCopy[language];

export const isLanguage = (value: string | null): value is Language =>
  value === 'en' || value === 'ja';

export const formatHistoricalDate = (date: string, language: Language): string => {
  if (language === 'en') {
    return date;
  }

  if (date.includes('BCE')) {
    return date.replace('c. ', '約').replace(' BCE', '年 紀元前');
  }

  if (date.startsWith('c. ')) {
    return `約${date.slice(3)}年`;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return dateFormat.format(new Date(`${date}T00:00:00Z`));
  }

  if (/^\d{4}-\d{2}$/.test(date)) {
    const [year, month] = date.split('-');
    return `${year}年${Number(month)}月`;
  }

  if (/^\d{4}$/.test(date)) {
    return `${date}年`;
  }

  return date;
};

export const getLocalizedPerson = (
  person: HistoricalPerson,
  language: Language,
): LocalizedPerson => {
  const localized = localizedPeople[person.id]?.[language];

  return {
    name: localized?.name ?? person.name,
    birthDate: formatHistoricalDate(person.birthDate, language),
    deathDate: formatHistoricalDate(person.deathDate, language),
    birthPlace: localized?.birthPlace ?? person.birthPlace,
    deathPlace: localized?.deathPlace ?? person.deathPlace,
    wikipediaTitle: localized?.wikipediaTitle ?? localized?.name ?? person.name,
  };
};

export const getLocalizedHints = (hints: PersonHints, language: Language): PersonHints => {
  if (language === 'en') {
    return hints;
  }

  return {
    methodOfDeath: hintValueTranslations[hints.methodOfDeath] ?? hints.methodOfDeath,
    gender: hintValueTranslations[hints.gender] ?? hints.gender,
    profession: hintValueTranslations[hints.profession] ?? hints.profession,
  };
};

export const getLocalizedGuessNames = (
  person: HistoricalPerson,
  language: Language,
): string[] => {
  const localized = getLocalizedPerson(person, language);
  return Array.from(new Set([person.name, localized.name]));
};
