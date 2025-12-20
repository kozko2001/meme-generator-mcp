# Meme Generator MCP

A Model Context Protocol (MCP) server that generates memes from text content using [memegen.link](https://memegen.link/).

## What is this?

This MCP server lets Claude (or any MCP client) generate memes by choosing the right template and adding text. Instead of AI image generation, it uses classic meme templates that carry cultural meaning—the format is part of the joke.

## Features

- **200+ Meme Templates**: All templates from memegen.link
- **Smart Template Selection**: Claude picks the best template for your humor
- **Template Discovery**: Browse by category, search by keyword, get detailed info
- **NLP-Powered Analysis**: Uses compromise library for grammatical analysis
- **Smart Content Processing**: Fetch URLs, extract quotes, auto-suggest templates
- **Batch Generation**: Create multiple memes in parallel
- **URL-based Generation**: Uses memegen.link API (no authentication needed)
- **Type-safe**: Full TypeScript implementation with validation
- **Low Cost**: Uses cheerio (HTML parsing) and compromise (NLP), no external AI APIs

## Installation

### Prerequisites

- Node.js 24+ (or use the included Nix flake)
- pnpm (or npm)
- Docker (optional, for containerized deployment)

### Using Nix

```bash
# Enter development environment
nix develop

# Install dependencies
pnpm install

# Build
pnpm build
```

### Using npm/pnpm

```bash
# Install dependencies
pnpm install

# Build
pnpm build
```

## Usage

### With MCP Inspector (Testing)

```bash
# Run the MCP inspector
pnpm inspector
```

This opens a web interface where you can test the `generate_meme` tool.

### With Claude Code

Add the MCP server using the Claude Code CLI:

```bash
# Add as a project server (creates .mcp.json in project root)
claude mcp add --transport stdio meme-generator -- node /absolute/path/to/meme-generator-mcp/dist/index.js

# OR add as a user server (global ~/.claude.json)
claude mcp add --transport stdio meme-generator -- node /absolute/path/to/meme-generator-mcp/dist/index.js --user
```

**Important:** The `--` separator is required before the node command.

**Verify the configuration:**
```bash
# List all configured MCP servers
claude mcp list

# Check server status (run inside Claude Code)
/mcp
```

**Using with Nix:**
```bash
claude mcp add --transport stdio meme-generator -- nix develop /absolute/path/to/meme-generator-mcp# --command node dist/index.js
```

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "meme-generator": {
      "command": "node",
      "args": ["/absolute/path/to/meme-generator-mcp/dist/index.js"]
    }
  }
}
```

**Config file locations:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## Available Tools

This MCP server provides **8 tools** for meme generation:

### 1. Template Discovery Tools

**`browse_meme_categories`** - Explore 9 semantic categories
- Returns: List of categories (reactions, comparisons, social, etc.) with template counts

**`search_templates_by_category`** - Get all templates in a category
- Input: `category` (string)
- Returns: Templates with usage descriptions and metadata

**`search_templates_by_keyword`** - Search by concept or keyword
- Input: `query` (string), `limit` (optional number)
- Returns: Ranked template matches
- Example: "surprised" → astronaut, scc, whatyear

**`get_template_details`** - Deep dive on specific templates
- Input: `template_ids` (array of strings)
- Returns: Full metadata, similar templates, popularity

### 2. Smart Content Processing Tools

**`fetch_url_content`** - Download and extract text from URLs
- Input: `url` (string)
- Returns: Extracted plain text, word count, metadata
- Zero cost: Uses Node.js built-in fetch + regex

**`suggest_templates`** - Auto-recommend templates for content
- Input: `content` (string), `limit` (optional number)
- Returns: Template suggestions with confidence scores and linguistic reasoning
- NLP-powered: Uses compromise for grammatical analysis (verb tenses, sentence structure)
- Detects: Past/present tense contrasts, questions, negations, comparisons

**`extract_key_quotes`** - Pull meme-worthy phrases from text
- Input: `content` (string), `maxLength` (optional), `limit` (optional)
- Returns: Scored quotes optimized for meme readability
- NLP-powered: Uses compromise for part-of-speech tagging
- Scores based on: Verbs, adjectives, proper nouns, grammatical patterns

### 3. Meme Generation Tool

**`generate_meme`** - Create one or more memes
- Input: `memes` (array of {template, text_lines})
- Returns: Meme images and URLs
- Supports batch generation (1-10 memes in parallel)

### Example Usage

**Simple meme generation:**

> "Make me a meme about choosing GraphQL over REST"

Claude will use the `generate_meme` tool:
```json
{
  "memes": [{
    "template": "drake",
    "text_lines": ["REST API", "GraphQL"]
  }]
}
```

**Smart content processing:**

> "Make a meme from this article: https://example.com/ai-news"

Claude's workflow:
1. Calls `fetch_url_content` to download the article
2. Calls `suggest_templates` to get template recommendations
3. Calls `extract_key_quotes` to find punchlines
4. Calls `generate_meme` with the best match

**Multiple meme variations:**

> "Create 3 different meme versions about procrastination"

Claude will batch generate:
```json
{
  "memes": [
    {"template": "drake", "text_lines": ["Starting work on time", "Waiting until last minute"]},
    {"template": "fine", "text_lines": ["Deadline tomorrow", "This is fine"]},
    {"template": "fry", "text_lines": ["Not sure if productive", "Or just procrastinating efficiently"]}
  ]
}
```

#### Multi-Slot Templates

Different templates support different numbers of text lines. Here are examples:

**1-slot template (Change My Mind):**
```json
{
  "template": "cmm",
  "text_lines": ["Linux is superior"]
}
```

**2-slot template (Drake):**
```json
{
  "template": "drake",
  "text_lines": ["REST API", "GraphQL"]
}
```

**3-slot template (Distracted Boyfriend):**
```json
{
  "template": "db",
  "text_lines": ["Current framework", "Developer", "New shiny framework"]
}
```

**4-slot template (Galaxy Brain):**
```json
{
  "template": "gb",
  "text_lines": ["var", "let", "const", "just use TypeScript"]
}
```

**5-slot template (Anakin and Padme):**
```json
{
  "template": "right",
  "text_lines": [
    "Senior Developer",
    "Junior Developer",
    "Put it in the backlog.",
    "So we can fix it later, right?",
    "So we can fix it later, right?"
  ]
}
```

## Available Templates

This MCP server includes **all 207 templates** from memegen.link! Here are some popular ones:

| Template | ID | Slots | Use Case |
|----------|-----|-------|----------|
| Drake Hotline Bling | `drake` | 2 | Rejecting one option for another |
| Distracted Boyfriend | `db` | 3 | Being tempted by something new |
| Change My Mind | `cmm` | 1 | Hot takes and controversial opinions |
| Galaxy Brain | `gb` | 4 | Ascending levels of intelligence |
| Is This a Pigeon? | `pigeon` | 3 | Misidentifying something obvious |
| X, X Everywhere | `buzz` | 2 | Something being everywhere |
| Futurama Fry | `fry` | 2 | Being suspicious or unsure |
| Success Kid | `success` | 2 | Celebrating small victories |
| Doge | `doge` | 2 | Much wow, such meme |
| This is Fine | `fine` | 2 | Everything is on fire but it's fine |
| Woman Yelling at Cat | `woman-cat` | 2 | Two opposing viewpoints |
| Spider-Man Pointing | `spiderman` | 2 | Two identical things |
| Stonks | `stonks` | 2 | Financial decisions |

**Slot Count Distribution:**
- 1 slot: 6 templates
- 2 slots: 165 templates (most common)
- 3 slots: 21 templates
- 4 slots: 6 templates
- 5 slots: 4 templates
- 6 slots: 3 templates
- 8 slots: 2 templates

**Browse all templates:** https://memegen.link/templates/

## Deployment Options

### Option 1: Docker (Recommended for Web Access)

This MCP server supports both **stdio mode** (for Claude Desktop/Code) and **HTTP/SSE mode** (for Claude web).

#### Build and Run with Docker

```bash
# Build the Docker image
docker build -t meme-generator-mcp .

