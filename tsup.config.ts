import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['cjs', 'esm'],
  outDir: 'lib',
  outExtension({ format }) {
    return format === 'cjs' ? { js: '.cjs' } : { js: '.js' }
  },
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'node18',
  splitting: false,
  treeshake: true,
})
