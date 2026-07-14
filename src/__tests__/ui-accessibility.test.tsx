import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FeetInchesInput } from '../components/ui/FeetInchesInput';
import { ProInput } from '../components/ui/ProInput';

describe('Accessibility Enhancements', () => {
  describe('FeetInchesInput', () => {
    it('should not have aria-labelledby on internal controls and should have aria-describedby', () => {
      const html = renderToStaticMarkup(
        <FeetInchesInput
          label="Test Label"
          subLabel="Test Sublabel"
          helpText="Test Help"
          value={10}
          onChange={() => {}}
        />
      );

      // Check for fieldset and legend
      expect(html).toContain('<fieldset');
      expect(html).toContain('<legend');

      // Check that internal controls DON'T have aria-labelledby
      // We check for the absence of aria-labelledby="...-label" on input/select
      // Note: renderToStaticMarkup might reorder attributes, so we use regex
      const ariaLabelledByRegex = /aria-labelledby="[^"]*label"/;
      expect(ariaLabelledByRegex.test(html)).toBe(false);

      // Check for aria-describedby
      expect(html).toContain('aria-describedby=');
      expect(html).toContain('-sublabel');
      expect(html).toContain('-helptext');
    });
  });

  describe('ProInput', () => {
    it('should use fieldset and legend and have aria-describedby', () => {
      const html = renderToStaticMarkup(
        <ProInput
          label="Pro Label"
          subLabel="Pro Sublabel"
          helpText="Pro Help"
          value={5}
          onChange={() => {}}
        />
      );

      expect(html).toContain('<fieldset');
      expect(html).toContain('<legend');
      expect(html).toContain('aria-describedby=');
      expect(html).toContain('-sublabel');
      expect(html).toContain('-helptext');

      // Check for specific legend classes from memory requirement
      expect(html).toContain('mb-1');
      expect(html).toContain('block');
      expect(html).toContain('w-full');
    });
  });
});
