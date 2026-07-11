import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProInput } from '../../../components/ui/glass-elements';
import { FeetInchesInput } from '../../../components/ui/FeetInchesInput';
import * as React from 'react';

describe('Accessibility Semantic Grouping', () => {
  it('ProInput renders as fieldset/legend when unitSelectOptions are provided', () => {
    const markup = renderToStaticMarkup(
      <ProInput
        label="Test Label"
        value={10}
        onChange={() => {}}
        unitSelectOptions={[{ label: 'ft', value: 'ft' }]}
        unitSelectValue="ft"
      />
    );

    expect(markup).toContain('<fieldset');
    expect(markup).toContain('<legend');
    // Ensure input has aria-label and no aria-labelledby
    expect(markup).toContain('aria-label="Test Label"');
    expect(markup).not.toContain('aria-labelledby');
  });

  it('ProInput renders as label when no unitSelectOptions are provided', () => {
    const markup = renderToStaticMarkup(
      <ProInput label="Test Label" value={10} onChange={() => {}} />
    );

    expect(markup).toContain('<label');
    expect(markup).not.toContain('<fieldset');
    expect(markup).toContain('aria-labelledby');
  });

  it('FeetInchesInput internal elements do not have aria-labelledby', () => {
    const markup = renderToStaticMarkup(
      <FeetInchesInput
        label="Length"
        value={10}
        onChange={() => {}}
      />
    );

    expect(markup).toContain('<fieldset');
    expect(markup).toContain('<legend');
    // Verify aria-labels exist
    expect(markup).toContain('aria-label="Length feet"');
    expect(markup).toContain('aria-label="Length inches"');
    expect(markup).toContain('aria-label="Length fractional inches"');
    // Verify aria-labelledby is NOT on the inputs/select (it's on the legend's span, which is fine, but not on interactive elements)
    // The grep showed it was on input/select before.
    // In our markup, we expect it to NOT be on those.

    // We check that the interactive elements (input, select) don't have it.
    // This is a bit coarse with toNotContain but should work for identifying regressions.
    const inputMatches = markup.match(/<input[^>]*aria-labelledby/g);
    const selectMatches = markup.match(/<select[^>]*aria-labelledby/g);

    expect(inputMatches).toBeNull();
    expect(selectMatches).toBeNull();
  });
});
