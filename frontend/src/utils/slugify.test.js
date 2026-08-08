import { describe, test, expect } from 'vitest';
import slugify from './slugify';

describe('slugify', () => {
    test('lowercases and replaces non-alphanumeric runs with a single hyphen', () => {
        expect(slugify('Attack on Titan')).toBe('attack-on-titan');
    });

    test('collapses consecutive punctuation into one hyphen', () => {
        expect(slugify('The Dark Knight: Rises!!')).toBe('the-dark-knight-rises');
    });

    test('trims leading and trailing hyphens', () => {
        expect(slugify('  Boruto: Naruto Next Generations  ')).toBe('boruto-naruto-next-generations');
    });

    test('keeps existing numbers', () => {
        expect(slugify('Solo Leveling Season 2')).toBe('solo-leveling-season-2');
    });
});
