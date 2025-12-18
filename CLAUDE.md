# CLAUDE.md — Meme Generator MCP

## Project Overview

This is an MCP (Model Context Protocol) server that generates memes from text content. The core idea: user provides content (news, text, ideas) → Claude summarizes/extracts the funny part → MCP generates a meme using the appropriate template.

**Philosophy:** Memes are fast food for the brain. Template-based memes work because the format carries meaning — viewers instantly recognize the pattern. We're NOT doing AI image generation; we're matching content to classic meme templates.

## Current Release Target

**Release 1: Walking Skeleton**
- End-to-end flow works
- 5 hardcoded templates (drake, distracted-boyfriend, change-my-mind, pigeon, pikachu)
- Single MCP tool: `generate_meme`
- Returns memegen.link URL

## Tech Stack

- **Language:** TypeScript
- **Runtime:** Node.js (last LTS)
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **Meme API:** memegen.link (no auth required, URL-based)
- **Package Manager:** pnpm
- **Build:** tsc (keep it simple)
- nix shell

## Project Structure

```
meme-mcp/
├── CLAUDE.md           # This file
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts        # MCP server entry point
│   ├── tools/
│   │   └── generate-meme.ts    # Tool implementation
│   ├── templates/
│   │   └── catalog.ts  # Template definitions with metadata
│   └── utils/
│       └── memegen.ts  # URL builder for memegen.link API
└── README.md           # User-facing docs
```

## Key Implementation Details

### memegen.link URL Format

```
https://api.memegen.link/images/{template}/{top_text}/{bottom_text}.png
```

- Spaces → underscores (`_`) or dashes (`-`)
- Special chars need encoding:
  - `?` → `~q`
  - `%` → `~p`
  - `#` → `~h`
  - `/` → `~s`
  - `\` → `~b`
  - `_` (literal) → `__`
  - `-` (literal) → `--`
  - `""` (empty) → `_`

### Template Catalog Structure

Each template should have:
```typescript
interface MemeTemplate {
  id: string;              // memegen.link template ID
  name: string;            // Human-readable name
  description: string;     // When to use this template (for LLM guidance)
  example: string;         // Example usage
  slots: number;           // Number of text slots (usually 2)
}
```

### Release 1 Templates

| ID | Name | Use When |
|----|------|----------|
| `drake` | Drake Hotline Bling | Rejecting one thing, preferring another |
| `db` | Distracted Boyfriend | Being tempted by something new while ignoring current thing |
| `cmm` | Change My Mind | Stating a hot take or controversial opinion |
| `pigeon` | Is This a Pigeon? | Completely misidentifying something |
| `pikachu` | Surprised Pikachu | When an obvious consequence happens and someone acts shocked |

### MCP Tool Definition

The tool should give Claude enough context to pick the right template:

```typescript
{
  name: "generate_meme",
  description: `Generate a meme image. Choose the template that best matches the humor:
    - drake: Rejecting A in favor of B (top=rejected thing, bottom=preferred thing)
    - db: Being distracted by something new (top=current thing, bottom=tempting thing)  
    - cmm: Hot take or controversial opinion (top=the opinion, bottom=empty or "change my mind")
    - pigeon: Misidentifying something (top=what it actually is, bottom=wrong identification)
    - pikachu: Obvious consequence (top=the action, bottom=the obvious result)`,
  inputSchema: {
    type: "object",
    properties: {
      template: {
        type: "string",
        enum: ["drake", "db", "cmm", "pigeon", "pikachu"]
      },
      top_text: {
        type: "string",
        description: "Top/first text panel"
      },
      bottom_text: {
        type: "string",
        description: "Bottom/second text panel"
      }
    },
    required: ["template", "top_text", "bottom_text"]
  }
}
```

## Coding Conventions

1. **Keep it simple** — This is a small project. No over-engineering.
2. **Type everything** — Full TypeScript, no `any` unless absolutely necessary.
3. **Error handling** — Graceful failures with helpful messages. If memegen.link is down, say so clearly.
4. **No external deps beyond MCP SDK** — URL building is just string manipulation.
5. **Comments for "why"** — Don't comment obvious code, do comment non-obvious decisions.

## Testing Approach

For Release 1, manual testing is fine:
1. Run MCP inspector: `npx @modelcontextprotocol/inspector`
2. Test each template with sample inputs
3. Verify URLs resolve to valid images

Future releases can add:
- Unit tests for URL encoding
- Integration tests against memegen.link
- Snapshot tests for tool schemas

## Running Locally

```bash
# Install dependencies
npm install

# Build
npm run build

# Run with MCP inspector (for testing)
npx @modelcontextprotocol/inspector node dist/index.js

# Or add to Claude Desktop config (claude_desktop_config.json):
{
  "mcpServers": {
    "meme-generator": {
      "command": "node",
      "args": ["/absolute/path/to/meme-mcp/dist/index.js"]
    }
  }
}
```

## API Reference

### memegen.link Endpoints

- Templates list: `GET https://api.memegen.link/templates/`
- Template info: `GET https://api.memegen.link/templates/{id}`
- Generate image: `GET https://api.memegen.link/images/{id}/{top}/{bottom}.png`
- Preview (smaller): `GET https://api.memegen.link/images/preview.jpg?template={id}&lines[]={top}&lines[]={bottom}`

No authentication needed. Rate limits are generous for normal use.

## Out of Scope (Don't Build Yet)

- Multiple output formats (just png for now)
- Custom backgrounds
- Template search/discovery tool
- Multi-panel memes (expanding brain, etc.)
- Image upload/custom templates
- Caching layer

## Common Pitfalls

1. **Text encoding** — The `~q`, `~s` etc. encoding is memegen-specific, not standard URL encoding. Handle both.
2. **Empty text** — Use `_` for empty slots, not empty string.
3. **Long text** — memegen.link handles wrapping, but very long text looks bad. Consider truncating or warning.
4. **Template ID case** — IDs are lowercase.

## Definition of Done (Release 1)

- [ ] MCP server starts without errors
- [ ] `generate_meme` tool appears in tool list
- [ ] All 5 templates produce valid image URLs
- [ ] Special characters in text are handled correctly
- [ ] Works in Claude Desktop (if configured)
- [ ] README has basic usage instructions

## Future Releases (Context Only)

**Release 2:** Smart template selection — expand to 15-20 templates, richer descriptions for better LLM matching.

**Release 3:** Rich inputs — accept URLs, extract content, auto-summarize before meme generation.

**Release 4:** User control — let users request specific templates, get multiple options, preview before committing.

**Release 5:** Self-hosted — run own memegen instance, add custom templates.

---

## Quick Start for Claude Code

1. Initialize the project: `npm init -y`
2. Install deps: `npm install @modelcontextprotocol/sdk typescript @types/node`
3. Create tsconfig.json with module: "NodeNext", target: "ES2022"
4. Build src/index.ts as MCP server with stdio transport
5. Implement generate_meme tool
6. Test with MCP inspector

Start with the minimal working version. Get a meme URL back first, then refine.
