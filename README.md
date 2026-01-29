# nuxt-agent-md

Generate `AGENTS.md` with Nuxt documentation for AI coding agents.

Inspired by [Vercel's blog post](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) showing that `AGENTS.md` with a documentation index achieves 100% success rate on agent evaluations.

## Usage

```bash
# Run directly with bunx
bunx nuxt-agent-md

# Or install globally
bun add -g nuxt-agent-md
nuxt-agent-md
```

## What it does

1. Detects your Nuxt version from `package.json`
2. Downloads the corresponding `@nuxt/docs` documentation
3. Generates a minified index of all documentation files
4. Creates/updates `AGENTS.md` with the index and key Nuxt patterns

## Options

```
-d, --docs-dir <path>      Directory to store docs (default: .nuxt-docs)
-o, --output <path>        Output AGENTS.md path (default: AGENTS.md)
-v, --nuxt-version <ver>   Nuxt docs version (auto-detected from package.json)
    --minify               Generate minified index (default: true)
    --no-minify            Generate full index instead of minified
    --dry-run              Show what would be done without making changes
-h, --help                 Show this help message
```

## Examples

```bash
# Auto-detect Nuxt version from package.json
nuxt-agent-md

# Use specific Nuxt version
nuxt-agent-md -v 4.0.0

# Generate full (non-minified) index
nuxt-agent-md --no-minify

# Custom output paths
nuxt-agent-md -d .docs -o CLAUDE.md

# Preview changes without writing
nuxt-agent-md --dry-run
```

## Output

The tool generates:

1. `.nuxt-docs/` - Directory containing raw markdown documentation
2. `AGENTS.md` - File with minified index pointing to the docs

The index format is pipe-delimited for minimal token usage:

```
CATEGORY|path/to/file.md|keyword1,keyword2,keyword3
```

## Why this approach?

From Vercel's research:

| Approach | Success Rate |
|----------|--------------|
| Baseline (no docs) | 53% |
| Skills | 53% |
| Skills with explicit instructions | 79% |
| **AGENTS.md with docs index** | **100%** |

The key insight: providing a compressed index in `AGENTS.md` that points to detailed documentation files gives agents immediate access to accurate API information without decision overhead.

## License

MIT
