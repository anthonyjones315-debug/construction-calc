import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DEFAULT_FRONTEND_PATHS = ["src/app", "src/components", "src/calculators"];
const DEFAULT_BUG_PATTERN = "fix|bug|hotfix|regression|patch";
const DEFAULT_DEPLOY_PATTERN = "deploy|release|ship|vercel|prod|production";

const toNumber = (value, fallback) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseArgs = (argv) => {
  const args = {
    sinceDays: 90,
    frontendPaths: DEFAULT_FRONTEND_PATHS,
    bugPattern: DEFAULT_BUG_PATTERN,
    deployPattern: DEFAULT_DEPLOY_PATTERN,
    legacyPath: "scripts/legacy-plain-js-metrics.json",
    outputPath: "",
    includeMerges: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;

    const [rawKey, inlineValue] = token.split("=", 2);
    const key = rawKey.slice(2);
    const nextValue = inlineValue ?? argv[index + 1];
    const hasStandaloneValue =
      inlineValue === undefined &&
      argv[index + 1] &&
      !argv[index + 1].startsWith("--");

    const consumeValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      if (hasStandaloneValue) {
        index += 1;
        return argv[index];
      }
      return "";
    };

    if (key === "sinceDays") {
      args.sinceDays = toNumber(consumeValue(), args.sinceDays);
    } else if (key === "frontendPaths") {
      const value = consumeValue();
      const paths = value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      if (paths.length) {
        args.frontendPaths = paths;
      }
    } else if (key === "bugPattern") {
      const value = consumeValue();
      if (value) args.bugPattern = value;
    } else if (key === "deployPattern") {
      const value = consumeValue();
      if (value) args.deployPattern = value;
    } else if (key === "legacy") {
      const value = consumeValue();
      if (value) args.legacyPath = value;
    } else if (key === "output") {
      const value = consumeValue();
      if (value) args.outputPath = value;
    } else if (key === "includeMerges") {
      args.includeMerges = true;
    } else if (key === "help") {
      args.help = true;
    }
  }

  return args;
};

const printHelp = () => {
  console.log(
    `Frontend benchmark script\n\nUsage:\n  node scripts/benchmark-frontend-metrics.mjs [options]\n\nOptions:\n  --sinceDays <number>         Window size in days (default: 90)\n  --frontendPaths <a,b,c>      Comma-separated frontend path prefixes\n  --bugPattern <regex>         Regex to classify frontend bug commits\n  --deployPattern <regex>      Regex to classify deployment commits\n  --legacy <path>              Legacy baseline JSON path\n  --output <path>              Optional path to write JSON report\n  --includeMerges              Include merge commits in git scan\n  --help                       Show this help\n`,
  );
};

const parseGitOutput = (rawOutput) => {
  const marker = "__COMMIT__";
  const chunks = rawOutput
    .split(marker)
    .map((entry) => entry.trim())
    .filter(Boolean);
  const commits = [];

  for (const chunk of chunks) {
    const lines = chunk.split("\n");
    const header = lines.shift() ?? "";
    const [hash, committedAt, subject] = header.split("|");
    const files = lines.map((line) => line.trim()).filter(Boolean);
    if (!hash || !committedAt || !subject) continue;

    commits.push({
      hash,
      committedAt,
      subject,
      files,
    });
  }

  return commits;
};

const readLegacyMetrics = async (legacyPath, fallbackWindowDays) => {
  const absolutePath = path.resolve(process.cwd(), legacyPath);
  try {
    const raw = await fs.readFile(absolutePath, "utf8");
    const json = JSON.parse(raw);
    const frontendBugCount = toNumber(json.frontendBugCount, 0);
    const deploymentCount = toNumber(json.deploymentCount, 0);
    const windowDays = toNumber(json.windowDays, fallbackWindowDays);

    return {
      found: true,
      absolutePath,
      metrics: {
        label: json.label || "Legacy Plain JS",
        windowDays,
        frontendBugCount,
        deploymentCount,
      },
    };
  } catch {
    return {
      found: false,
      absolutePath,
      metrics: {
        label: "Legacy Plain JS",
        windowDays: fallbackWindowDays,
        frontendBugCount: 0,
        deploymentCount: 0,
      },
    };
  }
};

const safeRatio = (numerator, denominator) => {
  if (!denominator) return null;
  return numerator / denominator;
};

const safeRatePerWeek = (count, windowDays) => {
  if (!windowDays) return 0;
  return (count * 7) / windowDays;
};

const percentChange = (current, legacy) => {
  if (!legacy && !current) return 0;
  if (!legacy) return null;
  return ((current - legacy) / legacy) * 100;
};

const formatPercent = (value) => {
  if (value === null || Number.isNaN(value)) return "n/a";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value))
    return "n/a";
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
};

