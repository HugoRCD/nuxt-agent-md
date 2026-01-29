import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, renameSync } from 'node:fs'
import { join } from 'node:path'

export async function downloadDocs(version: string, targetDir: string): Promise<void> {
  const tempDir = '.nuxt-docs-temp'

  if (existsSync(targetDir)) rmSync(targetDir, { recursive: true })
  if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  mkdirSync(tempDir, { recursive: true })

  try {
    const pack = spawnSync('npm', ['pack', `@nuxt/docs@${version}`, '--pack-destination', tempDir], {
      encoding: 'utf-8',
    })
    if (pack.status !== 0) throw new Error(pack.stderr)

    const tarball = pack.stdout.trim().split('\n').pop()
    if (!tarball) throw new Error('No tarball')

    const extract = spawnSync('tar', ['-xf', join(tempDir, tarball), '-C', tempDir], {
      encoding: 'utf-8',
    })
    if (extract.status !== 0) throw new Error(extract.stderr)

    renameSync(join(tempDir, 'package'), targetDir)
  } finally {
    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true })
  }
}
