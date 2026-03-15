import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const target = path.resolve(root, "../dist-calcs/calculators/index.js");

async function rewrite() {
  try {
    const raw = await fs.readFile(target, "utf8");
    const fixed = raw.replace(/"@\/utils\/validate"/g, '"../utils/validate.js"');
    if (fixed === raw) return;
    await fs.writeFile(target, fixed, "utf8");
  } catch (error) {
    console.error("Failed to rewrite aliases for calculators build:", error);
    throw error;
  }
}

await rewrite();
