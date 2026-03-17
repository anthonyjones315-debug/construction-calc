import { describe, expect, it } from "vitest";
import {
  buildWelcomeEmailHtml,
  buildWelcomeEmailText,
} from "@/lib/email/welcome-template";

describe("welcome email template", () => {
  const input = {
    fullName: "Sam Builder",
    commandCenterUrl: "https://proconstructioncalc.com/command-center",
    signInUrl:
      "https://proconstructioncalc.com/auth/signin?callbackUrl=%2Fcommand-center",
    calculatorsUrl: "https://proconstructioncalc.com/calculators",
    guideUrl: "https://proconstructioncalc.com/guide",
  };

  it("renders brand CTA links and escapes the recipient name", () => {
    const html = buildWelcomeEmailHtml(input);

    expect(html).toContain("Welcome to the team");
    expect(html).toContain(input.commandCenterUrl);
    expect(html).toContain(input.calculatorsUrl);
    expect(html).toContain("Hi Sam,");
  });

  it("escapes unsafe names in the html greeting", () => {
    const html = buildWelcomeEmailHtml({
      ...input,
      fullName: '<script>alert("x")</script>',
    });

    expect(html).not.toContain("<script>alert(\"x\")</script>");
    expect(html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  });

  it("includes the core app links in the text version", () => {
    const text = buildWelcomeEmailText(input);

    expect(text).toContain("Command Center");
    expect(text).toContain(input.signInUrl);
    expect(text).toContain(input.guideUrl);
    expect(text).toContain("Sam");
  });
});
