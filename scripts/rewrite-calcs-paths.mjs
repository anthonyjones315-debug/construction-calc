import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const targets = [
  path.resolve(root, "../dist-calcs/calculators/index.js"),
  path.resolve(root, "../dist-calcs/utils/validate.js"),
];

async function rewrite() {
  try {
    await Promise.all(
      targets.map(async (target) => {
        const raw = await fs.readFile(target, "utf8");
        const fixed = raw
          .replace(/"@\/utils\/validate"/g, '"../utils/validate.js"')
          .replace(/"@\/utils\/money"/g, '"../utils/money.js"');
        if (fixed === raw) return;
        await fs.writeFile(target, fixed, "utf8");
      }),
    );
  } catch (error) {
    console.error("Failed to rewrite aliases for calculators build:", error);
    throw error;
  }
}

await rewrite();
