## 2024-04-17 - [Sensitive tokens in local logs]
**Vulnerability:** Application logs generated during development (like `dev_server.log`) can capture sensitive authentication tokens (e.g., Clerk session tokens) in plain text.
**Learning:** Next.js dev server output often includes full URLs or headers containing tokens which are then piped to log files by automated tools.
**Prevention:** Never commit `.log` files and always verify that environment-specific artifacts are deleted before submission. Use `.gitignore` to prevent accidental staging.
