# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alertdialog "Cookie Consent Prompt" [ref=e2]:
    - generic [ref=e3]:
      - link "Powered by Termly" [ref=e5] [cursor=pointer]:
        - /url: https://termly.io/products/cookie-consent-manager/
        - img "Powered by Termly" [ref=e6]
      - generic [ref=e7]:
        - generic [ref=e8]:
          - text: We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking “Accept,” you agree to our website's cookie use as described in our
          - button "Cookie Policy" [ref=e9] [cursor=pointer]
          - text: . You can change your cookie settings at any time by clicking “
          - button "Preferences" [ref=e10] [cursor=pointer]
          - text: .”
        - generic [ref=e11]:
          - button "Preferences" [ref=e12] [cursor=pointer]
          - button "Decline" [ref=e13] [cursor=pointer]
          - button "Accept" [ref=e14] [cursor=pointer]
  - link "Skip to main content" [ref=e15] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e17]:
    - generic [ref=e18]:
      - generic [ref=e20]: P
      - generic [ref=e21]: Pro Construction Calc
    - generic [ref=e22]:
      - generic [ref=e23]: "404"
      - heading "Page not found" [level=1] [ref=e24]
      - paragraph [ref=e25]: That page doesn't exist. It may have been moved or the link is incorrect.
      - generic [ref=e26]:
        - link "Open Calculators" [ref=e27] [cursor=pointer]:
          - /url: /calculators
        - link "Go to Home" [ref=e28] [cursor=pointer]:
          - /url: /
  - alert [ref=e29]
```