import { ingredientsData } from '@/data/ingredients';

describe('ingredients data', () => {
  it('contains entries with required fields', () => {
    expect(Array.isArray(ingredientsData)).toBe(true);
    expect(ingredientsData.length).toBeGreaterThan(0);
    for (const item of ingredientsData) {
      expect(typeof item.name).toBe('string');
      expect(item.name.length).toBeGreaterThan(0);
      expect(typeof item.color).toBe('string');
      expect(item.color.length).toBeGreaterThan(0);
      expect(typeof item.icon).toBe('string');
      expect(item.icon.length).toBeGreaterThan(0);
      expect(Array.isArray(item.tags)).toBe(true);
    }
  });

  it('has unique ingredient names', () => {
    const names = ingredientsData.map(item => item.name.toLowerCase().trim());
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it('uses valid hex-like colors', () => {
    const hexLike = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
    for (const item of ingredientsData) {
      expect(hexLike.test(item.color)).toBe(true);
    }
  });
});
