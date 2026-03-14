import { execSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const START_MARKER = '<!-- BEGIN:nuxt-agent-rules -->'
const END_MARKER = '<!-- END:nuxt-agent-rules -->'

export interface Options {
  root?: string
  outputPath?: string
}

export function generateAgentFiles(options: Options = {}): void {
  const root = options.root || process.cwd()
  const outputPath = options.outputPath || join(root, 'AGENTS.md')

  const nuxtVersion = detectNuxtVersion(root)
  const majorVersion = nuxtVersion.split('.')[0]

  ensureNuxtDocsInstalled(root, majorVersion)

  const agentsMdContent = `${START_MARKER}
# This is NOT the Nuxt.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in \`node_modules/@nuxt/docs/\` before writing any code.

This project uses **Nuxt ${majorVersion}** (v${nuxtVersion}).
${END_MARKER}
`

  const claudeMdContent = `@AGENTS.md
`

  let content = ''
  if (existsSync(outputPath)) {
    content = readFileSync(outputPath, 'utf-8')

    const oldStartMarker = '<!-- NUXT_DOCS_START -->'
    const oldEndMarker = '<!-- NUXT_DOCS_END -->'

    if (content.includes(START_MARKER) && content.includes(END_MARKER)) {
      const regex = new RegExp(`${escapeRegex(START_MARKER)}[\\s\\S]*${escapeRegex(END_MARKER)}`, 'm')
      content = content.replace(regex, agentsMdContent.trim())
    } else if (content.includes(oldStartMarker) && content.includes(oldEndMarker)) {
      const regex = new RegExp(`${escapeRegex(oldStartMarker)}[\\s\\S]*${escapeRegex(oldEndMarker)}`, 'm')
      content = content.replace(regex, agentsMdContent.trim())
    } else {
      content = content.trimEnd() + '\n\n' + agentsMdContent
    }
  } else {
    content = agentsMdContent
  }

  const dir = dirname(outputPath)
  const agentsMdPath = outputPath
  const claudeMdPath = join(dir, 'CLAUDE.md')

  writeFileSync(agentsMdPath, content, 'utf-8')
  writeFileSync(claudeMdPath, claudeMdContent, 'utf-8')
}

function detectNuxtVersion(root: string): string {
  const packageJsonPath = join(root, 'package.json')

  if (!existsSync(packageJsonPath)) {
    return '4.0.0'
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
  const nuxtVersion = deps.nuxt

  if (!nuxtVersion) {
    return '4.0.0'
  }

  const cleanVersion = nuxtVersion.replace(/[\^~>=<]/g, '').split(' ')[0]

  if (cleanVersion === 'latest' || !cleanVersion.match(/^\d/)) {
    return '4.0.0'
  }

  return cleanVersion
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureNuxtDocsInstalled(root: string, majorVersion: string): void {
  const docsPath = join(root, 'node_modules', '@nuxt', 'docs')

  if (existsSync(docsPath)) {
    return
  }

  const packageManager = detectPackageManager(root)
  const docsVersion = majorVersion === '3' ? '3' : '4'

  console.log(`Installing @nuxt/docs@${docsVersion}...`)

  const commands: Record<string, string> = {
    bun: `bun add -D @nuxt/docs@${docsVersion}`,
    pnpm: `pnpm add -D @nuxt/docs@${docsVersion}`,
    yarn: `yarn add -D @nuxt/docs@${docsVersion}`,
    npm: `npm install -D @nuxt/docs@${docsVersion}`,
  }

  execSync(commands[packageManager], { cwd: root, stdio: 'inherit' })
}

function detectPackageManager(root: string): string {
  if (existsSync(join(root, 'bun.lockb')) || existsSync(join(root, 'bun.lock'))) {
    return 'bun'
  }
  if (existsSync(join(root, 'pnpm-lock.yaml'))) {
    return 'pnpm'
  }
  if (existsSync(join(root, 'yarn.lock'))) {
    return 'yarn'
  }
  return 'npm'
}
