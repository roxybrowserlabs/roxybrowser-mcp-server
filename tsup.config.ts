import { defineConfig } from 'tsup'
import { readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const sourceRoots = [
  'src/api',
  'src/sdk',
  'src/domains',
  'src/mcp',
  'src/cli',
]

function collectEntries(dir: string): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const name of readdirSync(dir)) {
    const fullPath = join(dir, name)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      Object.assign(entries, collectEntries(fullPath))
      continue
    }
    if (!name.endsWith('.ts') || name.endsWith('.test.ts'))
      continue

    const entryName = relative('src', fullPath).replace(/\.ts$/, '')
    entries[entryName] = fullPath
  }
  return entries
}

const entries = {
  index: 'src/index.ts',
  cli: 'src/cli.ts',
  ...Object.assign({}, ...sourceRoots.map(collectEntries)),
}

export default defineConfig({
  entry: entries,
  format: ['cjs', 'esm'],
  outDir: 'lib',
  outExtension({ format }) {
    return format === 'cjs' ? { js: '.cjs' } : { js: '.js' }
  },
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  bundle: false,
  splitting: false,
  treeshake: true,
})
