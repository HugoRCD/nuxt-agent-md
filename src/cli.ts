#!/usr/bin/env bun
import { parseArgs } from 'node:util'
import { generateAgentsMd } from './index'

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    'docs-dir': {
      type: 'string',
      short: 'd',
      default: '.nuxt-docs',
    },
    'output': {
      type: 'string',
      short: 'o',
      default: 'AGENTS.md',
    },
    'nuxt-version': {
      type: 'string',
      short: 'v',
    },
    'minify': {
      type: 'boolean',
      default: true,
    },
    'no-minify': {
      type: 'boolean',
      default: false,
    },
    'dry-run': {
      type: 'boolean',
      default: false,
    },
    'help': {
      type: 'boolean',
      short: 'h',
      default: false,
    },
  },
  strict: true,
  allowPositionals: false,
})

if (values.help) {
  console.log(`
nuxt-agent-md - Generate AGENTS.md with Nuxt documentation for AI coding agents

Usage:
  nuxt-agent-md [options]

Options:
  -d, --docs-dir <path>      Directory to store docs (default: .nuxt-docs)
  -o, --output <path>        Output AGENTS.md path (default: AGENTS.md)
  -v, --nuxt-version <ver>   Nuxt docs version (auto-detected from package.json)
      --minify               Generate minified index (default: true)
      --no-minify            Generate full index instead of minified
      --dry-run              Show what would be done without making changes
  -h, --help                 Show this help message

Examples:
  nuxt-agent-md                           # Auto-detect Nuxt version
  nuxt-agent-md -v 4.0.0                  # Use specific version
  nuxt-agent-md --no-minify               # Generate full index
  nuxt-agent-md -d .docs -o CLAUDE.md     # Custom paths
`)
  process.exit(0)
}

try {
  await generateAgentsMd({
    docsDir: values['docs-dir'],
    outputPath: values.output,
    nuxtVersion: values['nuxt-version'],
    minify: values['no-minify'] ? false : values.minify,
    dryRun: values['dry-run'],
  })
} catch (error) {
  console.error(`\n❌ Error: ${error instanceof Error ? error.message : error}\n`)
  process.exit(1)
}
