import fs from "node:fs";

const files = ["src/lib/reports/invoice-template.ts", "tailwind.config.ts"];
const pairs = {
  ")": "(",
  "]": "[",
  "}": "{",
};

function scanBrackets(path) {
  const text = fs.readFileSync(path, "utf8");
  const stack = [];

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "(" || char === "[" || char === "{") {
      stack.push({ char, position: index + 1 });
      continue;
    }

    if (char === ")" || char === "]" || char === "}") {
      const last = stack.at(-1);
      if (!last || last.char !== pairs[char]) {
        throw new Error(
          `${path}: mismatched "${char}" at character ${index + 1}.`,
        );
      }
      stack.pop();
    }
  }

  if (stack.length > 0) {
    const last = stack.at(-1);
    throw new Error(
      `${path}: unclosed "${last?.char}" starting at character ${last?.position}.`,
    );
  }

  if (!text.endsWith("\n")) {
    throw new Error(`${path}: missing trailing newline at EOF.`);
  }
}

for (const file of files) {
  scanBrackets(file);
  console.log(`${file}: OK`);
}
