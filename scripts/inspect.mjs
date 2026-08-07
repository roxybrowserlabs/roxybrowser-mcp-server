#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import path from 'node:path'

const DEFAULT_API_HOST = 'http://127.0.0.1:50001'
const DEFAULT_API_KEY = '90c268e583d86dea33c217aedd625605'
const DEFAULT_SERVER_PORT = '6278'
const DEFAULT_CLIENT_PORT = '6279'
const require = createRequire(import.meta.url)
const inspectorPackageJson = require.resolve('@modelcontextprotocol/inspector/package.json')
const inspectorBinPath = path.resolve(path.dirname(inspectorPackageJson), 'cli/build/cli.js')

function parseArgs(argv) {
  const options = {
    apiHost: process.env.ROXY_API_HOST ?? DEFAULT_API_HOST,
    apiKey: process.env.ROXY_API_KEY ?? DEFAULT_API_KEY,
    workspaceId: process.env.ROXY_WORKSPACE_ID?.trim() || process.env.npm_config_workspace_id?.trim() || undefined,
    serverPort: process.env.SERVER_PORT ?? process.env.npm_config_server_port ?? DEFAULT_SERVER_PORT,
    clientPort: process.env.CLIENT_PORT ?? process.env.npm_config_client_port ?? DEFAULT_CLIENT_PORT,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--dry-run') {
      options.dryRun = true
      continue
    }

    if (arg === '--api-host' || arg === '--api-key' || arg === '--workspace-id') {
      const value = argv[index + 1]
      if (value != null) {
        if (arg === '--api-host')
          options.apiHost = value
        else if (arg === '--api-key')
          options.apiKey = value
        else
          options.workspaceId = value
        index += 1
      }
      continue
    }

    if (arg === '--server-port' || arg === '--inspector-port') {
      const value = argv[index + 1]
      if (value != null) {
        options.serverPort = value
        index += 1
      }
      continue
    }

    if (arg === '--client-port') {
      const value = argv[index + 1]
      if (value != null) {
        options.clientPort = value
        index += 1
      }
      continue
    }

    if (arg.startsWith('--api-host=')) {
      options.apiHost = arg.slice('--api-host='.length)
      continue
    }

    if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice('--api-key='.length)
      continue
    }

    if (arg.startsWith('--workspace-id=')) {
      options.workspaceId = arg.slice('--workspace-id='.length)
      continue
    }

    if (arg.startsWith('--server-port=')) {
      options.serverPort = arg.slice('--server-port='.length)
      continue
    }

    if (arg.startsWith('--client-port=')) {
      options.clientPort = arg.slice('--client-port='.length)
      continue
    }

    if (arg.startsWith('--inspector-port=')) {
      options.serverPort = arg.slice('--inspector-port='.length)
    }
  }

  return options
}

function buildInspectorCommand(options) {
  const envArgs = [
    '-e', `ROXY_API_KEY=${options.apiKey}`,
    '-e', `ROXY_API_HOST=${options.apiHost}`,
  ]

  if (options.workspaceId != null && options.workspaceId !== '')
    envArgs.push('-e', `ROXY_WORKSPACE_ID=${options.workspaceId}`)

  return [
    process.execPath,
    [inspectorBinPath, ...envArgs, 'node', 'lib/cli.js'],
  ]
}

const options = parseArgs(process.argv.slice(2))
const [command, commandArgs] = buildInspectorCommand(options)

if (options.dryRun) {
  console.log(`SERVER_PORT=${options.serverPort} CLIENT_PORT=${options.clientPort} ${[command, ...commandArgs].join(' ')}`)
  process.exit(0)
}

const buildResult = spawnSync('npm', ['run', 'build'], {
  stdio: 'inherit',
  shell: true,
})

if (buildResult.status !== 0)
  process.exit(buildResult.status ?? 1)

const inspectorResult = spawnSync(command, commandArgs, {
  env: {
    ...process.env,
    SERVER_PORT: options.serverPort,
    CLIENT_PORT: options.clientPort,
  },
  stdio: 'inherit',
})

process.exit(inspectorResult.status ?? 1)