# Run in HTTP mode (for web access)
docker run -p 3000:3000 \
  -e MCP_TRANSPORT=http \
  -e PORT=3000 \
  -e ALLOWED_ORIGINS=* \
  meme-generator-mcp

# Or use docker-compose
docker-compose up -d
```

#### Deploy to Cloud

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Fly.io:**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy
```

**Render:**
1. Connect your GitHub repo
2. Select "Docker" as environment
3. Deploy

Once deployed, you'll get a public URL like `https://your-app.railway.app`. Use the SSE endpoint: `https://your-app.railway.app/sse`

### Option 2: Local HTTP Mode

```bash
# Build
pnpm build

# Run in HTTP mode
pnpm dev:http

# Server will be available at http://localhost:3000/sse
```

### Using with Claude Web

Once your server is deployed publicly:

1. Go to Claude web interface
2. Add a remote MCP server
3. Use your SSE endpoint URL: `https://your-domain.com/sse`
4. Configure CORS by setting `ALLOWED_ORIGINS` to include Claude's domain

**Note:** For production, set `ALLOWED_ORIGINS` to specific domains:
```bash
ALLOWED_ORIGINS=https://claude.ai,https://console.anthropic.com
```

## Development

```bash
# Run tests
pnpm test

# Watch mode for tests
pnpm test:watch

# Build
pnpm build

# Watch mode for build
pnpm watch

# Run locally (stdio mode)
pnpm dev

# Run locally (HTTP mode)
pnpm dev:http
```

