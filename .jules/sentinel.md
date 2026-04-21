## 2025-05-15 - [XSS in PDF Generation]
**Vulnerability:** User-provided estimate data (client name, job site, contractor profile) was injected directly into the HTML template for PDF generation without escaping.
**Learning:** Server-side HTML generation for PDF conversion is a critical XSS vector that is often overlooked compared to frontend React components. Malicious payloads in contractor profiles or client names could execute scripts in the rendering environment.
**Prevention:** Standardize on a centralized HTML escaping utility for all server-side HTML interpolation.