const run = async () => {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return;
  }

  const sinceDays = Math.max(1, Math.floor(args.sinceDays));
  const frontendPaths = args.frontendPaths;
  const bugRegex = new RegExp(args.bugPattern, "i");
  const deployRegex = new RegExp(args.deployPattern, "i");

  const gitArgs = [
    "log",
    `--since=${sinceDays}.days`,
    "--name-only",
    "--date=iso-strict",
    "--pretty=format:__COMMIT__%H|%cI|%s",
  ];
  if (!args.includeMerges) {
    gitArgs.push("--no-merges");
  }

  const { stdout } = await execFileAsync("git", gitArgs, {
    cwd: process.cwd(),
    maxBuffer: 1024 * 1024 * 16,
  });
  const commits = parseGitOutput(stdout);
  const frontendCommits = commits.filter((commit) =>
    commit.files.some((file) =>
      frontendPaths.some((prefix) => file.startsWith(prefix)),
    ),
  );

  const frontendBugCommits = frontendCommits.filter((commit) =>
    bugRegex.test(commit.subject),
  );
  const deploymentCommits = commits.filter((commit) =>
    deployRegex.test(commit.subject),
  );

  const current = {
    label: "Current Frontend",
    windowDays: sinceDays,
    frontendBugCount: frontendBugCommits.length,
    deploymentCount: deploymentCommits.length,
  };

  const legacy = await readLegacyMetrics(args.legacyPath, sinceDays);

  const currentBugRatePerDeploy = safeRatio(
    current.frontendBugCount,
    current.deploymentCount,
  );
  const legacyBugRatePerDeploy = safeRatio(
    legacy.metrics.frontendBugCount,
    legacy.metrics.deploymentCount,
  );

  const currentDeploymentsPerWeek = safeRatePerWeek(
    current.deploymentCount,
    current.windowDays,
  );
  const legacyDeploymentsPerWeek = safeRatePerWeek(
    legacy.metrics.deploymentCount,
    legacy.metrics.windowDays,
  );

  const comparison = {
    bugCountChangePercent: percentChange(
      current.frontendBugCount,
      legacy.metrics.frontendBugCount,
    ),
    deploymentVelocityChangePercent: percentChange(
      currentDeploymentsPerWeek,
      legacyDeploymentsPerWeek,
    ),
    bugsPerDeployChangePercent: percentChange(
      currentBugRatePerDeploy ?? 0,
      legacyBugRatePerDeploy ?? 0,
    ),
  };

  const report = {
    generatedAt: new Date().toISOString(),
    params: {
      sinceDays,
      frontendPaths,
      bugPattern: args.bugPattern,
      deployPattern: args.deployPattern,
      includeMerges: args.includeMerges,
    },
    sampleSizes: {
      totalCommitsScanned: commits.length,
      frontendCommitsScanned: frontendCommits.length,
    },
    current: {
      ...current,
      bugsPerDeploy: currentBugRatePerDeploy,
      deploymentsPerWeek: currentDeploymentsPerWeek,
    },
    legacy: {
      ...legacy.metrics,
      bugsPerDeploy: legacyBugRatePerDeploy,
      deploymentsPerWeek: legacyDeploymentsPerWeek,
      sourcePath: legacy.absolutePath,
      sourceFound: legacy.found,
    },
    comparison,
  };

  console.log("\nFrontend quality + delivery benchmark");
  console.log(`Window: last ${sinceDays} day(s)`);
  console.log(`Frontend paths: ${frontendPaths.join(", ")}`);
  console.log(
    `Scanned commits: ${commits.length} total, ${frontendCommits.length} frontend\n`,
  );

  if (!legacy.found) {
    console.log(`Legacy baseline not found at ${legacy.absolutePath}.`);
    console.log(
      "Create it from scripts/legacy-plain-js-metrics.example.json for comparison values.\n",
    );
  }

  console.log(`Current frontend bug count: ${current.frontendBugCount}`);
  console.log(`Legacy frontend bug count: ${legacy.metrics.frontendBugCount}`);
  console.log(
    `Bug count delta: ${formatPercent(comparison.bugCountChangePercent)}`,
  );
  console.log("");
  console.log(
    `Current deployment velocity (per week): ${formatNumber(currentDeploymentsPerWeek)}`,
  );
  console.log(
    `Legacy deployment velocity (per week): ${formatNumber(legacyDeploymentsPerWeek)}`,
  );
  console.log(
    `Deployment velocity delta: ${formatPercent(comparison.deploymentVelocityChangePercent)}`,
  );
  console.log("");
  console.log(`Current bugs/deploy: ${formatNumber(currentBugRatePerDeploy)}`);
  console.log(`Legacy bugs/deploy: ${formatNumber(legacyBugRatePerDeploy)}`);
  console.log(
    `Bugs/deploy delta: ${formatPercent(comparison.bugsPerDeployChangePercent)}`,
  );

  if (args.outputPath) {
    const absoluteOutputPath = path.resolve(process.cwd(), args.outputPath);
    await fs.mkdir(path.dirname(absoluteOutputPath), { recursive: true });
    await fs.writeFile(
      absoluteOutputPath,
      `${JSON.stringify(report, null, 2)}\n`,
      "utf8",
    );
    console.log(`\nWrote JSON report to ${absoluteOutputPath}`);
  }
};

await run();
