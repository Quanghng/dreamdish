import fs from 'fs';
import path from 'path';
import { ingredientImageMap } from '@/data/ingredient-image-map';

const PUBLIC_INGREDIENTS_DIR = path.join(process.cwd(), 'public', 'img', 'ingredients');

describe('ingredient image map', () => {
  it('contains entries and uses .webp filenames', () => {
    const values = Object.values(ingredientImageMap);
    expect(values.length).toBeGreaterThan(0);
    for (const value of values) {
      expect(value.endsWith('.webp')).toBe(true);
    }
  });

  it('points to files that exist on disk', () => {
    const values = Object.values(ingredientImageMap);
    for (const file of values) {
      const filePath = path.join(PUBLIC_INGREDIENTS_DIR, decodeURIComponent(file));
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });
});
