/**
 * Benchmark cached Intl.NumberFormat vs repeated instantiation.
 */

const iterations = 100000;
const locale = 'en-US';
const options = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

// --- Naive implementation (repeated instantiation) ---
function naiveFormat(value) {
  return new Intl.NumberFormat(locale, options).format(value);
}

// --- Cached implementation ---
const cache = new Map();
function getCacheKey(loc, opt) {
  const sortedKeys = Object.keys(opt).sort();
  const optionsKey = sortedKeys
    .map((key) => `${key}:${opt[key]}`)
    .join("|");
  return `${loc}|${optionsKey}`;
}

function cachedFormat(value) {
  const key = getCacheKey(locale, options);
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter.format(value);
}

console.log(`Running benchmark with ${iterations} iterations...`);

// Warm up
naiveFormat(123.45);
cachedFormat(123.45);

const startNaive = Date.now();
for (let i = 0; i < iterations; i++) {
  naiveFormat(i);
}
const endNaive = Date.now();
const naiveTime = endNaive - startNaive;

const startCached = Date.now();
for (let i = 0; i < iterations; i++) {
  cachedFormat(i);
}
const endCached = Date.now();
const cachedTime = endCached - startCached;

console.log(`Naive approach: ${naiveTime}ms`);
console.log(`Cached approach: ${cachedTime}ms`);
console.log(`Speedup: ${(naiveTime / cachedTime).toFixed(2)}x`);

if (cachedTime < naiveTime) {
  console.log('✅ Optimization verified: Cached approach is faster.');
} else {
  console.log('❌ Optimization failed: Cached approach is slower or equal.');
}
