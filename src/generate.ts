import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import type { DocEntry, IndexResult } from './types'

export async function generateIndex(docsDir: string): Promise<IndexResult> {
  const entries: DocEntry[] = []

  walkDir(docsDir, docsDir, entries)

  return {
    entries,
    minified: generateMinifiedIndex(entries, docsDir),
    full: generateFullIndex(entries, docsDir),
  }
}

const EXCLUDED_DIRS = ['bridge', 'community']

function walkDir(dir: string, baseDir: string, entries: DocEntry[]): void {
  let items: string[]
  try {
    items = readdirSync(dir)
  } catch {
    return
  }

  for (const item of items) {
    const fullPath = join(dir, item)
    let stat
    try {
      stat = statSync(fullPath)
    } catch {
      continue
    }

    if (stat.isDirectory()) {
      // Skip hidden directories, node_modules, and excluded dirs
      const dirName = item.replace(/^\d+\./, '') // Remove number prefix like "6.bridge"
      if (!item.startsWith('.') && item !== 'node_modules' && !EXCLUDED_DIRS.includes(dirName)) {
        walkDir(fullPath, baseDir, entries)
      }
    } else if (item.endsWith('.md') && !item.startsWith('.')) {
      const relativePath = relative(baseDir, fullPath)
      const content = readFileSync(fullPath, 'utf-8')

      // Extract category from path (e.g., "1.getting-started" -> "GETTING_STARTED")
      const pathParts = relativePath.split('/')
      const category = pathParts[0]
        .replace(/^\d+\./, '')
        .toUpperCase()
        .replace(/-/g, '_')

      entries.push({
        path: relativePath,
        title: extractTitle(content),
        keywords: extractKeywords(content, relativePath),
        category,
      })
    }
  }
}

function extractTitle(content: string): string {
  // Look for YAML frontmatter title first
  const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (frontmatterMatch) {
    const titleMatch = frontmatterMatch[1].match(/^title:\s*['"]?([^'"\n]+)['"]?/m)
    if (titleMatch) {
      return titleMatch[1].trim()
    }
  }

  // Fall back to first h1
  const h1Match = content.match(/^#\s+(.+)$/m)
  return h1Match ? h1Match[1].trim() : ''
}

function extractKeywords(content: string, path: string): string[] {
  const keywords = new Set<string>()

  // Extract from path
  const pathParts = path.replace(/\.md$/, '').split('/')
  for (const part of pathParts) {
    // Remove number prefixes like "1.getting-started"
    const clean = part.replace(/^\d+\./, '').replace(/-/g, ' ')
    if (clean.length > 2) {
      keywords.add(clean)
    }
  }

  // Extract code identifiers (useFetch, definePageMeta, etc.)
  const codeMatches = content.match(/`([a-zA-Z$][a-zA-Z0-9$]*(?:\(\))?)`/g) || []
  for (const match of codeMatches) {
    const clean = match.replace(/`/g, '').replace(/\(\)$/, '')
    if (clean.length > 2 && !['true', 'false', 'null', 'undefined', 'string', 'number', 'boolean', 'object', 'array'].includes(clean.toLowerCase())) {
      keywords.add(clean)
    }
  }

  // Extract important Nuxt-specific terms
  const nuxtTerms = [
    'useFetch', 'useAsyncData', 'useState', 'useCookie', 'useRuntimeConfig',
    'useRoute', 'useRouter', 'useHead', 'useSeoMeta', 'useNuxtApp',
    'definePageMeta', 'defineNuxtConfig', 'defineEventHandler', 'defineNuxtPlugin',
    'defineNuxtRouteMiddleware', 'defineNuxtModule', 'NuxtLink', 'NuxtPage',
    'NuxtLayout', 'ClientOnly', 'navigateTo', 'abortNavigation', 'createError',
    '$fetch', 'nitro', 'h3', 'server/api', 'server/middleware',
  ]

  for (const term of nuxtTerms) {
    if (content.includes(term)) {
      keywords.add(term)
    }
  }

  return [...keywords].slice(0, 15)
}

function generateMinifiedIndex(entries: DocEntry[], docsDir: string): string {
  // Sort entries by category and path for consistent output
  const sorted = [...entries].sort((a, b) => {
    if (a.category !== b.category) return a.category.localeCompare(b.category)
    return a.path.localeCompare(b.path)
  })

  const lines: string[] = []

  for (const entry of sorted) {
    const keywords = entry.keywords.slice(0, 5).join(',')
    lines.push(`${entry.category}|${docsDir}/${entry.path}|${keywords}`)
  }

  return lines.join('\n')
}

function generateFullIndex(entries: DocEntry[], docsDir: string): string {
  // Group by category
  const categories = new Map<string, DocEntry[]>()

  for (const entry of entries) {
    if (!categories.has(entry.category)) {
      categories.set(entry.category, [])
    }
    categories.get(entry.category)!.push(entry)
  }

  let output = ''

  // Sort categories
  const sortedCategories = [...categories.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  for (const [category, files] of sortedCategories) {
    output += `\n### ${category.toLowerCase().replace(/_/g, ' ')}\n`
    // Sort files within category
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))
    for (const file of sortedFiles) {
      const title = file.title || file.path.split('/').pop()?.replace(/\.md$/, '') || file.path
      output += `- [${title}](${docsDir}/${file.path})`
      if (file.keywords.length > 0) {
        output += ` - \`${file.keywords.slice(0, 5).join('`, `')}\``
      }
      output += '\n'
    }
  }

  return output
}
