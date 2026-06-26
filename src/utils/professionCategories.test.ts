import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { personHints } from '../data/personHints.js';
import { getProfessionCategory, professionCategoryByProfession } from './professionCategories.js';

describe('profession categories', () => {
  it('maps every configured profession to a broad category', () => {
    const professions = new Set(Object.values(personHints).map((hints) => hints.profession));
    const unmappedProfessions = Array.from(professions).filter(
      (profession) => !(profession in professionCategoryByProfession),
    );

    assert.deepEqual(unmappedProfessions, []);
  });

  it('falls back to other for unknown professions', () => {
    assert.equal(getProfessionCategory('Unexpected profession'), 'other');
  });

  it('keeps activist and revolutionary as separate broad categories', () => {
    assert.equal(getProfessionCategory('Activist'), 'activist');
    assert.equal(getProfessionCategory('Revolutionary'), 'revolutionary');
  });

  it('splits performers into actor and musician categories', () => {
    assert.equal(getProfessionCategory('Actor'), 'actor');
    assert.equal(getProfessionCategory('Musician'), 'musician');
    assert.equal(getProfessionCategory('Singer'), 'musician');
    assert.equal(getProfessionCategory('Rapper'), 'musician');
    assert.equal(getProfessionCategory('Composer'), 'musician');
  });

  it('supports person-specific politician overrides', () => {
    assert.equal(getProfessionCategory('Activist', 'mahatma-gandhi'), 'politician');
    assert.equal(getProfessionCategory('Revolutionary', 'che-guevara'), 'politician');
    assert.equal(getProfessionCategory('Revolutionary', 'vladimir-lenin'), 'politician');
    assert.equal(getProfessionCategory('Liberator', 'simon-bolivar'), 'politician');
  });
});
