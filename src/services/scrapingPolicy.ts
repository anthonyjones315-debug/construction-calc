/**
 * Lightweight safeguards to keep material-price fetching compliant with
 * retailer Terms of Service and robots.txt. This is intentionally conservative.
 */
export const SCRAPING_MIN_DELAY_MS = 1200;

function getCrawlDelayMs(robotsText: string): number {
  const delayLine = robotsText
    .split("\n")
    .find((line) => /^crawl-delay:/i.test(line.trim()));
  if (!delayLine) return SCRAPING_MIN_DELAY_MS;
  const parsed = Number(delayLine.split(":")[1]?.trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed * 1000 : SCRAPING_MIN_DELAY_MS;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function isScrapingAllowed(targetUrl: string): Promise<boolean> {
  try {
    const { origin, pathname } = new URL(targetUrl);
    const robotsUrl = `${origin}/robots.txt`;
    const res = await fetch(robotsUrl, { method: "GET" });
    if (!res.ok) return false;
    const robotsText = await res.text();
    return !isDisallowed(pathname, robotsText);
  } catch {
    return false;
  }
}

export function isDisallowed(pathname: string, robotsText: string): boolean {
  const lines = robotsText.split("\n");
  let userAgentSection = false;
  const disallow: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^user-agent:\s*\*/i.test(line)) {
      userAgentSection = true;
      continue;
    }
    if (/^user-agent:/i.test(line)) {
      userAgentSection = false;
      continue;
    }
    if (userAgentSection && /^disallow:/i.test(line)) {
      const rule = line.split(":")[1]?.trim() ?? "";
      if (rule) disallow.push(rule);
    }
  }

  return disallow.some((rule) => rule !== "/" && pathname.startsWith(rule));
}

export async function assertScrapingPermitted(targetUrl: string) {
  const allowed = await isScrapingAllowed(targetUrl);
  if (!allowed) {
    throw new Error(`Scraping blocked by robots.txt or policy for ${targetUrl}`);
  }

  // Respect crawl-delay and basic human-like pacing.
  const { origin } = new URL(targetUrl);
  try {
    const robotsRes = await fetch(`${origin}/robots.txt`, { method: "GET" });
    const robotsText = robotsRes.ok ? await robotsRes.text() : "";
    const delay = getCrawlDelayMs(robotsText);
    if (delay > 0) {
      await sleep(delay);
    }
  } catch {
    // If robots cannot be read, err on the side of a minimal delay.
    await sleep(SCRAPING_MIN_DELAY_MS);
  }
}
