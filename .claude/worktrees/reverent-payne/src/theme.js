/**
 * Shared theme constants
 * Import C, font, and fontDisplay from here instead of redefining per component.
 * Calculator.jsx keeps its own extended C (different border values, ink* aliases).
 */

export const C = {
  bg: '#f4f1eb',
  surface: '#ffffff',
  surfaceAlt: '#f9f7f3',
  border: '#d9d4c7',
  navBg: '#1a1a1a',
  accent: '#e8820c',
  accentDark: '#c96d08',
  accentSoft: 'rgba(232,130,12,0.10)',
  text: '#1a1a1a',
  textMid: '#555248',
  textDim: '#8c887f',
  green: '#1a7a4a',
  greenSoft: 'rgba(26,122,74,0.10)',
  blue: '#1d6fa4',
  blueSoft: 'rgba(29,111,164,0.10)',
}

export const font = "'DM Sans', 'Segoe UI', system-ui, sans-serif"
export const fontDisplay = "'Barlow Condensed', 'DM Sans', system-ui, sans-serif"
