# nuxt-agent-md

Generate `AGENTS.md` with Nuxt documentation for AI coding agents (Cursor, Copilot, Claude, etc.).

Gives your AI assistant instant access to accurate Nuxt API references, reducing hallucinations and improving code quality.

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
2. Downloads the corresponding `@nuxt/docs` documentation (~1.5 MB)
3. Generates a minified index (~20 KB) of all documentation files
4. Creates/updates `AGENTS.md` with the index

The index format is pipe-delimited for minimal token usage:

```
CATEGORY|path/to/file.md|keyword1,keyword2,keyword3
```

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
```

## Output

The tool generates:

1. `.nuxt-docs/` - Directory containing markdown documentation (auto-added to `.gitignore`)
2. `AGENTS.md` - File with minified index pointing to the docs

## Why?

AI coding agents work better when they have access to accurate documentation rather than relying on training data that may be outdated. By providing a compact index in `AGENTS.md`, the agent can quickly find and read the relevant documentation files for any Nuxt API.

## Credits

Inspired by [Vercel's research](https://vercel.com/blog/agents-md-outperforms-skills-in-our-agent-evals) showing that documentation indexes in `AGENTS.md` significantly improve agent accuracy.

## License

MIT
