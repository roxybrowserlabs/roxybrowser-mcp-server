#!/usr/bin/env node

import { runBrowserCli } from "./cli/browser.js";
import { runCommerceCli } from "./cli/commerce.js";

function stripModeArgs(argv: string[]): { argv: string[]; commerce: boolean } {
  const nextArgv = argv.slice(0, 2);
  let commerce = false;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "commerce" || arg === "--commerce") {
      commerce = true;
      continue;
    }

    if (arg === "browser" || arg === "--browser") {
      commerce = false;
      continue;
    }

    if (arg === "--mode") {
      const mode = argv[index + 1];
      if (mode === "commerce") {
        commerce = true;
      } else if (mode === "browser") {
        commerce = false;
      }
      index += 1;
      continue;
    }

    if (arg.startsWith("--mode=")) {
      const mode = arg.slice("--mode=".length);
      if (mode === "commerce") {
        commerce = true;
      } else if (mode === "browser") {
        commerce = false;
      }
      continue;
    }

    nextArgv.push(arg);
  }

  return { argv: nextArgv, commerce };
}

const { argv, commerce } = stripModeArgs(process.argv);

const run = commerce ? runCommerceCli : runBrowserCli;

run(argv).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
