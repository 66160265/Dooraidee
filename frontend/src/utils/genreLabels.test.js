import { describe, test, expect } from 'vitest';
import { genreLabel } from './genreLabels';

describe('genreLabel', () => {
    test('translates a known English genre to Thai', () => {
        expect(genreLabel('Action')).toBe('แอ็กชัน');
        expect(genreLabel('Slice of Life')).toBe('สไลซ์ออฟไลฟ์');
    });

    test('falls back to the original name for an unmapped genre', () => {
        expect(genreLabel('SomeBrandNewGenre')).toBe('SomeBrandNewGenre');
    });
});
