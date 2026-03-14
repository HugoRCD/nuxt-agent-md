# nuxt-agent-md

Generate `AGENTS.md` and `CLAUDE.md` for AI coding agents (Cursor, Copilot, Claude Code, etc.).

Points your AI assistant to `node_modules/@nuxt/docs/` for accurate Nuxt API references.

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
2. Installs `@nuxt/docs` if not already installed
3. Generates `AGENTS.md` pointing to `node_modules/@nuxt/docs/`
4. Generates `CLAUDE.md` that references `@AGENTS.md`

## Output

```
AGENTS.md   # Instructions pointing to node_modules/@nuxt/docs/
CLAUDE.md   # Contains @AGENTS.md for Claude Code compatibility
```

**AGENTS.md:**

```markdown
<!-- BEGIN:nuxt-agent-rules -->
# This is NOT the Nuxt.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/@nuxt/docs/` before writing any code.

This project uses **Nuxt 4** (v4.0.0).
<!-- END:nuxt-agent-rules -->
```

**CLAUDE.md:**

```
@AGENTS.md
```

## Options

```
-o, --output <path>   Output AGENTS.md path (default: AGENTS.md)
-h, --help            Show this help message
```

## Why?

AI coding agents work better when they have access to accurate documentation rather than relying on training data that may be outdated. By pointing to `node_modules/@nuxt/docs/`, the agent can read the exact documentation for your installed Nuxt version.

Inspired by [Vercel's Next.js approach](https://github.com/vercel/next.js/blob/main/packages/create-next-app/helpers/generate-agent-files.ts).

## License

MIT
