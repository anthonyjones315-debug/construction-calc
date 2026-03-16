# Scraping Compliance Policy (2026)

- **Robots.txt first.** Before any crawl or fetch, read and respect `robots.txt`; abort if disallowed.  
- **No TOS violations.** Do not scrape sites whose Terms of Service prohibit automated access. Prefer official APIs.  
- **Human-like pacing.** Throttle requests (randomized delays, low concurrency) to avoid denial-of-service behavior.  
- **Identify properly.** Use a descriptive User-Agent and honor retry/backoff rules.  
- **Cache and minimize.** Cache public responses to reduce hit rate; never scrape authenticated pages.  
- **Legal review.** For new retailer integrations, obtain written approval or API credentials; keep an audit trail.  
- **Data hygiene.** Store only necessary fields, remove PII, and rotate credentials where applicable.  
- **Kill switch.** Any `403`, `429`, or TOS flag should disable scraping for that domain until reviewed.
