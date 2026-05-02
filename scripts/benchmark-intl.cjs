const { performance } = require('perf_hooks');

const ITERATIONS = 100000;

function benchmarkNoCache() {
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(1234.56);
  }
  return performance.now() - start;
}

const cache = new Map();
function getCacheKey(locale, options) {
  const keys = Object.keys(options);
  if (keys.length === 0) return locale;
  keys.sort();
  const optionsString = keys
    .map((key) => `${key}:${String(options[key])}`)
    .join("|");
  return `${locale}|${optionsString}`;
}

function getNumberFormatter(options, locale = 'en-US') {
  const key = getCacheKey(locale, options);
  let formatter = cache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, options);
    cache.set(key, formatter);
  }
  return formatter;
}

function benchmarkWithCache() {
  const options = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    getNumberFormatter(options).format(1234.56);
  }
  return performance.now() - start;
}

console.log(`Running benchmark with ${ITERATIONS} iterations...`);

const timeNoCache = benchmarkNoCache();
console.log(`Without caching: ${timeNoCache.toFixed(2)}ms`);

const timeWithCache = benchmarkWithCache();
console.log(`With caching:    ${timeWithCache.toFixed(2)}ms`);

const speedup = timeNoCache / timeWithCache;
console.log(`Speedup:         ${speedup.toFixed(2)}x`);
