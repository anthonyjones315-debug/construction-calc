export function toBasisPoints(percent: number) {
  return Number((percent * 100).toFixed(0));
}

export function scaleCentsByBasisPoints(cents: number, basisPoints: number) {
  return Number(((cents * basisPoints) / 10_000).toFixed(0));
}

export function divideCentsByBasisPoints(cents: number, basisPoints: number) {
  if (!Number.isFinite(cents) || !Number.isFinite(basisPoints) || basisPoints <= 0) {
    return 0;
  }

  return Number(((cents * 10_000) / basisPoints).toFixed(0));
}
