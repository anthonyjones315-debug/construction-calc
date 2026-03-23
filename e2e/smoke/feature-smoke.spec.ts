// e2e/smoke/feature-smoke.spec.ts
import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Load discovered routes if available, otherwise fallback to a minimal set
let routes: string[] = [];
const jsonPath = path.resolve('tmp', 'feature-map.json');
if (fs.existsSync(jsonPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as { url: string; title: string }[];
    routes = data.map(r => r.url);
  } catch {
    console.warn('Failed to parse feature-map.json, using fallback routes');
  }
}
if (routes.length === 0) {
  // Fallback core routes – adjust as needed
  routes = ['/', '/about', '/contact'];
}

for (const url of routes) {
  test(`@smoke route ${url}`, async ({ page }) => {
    await page.goto(url);
    const title = await page.title();
    expect(title).not.toBe('');
  });
}
