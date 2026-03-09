import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs'
import { detectNuxtVersion, mapToDocsVersion } from './detect'
import { downloadDocs } from './download'
import { generateIndex } from './generate'
import { injectAgentsMd } from './inject'
import type { Options } from './types'

function updateGitignore(entry: string): boolean {
  const path = '.gitignore'
  if (!existsSync(path)) {
    writeFileSync(path, entry + '\n')
    return true
  }
  const content = readFileSync(path, 'utf-8')
  if (content.split('\n').some(l => l.trim() === entry)) return false
  appendFileSync(path, (content.endsWith('\n') ? '' : '\n') + entry + '\n')
  return true
}

export { detectNuxtVersion, mapToDocsVersion } from './detect'
export { downloadDocs } from './download'
export { generateIndex } from './generate'
export { injectAgentsMd } from './inject'
export type * from './types'

export async function generateAgentsMd(options: Partial<Options> = {}): Promise<void> {
  const {
    docsDir = '.nuxt-docs',
    outputPath = 'AGENTS.md',
    nuxtVersion,
    minify = true,
    dryRun = false,
  } = options

  const version = nuxtVersion || (await detectNuxtVersion())
  const docsVersion = mapToDocsVersion(version)

  if (dryRun) {
    console.log(`[dry-run] Would download @nuxt/docs@${docsVersion} to ${docsDir}`)
    console.log(`[dry-run] Would generate index and inject into ${outputPath}`)
    return
  }

  console.log(`Downloading @nuxt/docs@${docsVersion}...`)
  await downloadDocs(docsVersion, docsDir)

  const index = await generateIndex(docsDir)
  console.log(`Indexed ${index.entries.length} files`)

  await injectAgentsMd(outputPath, index, version, docsDir, minify)

  if (updateGitignore(docsDir)) {
    console.log(`Added ${docsDir} to .gitignore`)
  }

  const claudeMdPath = outputPath.replace(/[^/]+$/, 'CLAUDE.md')
  console.log(`Generated ${outputPath} and ${claudeMdPath}`)
}
