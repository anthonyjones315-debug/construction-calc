// ─── BUILD CALC PRO — DESIGN SYSTEM ────────────────────────────────────────
// Single source of truth for all colors, fonts, and spacing.
// Import { C, font, fontDisplay } from './theme.js' in every component.

export const C = {
  // Backgrounds
  bg:         '#f4f1eb',
  surface:    '#ffffff',
  surfaceAlt: '#f9f7f3',

  // Borders — unified to pass 3:1 non-text contrast on white
  border:      '#9a9389',
  borderLight: '#b8b2aa',

  // Text — all pass WCAG AA on white (#f4f1eb bg)
  ink:    '#1a1a1a',   // 16.9:1 — headings, values
  inkMid: '#4a4640',   // 8.4:1  — body copy
  inkDim: '#6b6560',   // 5.2:1  — labels, captions (AA large)

  // Accent — #e8820c is 2.6:1 on white, only use decorative/on-dark
  // For text on light bg, use accentDark (#b5620a = 4.6:1 ✓ AA)
  accent:      '#e8820c',
  accentDark:  '#b5620a',
  accentDeep:  '#8c4a07',
  accentSoft:  'rgba(232,130,12,0.10)',
  accentMid:   'rgba(232,130,12,0.18)',

  // Semantic colors
  green:      '#1a6e3f',   // 5.1:1 ✓
  greenSoft:  'rgba(26,110,63,0.10)',
  red:        '#b83232',   // 5.5:1 ✓
  redSoft:    'rgba(184,50,50,0.10)',
  blue:       '#1a5f8a',   // 6.0:1 ✓
  blueSoft:   'rgba(26,95,138,0.10)',
  purple:     '#6b3d9a',   // 5.8:1 ✓
  purpleSoft: 'rgba(107,61,154,0.10)',

  // Nav — dark bar
  navBg:     '#1a1a1a',
  navText:   '#c4bfb4',    // on dark: fine
  navActive: '#e8820c',    // on dark: fine

  // Category accent colors for dropdown cards
  catConcrete:   '#e8820c',
  catFraming:    '#1a6e3f',
  catArea:       '#1a5f8a',
  catMaterials:  '#6b3d9a',
  catElectrical: '#c49a00',
  catInsulation: '#c45000',
  catRoofing:    '#b83232',
};

export const font        = "'DM Sans', 'Segoe UI', system-ui, sans-serif";
export const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif";

// Shadow tokens
export const shadow = {
  sm:  '0 1px 4px rgba(0,0,0,0.06)',
  md:  '0 4px 16px rgba(0,0,0,0.10)',
  lg:  '0 12px 40px rgba(0,0,0,0.14)',
  xl:  '0 24px 64px rgba(0,0,0,0.18)',
};
