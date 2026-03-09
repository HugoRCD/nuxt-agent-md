import { dirname, join } from 'node:path'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { IndexResult } from './types'

const START_MARKER = '<!-- BEGIN:nuxt-agent-rules -->'
const END_MARKER = '<!-- END:nuxt-agent-rules -->'

export async function injectAgentsMd(
  outputPath: string,
  index: IndexResult,
  nuxtVersion: string,
  docsDir: string,
  minify: boolean,
): Promise<void> {
  let content = ''

  if (existsSync(outputPath)) {
    content = readFileSync(outputPath, 'utf-8')
  }

  const nuxtSection = generateNuxtSection(index, nuxtVersion, docsDir, minify)

  // Check if markers exist (support both old and new marker styles)
  const oldStartMarker = '<!-- NUXT_DOCS_START -->'
  const oldEndMarker = '<!-- NUXT_DOCS_END -->'

  if (content.includes(START_MARKER) && content.includes(END_MARKER)) {
    const regex = new RegExp(`${escapeRegex(START_MARKER)}[\\s\\S]*${escapeRegex(END_MARKER)}`, 'm')
    content = content.replace(regex, nuxtSection)
  } else if (content.includes(oldStartMarker) && content.includes(oldEndMarker)) {
    const regex = new RegExp(`${escapeRegex(oldStartMarker)}[\\s\\S]*${escapeRegex(oldEndMarker)}`, 'm')
    content = content.replace(regex, nuxtSection)
  } else if (content.length > 0) {
    content = content.trimEnd() + '\n\n' + nuxtSection
  } else {
    content = generateFullAgentsMd(nuxtSection)
  }

  writeFileSync(outputPath, content)

  generateClaudeMd(outputPath)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function generateClaudeMd(agentsMdPath: string): void {
  const dir = dirname(agentsMdPath)
  const claudeMdPath = join(dir, 'CLAUDE.md')
  const agentsMdFilename = agentsMdPath.split('/').pop() || 'AGENTS.md'

  const claudeMdContent = `@${agentsMdFilename}
`

  writeFileSync(claudeMdPath, claudeMdContent, 'utf-8')
}

function generateNuxtSection(
  index: IndexResult,
  nuxtVersion: string,
  docsDir: string,
  minify: boolean,
): string {
  const majorVersion = nuxtVersion.split('.')[0]

  return `${START_MARKER}
## Nuxt Documentation

This project uses **Nuxt ${majorVersion}** (v${nuxtVersion}).

When working with Nuxt APIs, ALWAYS read the referenced documentation files before making changes.

### Quick Reference Index

\`\`\`
${minify ? index.minified : index.full}
\`\`\`

### Key Nuxt ${majorVersion} Patterns

#### Data Fetching
- Use \`useFetch\` for component-level data fetching (auto-deduped, SSR-safe)
- Use \`useAsyncData\` when you need more control over the key/handler
- Use \`$fetch\` in event handlers and server routes (NOT in setup for SSR)
- Always handle \`pending\` and \`error\` states

#### Server Routes
- Files in \`server/api/\` become API endpoints
- Use \`defineEventHandler\` for all handlers
- Access body with \`readBody(event)\`
- Access query with \`getQuery(event)\`
- Access params with \`event.context.params\`

#### State Management
- Use \`useState\` for SSR-friendly reactive state
- Use \`useCookie\` for cookie-based state
- Use \`useRuntimeConfig\` for environment variables

#### Routing & Navigation
- Use \`definePageMeta\` for page-level config
- Use \`navigateTo\` for programmatic navigation
- Use \`useRoute\` and \`useRouter\` for route info

#### Configuration
- \`nuxt.config.ts\` for build-time config
- \`runtimeConfig\` for environment variables (private/public)
- \`app.config.ts\` for public runtime config

${END_MARKER}`
}

function generateFullAgentsMd(nuxtSection: string): string {
  return `# AGENTS.md

This file provides documentation references for AI coding agents.

${nuxtSection}
`
}
