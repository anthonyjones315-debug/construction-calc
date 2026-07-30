# Sentinel Journal

## 2025-05-15 - Private Key Exposure in Version Control
**Vulnerability:** A `.p12` certificate file (`documenso-pdf-seal.p12`) was committed to the repository.
**Learning:** Private keys and certificates were being tracked in Git, posing a significant risk if the repository were compromised or made public.
**Prevention:** Explicitly ignore sensitive file extensions like `.p12`, `.pem`, and `.key` in `.gitignore` and audit the repository for existing secrets.

## 2025-05-15 - Webhook Authentication Bypass and Timing Attacks
**Vulnerability:** The Documenso webhook receiver would skip signature verification if the `WEBHOOK_SECRET` was not configured, and used a simple string comparison for signatures.
**Learning:** Fail-open logic in authentication checks can lead to complete bypasses if environment variables are misconfigured. Non-constant-time string comparisons are susceptible to timing attacks.
**Prevention:** Always implement fail-closed logic for security checks. Use `crypto.timingSafeEqual` for comparing sensitive values like signatures or tokens.

## 2026-03-17 - HTML Injection / XSS in PDF Estimate Template
**Vulnerability:** Dynamic materials list arrays (`material_list`) were mapped directly into the HTML PDF report template without sanitization, permitting arbitrary script or HTML tag execution.
**Learning:** User-controlled inputs embedded into dynamically generated HTML (such as estimates/invoices rendered by remote headless PDF browsers) represent direct XSS/HTML Injection attack vectors if left unescaped.
**Prevention:** Introduce and enforce a robust `escapeHtml` utility on all dynamic text values prior to template rendering.
