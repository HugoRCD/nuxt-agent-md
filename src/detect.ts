import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export async function detectNuxtVersion(cwd: string = process.cwd()): Promise<string> {
  const packageJsonPath = join(cwd, 'package.json')

  if (!existsSync(packageJsonPath)) {
    throw new Error('No package.json found. Run this command in a Nuxt project root.')
  }

  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

  const nuxtVersion = deps.nuxt

  if (!nuxtVersion) {
    throw new Error('Nuxt is not installed in this project. Add nuxt to your dependencies.')
  }

  // Clean version string (remove ^, ~, etc.)
  const cleanVersion = nuxtVersion.replace(/[\^~>=<]/g, '').split(' ')[0]

  // If it's "latest" or a tag, default to 4.x
  if (cleanVersion === 'latest' || !cleanVersion.match(/^\d/)) {
    return '4.0.0'
  }

  return cleanVersion
}

export function mapToDocsVersion(nuxtVersion: string): string {
  const major = parseInt(nuxtVersion.split('.')[0])

  if (major >= 4) {
    return '4.3.0' // Latest Nuxt 4 docs
  } else if (major === 3) {
    return '3.21.0' // Latest Nuxt 3 docs
  }

  throw new Error(`Unsupported Nuxt version: ${nuxtVersion}. Only Nuxt 3.x and 4.x are supported.`)
}
