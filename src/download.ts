import { existsSync, mkdirSync, rmSync, renameSync } from 'node:fs'
import { join } from 'node:path'
import * as tar from 'tar'

export async function downloadDocs(version: string, docsDir: string): Promise<void> {
  const cwd = process.cwd()
  const targetDir = join(cwd, docsDir)
  const tempDir = join(cwd, '.nuxt-docs-temp')

  // Clean up existing dirs
  if (existsSync(targetDir)) {
    rmSync(targetDir, { recursive: true })
  }
  if (existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true })
  }

  mkdirSync(tempDir, { recursive: true })

  try {
    // Download the package tarball using Bun shell
    const packResult = Bun.spawnSync(['npm', 'pack', `@nuxt/docs@${version}`, '--pack-destination', tempDir], {
      cwd: tempDir,
      stdout: 'pipe',
      stderr: 'pipe',
    })

    if (packResult.exitCode !== 0) {
      throw new Error(`npm pack failed: ${packResult.stderr.toString()}`)
    }

    const tarballName = packResult.stdout.toString().trim().split('\n').pop()
    if (!tarballName) {
      throw new Error('Could not determine tarball name')
    }

    const tarballPath = join(tempDir, tarballName)

    // Extract the tarball
    await tar.x({
      file: tarballPath,
      cwd: tempDir,
    })

    // Move the package contents to target dir
    const extractedDir = join(tempDir, 'package')
    renameSync(extractedDir, targetDir)

    // Clean up temp dir
    rmSync(tempDir, { recursive: true })
  } catch (error) {
    // Clean up on error
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true })
    }
    throw error instanceof Error
      ? new Error(`Failed to download @nuxt/docs@${version}: ${error.message}`)
      : error
  }
}
