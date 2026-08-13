import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { defineConfig } from "vite-plus";

const sourceRoots = ["src/api", "src/sdk", "src/domains", "src/mcp", "src/cli"];

function collectEntries(dir: string): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name);

    if (statSync(fullPath).isDirectory()) {
      Object.assign(entries, collectEntries(fullPath));
      continue;
    }

    if (!name.endsWith(".ts") || name.endsWith(".test.ts")) continue;

    entries[relative("src", fullPath).replace(/\.ts$/, "")] = fullPath;
  }

  return entries;
}

const entries = {
  index: "src/index.ts",
  cli: "src/cli.ts",
  ...Object.assign({}, ...sourceRoots.map(collectEntries)),
};

export default defineConfig({
  pack: {
    entry: entries,
    format: ["esm", "cjs"],
    outDir: "lib",
    root: "src",
    unbundle: true,
    dts: true,
    sourcemap: true,
    clean: true,
    target: "node20.19",
    platform: "node",
    treeshake: true,
    publint: true,
    attw: true,
    outExtensions({ format }) {
      return format === "cjs" ? { js: ".cjs", dts: ".d.cts" } : { js: ".js", dts: ".d.ts" };
    },
  },
  test: {
    include: ["src/{api,sdk,domains,mcp,cli}/**/*.test.mjs"],
    globalSetup: ["./support/build-for-tests.mjs"],
    coverage: {
      provider: "v8",
      include: ["lib/{api,sdk,domains,mcp,cli}/**/*.js"],
      exclude: [
        "lib/**/index.js",
        "lib/**/types.js",
        "lib/domains/commerce/platform-credentials.js",
        "lib/domains/commerce/proxies.js",
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
      },
    },
  },
  lint: {
    ignorePatterns: ["lib/**", "coverage/**", "examples/**"],
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    ignorePatterns: ["lib/**", "coverage/**"],
  },
  run: {
    cache: {
      scripts: true,
      tasks: true,
    },
  },
  staged: {
    "*.{js,mjs,ts,json,md,yaml,yml}": "vp check --fix",
  },
});
