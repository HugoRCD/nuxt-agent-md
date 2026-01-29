export interface Options {
  docsDir: string
  outputPath: string
  nuxtVersion?: string
  minify: boolean
  dryRun: boolean
}

export interface DocEntry {
  path: string
  title: string
  keywords: string[]
  category: string
}

export interface IndexResult {
  entries: DocEntry[]
  minified: string
  full: string
}