## Project Structure

```
meme-generator-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   └── generate-meme.ts  # Tool implementation
│   ├── templates/
│   │   └── catalog.ts        # Template definitions
│   └── utils/
│       ├── memegen.ts        # URL builder for memegen.link
│       └── memegen.test.ts   # Tests for URL encoding
├── dist/                     # Build output
├── package.json
├── tsconfig.json
└── flake.nix                # Nix development environment
```

## How It Works

1. **Template Selection**: Claude chooses a template based on the humor context
2. **Text Encoding**: Special characters are encoded for memegen.link's URL format
3. **URL Generation**: Builds a direct link to the meme image
4. **Response**: Returns both the URL and displays the image

### URL Encoding

memegen.link uses a specific encoding scheme:
- Spaces → underscores (`_`)
- `?` → `~q`
- `%` → `~p`
- `#` → `~h`
- `/` → `~s`
- `\` → `~b`
- Literal `_` → `__`
- Literal `-` → `--`
- Empty text → `_`

## Current Status: Release 3 (Smart Content Processing)

**Completed Features:**

### Release 1: Walking Skeleton ✅
- ✅ MCP server with stdio transport
- ✅ MCP server with HTTP/SSE transport (for web access)
- ✅ `generate_meme` tool
- ✅ URL generation and encoding
- ✅ Type-safe implementation
- ✅ Docker containerization

### Release 2: Template Discovery ✅
- ✅ All 207 templates from memegen.link
- ✅ 9 semantic categories (reactions, comparisons, social, etc.)
- ✅ Template browsing and search tools
- ✅ Keyword-based template discovery
- ✅ Multi-slot template support (1-8 slots)
- ✅ Batch meme generation (1-10 memes in parallel)

### Release 3: Smart Content Processing ✅
- ✅ URL content fetcher (zero-cost, built-in fetch)
- ✅ Rule-based template suggester (keyword + pattern matching)
- ✅ Key quote extractor (statistical analysis)
- ✅ All features are zero-cost (no external APIs)

**Future Ideas:**
- Multi-panel complex layouts (alignment charts, political compass)
- Custom image uploads via memegen.link custom URL feature
- Meme history/favorites tracking (local storage)
- Self-hosted memegen instance support
- Advanced pattern detection (sarcasm, cultural references)

## License

MIT

## Credits

- Powered by [memegen.link](https://memegen.link/)
- Built with [Model Context Protocol SDK](https://github.com/anthropics/modelcontextprotocol)
