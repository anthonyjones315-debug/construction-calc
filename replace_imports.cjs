const fs = require('fs');
const path = require('path');
const files = [
  'e2e/accessibility.spec.ts',
  'e2e/billing/paywall.spec.ts',
  'e2e/calculators/business.spec.ts',
  'e2e/calculators/concrete.spec.ts',
  'e2e/calculators/framing.spec.ts',
  'e2e/calculators/roofing.spec.ts',
  'e2e/cart.spec.ts',
  'e2e/clerk-testing.spec.ts',
  'e2e/command-center.spec.ts',
  'e2e/core/google-maps.spec.ts',
  'e2e/crm-flows.spec.ts',
  'e2e/estimates/pdf-email.spec.ts',
  'e2e/estimates/pdf-export.spec.ts',
  'e2e/estimates/saved-estimates.spec.ts',
  'e2e/mobile/pwa.spec.ts',
  'e2e/navigation.spec.ts',
  'e2e/office-manager/command-center.spec.ts',
  'e2e/office-manager/financial-dashboard.spec.ts',
  'e2e/office-manager/pricebook.spec.ts',
  'e2e/onboarding-video-capture.spec.ts',
  'e2e/performance.spec.ts',
  'e2e/protected-route-smoke.spec.ts',
  'e2e/security.spec.ts',
  'e2e/settings.spec.ts',
  'e2e/visual-regression.spec.ts',
];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const dir = path.dirname(f);
  let rel = path.relative(dir, 'e2e/lib');
  if (!rel.startsWith('.')) rel = './' + rel;
  const imp = rel + '/test-fixtures';
  const u = c.replace(/from ["']@playwright\/test["']/g, 'from "' + imp + '"');
  if (u !== c) {
    fs.writeFileSync(f, u);
    console.log('OK', f, '->', imp);
  } else {
    console.log('SKIP', f);
  }
}
console.log('Done!');
