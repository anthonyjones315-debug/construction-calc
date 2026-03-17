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
    const results = await Promise.allSettled(
      targets.map(async (target) => ({
        target,
        raw: await fs.readFile(target, "utf8"),
      })),
    );

    for (const [index, result] of results.entries()) {
      const target = targets[index];

      if (result.status === "rejected") {
        if (result.reason?.code === "ENOENT") {
          continue;
        }

        console.error(`Failed to rewrite aliases for ${target}:`, result.reason);
        throw result.reason;
      }

      const fixed = result.value.raw
        .replace(/"@\/utils\/validate"/g, '"../utils/validate.js"')
        .replace(/"@\/utils\/money"/g, '"../utils/money.js"');

      if (fixed === result.value.raw) {
        continue;
      }

      await fs.writeFile(result.value.target, fixed, "utf8");
    }
  } catch (error) {
    console.error("Failed to rewrite aliases for calculators build:", error);
    throw error;
  }
}

await rewrite();
