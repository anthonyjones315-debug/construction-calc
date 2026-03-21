import "server-only";

type HeadersLike = Pick<Request, "headers">;

/** Best-effort client IP for rate limiting (trust X-Forwarded-For only behind your edge, e.g. Vercel). */
export function getClientIp(request: HeadersLike): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && first.length <= 64 && first !== "unknown") {
      return first;
    }
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real && real.length <= 64 && real !== "unknown") {
    return real;
  }
  return "unknown";
}
