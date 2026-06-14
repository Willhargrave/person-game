export interface PlaceFlag {
  symbol: string;
  label: string;
}

const historicalPlaceFlags: Array<[string, PlaceFlag]> = [
  ['Normandy', { symbol: '🏴', label: 'Normandy' }],
  ['Ptolemaic Kingdom', { symbol: '☀️', label: 'Ptolemaic Kingdom' }],
  ['Roman Republic', { symbol: 'SPQR', label: 'Roman Republic' }],
  ['Roman Empire', { symbol: 'SPQR', label: 'Roman Empire' }],
  ['Classical Greece', { symbol: '🏛️', label: 'Classical Greece' }],
  ['Macedon', { symbol: '☀️', label: 'Macedon' }],
  ['Republic of Florence', { symbol: '⚜️', label: 'Republic of Florence' }],
  ['Republic of Genoa', { symbol: '✚', label: 'Republic of Genoa' }],
  ['Duchy of Florence', { symbol: '⚜️', label: 'Duchy of Florence' }],
  ['Grand Duchy of Tuscany', { symbol: '⚜️', label: 'Grand Duchy of Tuscany' }],
  ['Austrian Empire', { symbol: '🇦🇹', label: 'Austrian Empire' }],
  ['Austria-Hungary', { symbol: '🇦🇹', label: 'Austria-Hungary' }],
  ['Russian Empire', { symbol: '🇷🇺', label: 'Russian Empire' }],
  ['Soviet Union', { symbol: '☭', label: 'Soviet Union' }],
  ['British America', { symbol: '🇬🇧', label: 'British America' }],
  ['Congress Poland', { symbol: '🇵🇱', label: 'Congress Poland' }],
  ['Kingdom of Prussia', { symbol: '🇩🇪', label: 'Kingdom of Prussia' }],
  ['Kingdom of Wurttemberg', { symbol: '🇩🇪', label: 'Kingdom of Wurttemberg' }],
  ['Duchy of Warsaw', { symbol: '🇵🇱', label: 'Duchy of Warsaw' }],
  ['Captaincy General of Venezuela', { symbol: '🇻🇪', label: 'Captaincy General of Venezuela' }],
  ['Gran Colombia', { symbol: '🇨🇴', label: 'Gran Colombia' }],
  ['Viceroyalty of the Rio de la Plata', { symbol: '🇦🇷', label: 'Viceroyalty of the Rio de la Plata' }],
  ['Gold Coast', { symbol: '🇬🇭', label: 'Gold Coast' }],
  ['Crown of Castile', { symbol: '🇪🇸', label: 'Crown of Castile' }],
  ['Western Xia', { symbol: '🏳️', label: 'Western Xia' }],
  ['North Atlantic Ocean', { symbol: '🌊', label: 'North Atlantic Ocean' }],
  ['Barents Sea', { symbol: '🌊', label: 'Barents Sea' }],
];

const modernPlaceFlags: Array<[string, PlaceFlag]> = [
  ['United States', { symbol: '🇺🇸', label: 'United States' }],
  ['Washington, D.C.', { symbol: '🇺🇸', label: 'United States' }],
  ['New York City', { symbol: '🇺🇸', label: 'United States' }],
  ['England', { symbol: '🏴', label: 'England' }],
  ['Ireland', { symbol: '🇮🇪', label: 'Ireland' }],
  ['Scotland', { symbol: '🏴', label: 'Scotland' }],
  ['France', { symbol: '🇫🇷', label: 'France' }],
  ['Germany', { symbol: '🇩🇪', label: 'Germany' }],
  ['Italy', { symbol: '🇮🇹', label: 'Italy' }],
  ['Spain', { symbol: '🇪🇸', label: 'Spain' }],
  ['Portugal', { symbol: '🇵🇹', label: 'Portugal' }],
  ['Netherlands', { symbol: '🇳🇱', label: 'Netherlands' }],
  ['Austria', { symbol: '🇦🇹', label: 'Austria' }],
  ['Poland', { symbol: '🇵🇱', label: 'Poland' }],
  ['Romania', { symbol: '🇷🇴', label: 'Romania' }],
  ['Norway', { symbol: '🇳🇴', label: 'Norway' }],
  ['Russia', { symbol: '🇷🇺', label: 'Russia' }],
  ['Ukraine', { symbol: '🇺🇦', label: 'Ukraine' }],
  ['Greece', { symbol: '🇬🇷', label: 'Greece' }],
  ['Egypt', { symbol: '🇪🇬', label: 'Egypt' }],
  ['South Africa', { symbol: '🇿🇦', label: 'South Africa' }],
  ['Saint Helena', { symbol: '🇸🇭', label: 'Saint Helena' }],
  ['India', { symbol: '🇮🇳', label: 'India' }],
  ['Pakistan', { symbol: '🇵🇰', label: 'Pakistan' }],
  ['China', { symbol: '🇨🇳', label: 'China' }],
  ['Japan', { symbol: '🇯🇵', label: 'Japan' }],
  ['Philippines', { symbol: '🇵🇭', label: 'Philippines' }],
  ['Hong Kong', { symbol: '🇭🇰', label: 'Hong Kong' }],
  ['Australia', { symbol: '🇦🇺', label: 'Australia' }],
  ['Jamaica', { symbol: '🇯🇲', label: 'Jamaica' }],
  ['Mexico', { symbol: '🇲🇽', label: 'Mexico' }],
  ['Argentina', { symbol: '🇦🇷', label: 'Argentina' }],
  ['Bolivia', { symbol: '🇧🇴', label: 'Bolivia' }],
  ['Brazil', { symbol: '🇧🇷', label: 'Brazil' }],
  ['Colombia', { symbol: '🇨🇴', label: 'Colombia' }],
  ['Venezuela', { symbol: '🇻🇪', label: 'Venezuela' }],
  ['Cuba', { symbol: '🇨🇺', label: 'Cuba' }],
  ['Ghana', { symbol: '🇬🇭', label: 'Ghana' }],
  ['Vatican City', { symbol: '🇻🇦', label: 'Vatican City' }],
  ['Bosnia and Herzegovina', { symbol: '🇧🇦', label: 'Bosnia and Herzegovina' }],
  ['Hawaii', { symbol: '🇺🇸', label: 'United States' }],
  ['South Georgia', { symbol: '🇬🇸', label: 'South Georgia' }],
  ['Zanzibar', { symbol: '🇹🇿', label: 'Tanzania' }],
  ['Mesopotamia', { symbol: '🇮🇶', label: 'Iraq' }],
];

export const getPlaceFlag = (place: string): PlaceFlag => {
  const historicalMatch = historicalPlaceFlags.find(([name]) => place.includes(name));

  if (historicalMatch) {
    return historicalMatch[1];
  }

  const modernMatch = modernPlaceFlags.find(([name]) => place.includes(name));

  return modernMatch?.[1] ?? { symbol: '🏳️', label: 'Unknown flag' };
};
