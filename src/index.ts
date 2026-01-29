import { detectNuxtVersion, mapToDocsVersion } from './detect'
import { downloadDocs } from './download'
import { generateIndex } from './generate'
import { injectAgentsMd } from './inject'
import type { Options } from './types'

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

  // 1. Detect or use provided Nuxt version
  const version = nuxtVersion || (await detectNuxtVersion())
  console.log(`📦 Nuxt version: ${version}`)

  // 2. Map to docs package version
  const docsVersion = mapToDocsVersion(version)
  console.log(`📚 Docs package version: ${docsVersion}`)

  if (dryRun) {
    console.log('\n🔍 Dry run mode - no changes will be made\n')
    console.log(`Would download @nuxt/docs@${docsVersion} to ${docsDir}`)
    console.log(`Would generate index and inject into ${outputPath}`)
    return
  }

  // 3. Download docs from npm
  console.log(`\n📥 Downloading documentation...`)
  await downloadDocs(docsVersion, docsDir)
  console.log(`✓ Documentation downloaded to ${docsDir}`)

  // 4. Generate index
  console.log(`\n📝 Generating documentation index...`)
  const index = await generateIndex(docsDir)
  console.log(`✓ Indexed ${index.entries.length} documentation files`)

  // 5. Inject into AGENTS.md
  console.log(`\n💉 Injecting into ${outputPath}...`)
  await injectAgentsMd(outputPath, index, version, docsDir, minify)

  console.log(`\n✅ Successfully generated ${outputPath} with Nuxt ${version} docs!`)
  console.log(`\n💡 Tip: Add ${docsDir} to your .gitignore if you don't want to version the docs.\n`)
}
