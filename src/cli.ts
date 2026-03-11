#!/usr/bin/env node

/**
 * CLI entry: parse args (Commander), apply config (CLI > env > defaults), then run MCP server.
 */

import { Command } from 'commander'
import { runServer } from './index.js'
import { ConfigError } from './utils/index.js'

const PKG_VERSION = '1.0.9'

const program = new Command()

program
  .name('roxy-browser-mcp')
  .description('RoxyBrowser MCP Server - Model Context Protocol server for RoxyBrowser automation')
  .version(PKG_VERSION, '-V, --version', 'Show version')
  .option(
    '-H, --api-host <url>',
    'RoxyBrowser API base URL',
    process.env.ROXY_API_HOST ?? 'http://127.0.0.1:50000',
  )
  .option(
    '-k, --api-key <key>',
    'API key (or set ROXY_API_KEY)',
    process.env.ROXY_API_KEY ?? '',
  )
  .option(
    '-t, --timeout <ms>',
    'Request timeout in milliseconds',
    (v: string) => (v != null && v !== '' ? Number.parseInt(v, 10) : 30_000),
    process.env.ROXY_TIMEOUT != null ? Number(process.env.ROXY_TIMEOUT) : 30_000,
  )
  .addHelpText(
    'after',
    `
Environment (used when option not passed):
  ROXY_API_HOST   API base URL (default: http://127.0.0.1:50000)
  ROXY_API_KEY    API key (required)
  ROXY_TIMEOUT    Timeout in ms (default: 30000)

Examples:
  roxy-browser-mcp --api-key "your-key"
  roxy-browser-mcp -k "your-key" -H http://127.0.0.1:50000
  ROXY_API_KEY=your-key roxy-browser-mcp
`,
  )

async function main(): Promise<void> {
  program.parse()

  const opts = program.opts<{ apiHost: string; apiKey: string; timeout: number }>()

  // Apply CLI args to env so request() sees them (env is the only config source)
  if (opts.apiHost != null && opts.apiHost !== '') process.env.ROXY_API_HOST = opts.apiHost
  if (opts.apiKey != null && opts.apiKey !== '') process.env.ROXY_API_KEY = opts.apiKey
  if (opts.timeout != null) process.env.ROXY_TIMEOUT = String(opts.timeout)

  try {
    await runServer()
  }
  catch (error) {
    if (error instanceof ConfigError) {
      console.error(`❌ Configuration Error: ${error.message}`)
      process.exit(1)
    }
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

main()
