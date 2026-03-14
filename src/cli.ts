#!/usr/bin/env node
import { parseArgs } from 'node:util'
import { generateAgentFiles } from './index'

const { values } = parseArgs({
  args: process.argv.slice(2),
  options: {
    output: {
      type: 'string',
      short: 'o',
      default: 'AGENTS.md',
    },
    help: {
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
nuxt-agent-md - Generate AGENTS.md and CLAUDE.md for AI coding agents

Usage:
  nuxt-agent-md [options]

Options:
  -o, --output <path>   Output AGENTS.md path (default: AGENTS.md)
  -h, --help            Show this help message

The tool generates:
  - AGENTS.md with instructions pointing to node_modules/@nuxt/docs/
  - CLAUDE.md that references @AGENTS.md
`)
  process.exit(0)
}

try {
  generateAgentFiles({
    outputPath: values.output,
  })
  console.log('Generated AGENTS.md and CLAUDE.md')
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : error}`)
  process.exit(1)
}
