#!/usr/bin/env node

import { runBrowserCli } from './cli/browser.js'

runBrowserCli().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
