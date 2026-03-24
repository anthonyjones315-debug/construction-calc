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
  - alert [ref=e16]
  - generic [ref=e17]:
    - heading "Welcome to Pro Construction Calc" [level=1] [ref=e18]
    - paragraph [ref=e19]: Our powerful calculators are built for contractors. Sign up to start creating estimates and unlock the full suite of tools.
    - generic [ref=e20]:
      - button "Sign In" [ref=e21] [cursor=pointer]
      - button "Sign Up & Get Started" [ref=e22] [cursor=pointer]
      - link "Back Home" [ref=e23] [cursor=pointer]:
        - /url: /
```