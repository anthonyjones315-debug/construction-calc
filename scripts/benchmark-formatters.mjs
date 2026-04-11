import { getNumberFormatter } from '../src/utils/formatters.ts';

const iterations = 10000;

console.log(`Running benchmark with ${iterations} iterations...`);

// Test repeated instantiation
const start1 = performance.now();
for (let i = 0; i < iterations; i++) {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  formatter.format(123.45);
}
const end1 = performance.now();
console.log(`Repeated instantiation: ${(end1 - start1).toFixed(2)}ms`);

// Test cached retrieval
const start2 = performance.now();
for (let i = 0; i < iterations; i++) {
  const formatter = getNumberFormatter('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  formatter.format(123.45);
}
const end2 = performance.now();
console.log(`Cached retrieval: ${(end2 - start2).toFixed(2)}ms`);

const speedup = (end1 - start1) / (end2 - start2);
console.log(`Speedup: ${speedup.toFixed(2)}x`);
