import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { HistoricalPerson, PersonHints } from '../types.js';
import {
  formatHistoricalDate,
  getLocalizedGuessNames,
  getLocalizedHints,
  getLocalizedPerson,
  getUiCopy,
  isLanguage,
} from '../i18n.js';

const person: HistoricalPerson = {
  id: 'shinzo-abe',
  name: 'Shinzo Abe',
  birthDate: '1954-09-21',
  deathDate: '2022-07-08',
  birthPlace: 'Tokyo, Japan',
  deathPlace: 'Nara, Japan',
  birthCoordinates: { lat: 35.6762, lng: 139.6503 },
  deathCoordinates: { lat: 34.6851, lng: 135.8048 },
};

const hints: PersonHints = {
  methodOfDeath: 'Assassination',
  gender: 'Male',
  profession: 'Prime minister',
};

describe('i18n helpers', () => {
  it('recognizes supported languages', () => {
    assert.equal(isLanguage('en'), true);
    assert.equal(isLanguage('ja'), true);
    assert.equal(isLanguage('fr'), false);
  });

  it('returns UI copy for English and Japanese', () => {
    assert.equal(getUiCopy('en').daily, 'Daily');
    assert.equal(getUiCopy('en').viewSummary, 'View summary');
    assert.equal(getUiCopy('ja').daily, 'デイリー');
    assert.equal(getUiCopy('ja').backToCard, 'カードに戻る');
  });

  it('formats historical dates for Japanese display', () => {
    assert.equal(formatHistoricalDate('2022-07-08', 'ja'), '2022年7月8日');
    assert.equal(formatHistoricalDate('1945-02', 'ja'), '1945年2月');
    assert.equal(formatHistoricalDate('1227', 'ja'), '1227年');
    assert.equal(formatHistoricalDate('69 BCE', 'ja'), '69年 紀元前');
  });

  it('localizes people and keeps English fallback names', () => {
    const localizedPerson = getLocalizedPerson(person, 'ja');

    assert.equal(localizedPerson.name, '安倍晋三');
    assert.equal(localizedPerson.birthPlace, '東京、日本');
    assert.deepEqual(getLocalizedGuessNames(person, 'ja'), ['Shinzo Abe', '安倍晋三']);
  });

  it('localizes common hint values', () => {
    assert.deepEqual(getLocalizedHints(hints, 'ja'), {
      methodOfDeath: '暗殺',
      gender: '男性',
      profession: '首相',
    });
  });
});
