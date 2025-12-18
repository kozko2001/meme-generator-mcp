# Meme Generator MCP

A Model Context Protocol (MCP) server that generates memes from text content using [memegen.link](https://memegen.link/).

## What is this?

This MCP server lets Claude (or any MCP client) generate memes by choosing the right template and adding text. Instead of AI image generation, it uses classic meme templates that carry cultural meaning—the format is part of the joke.

## Features

- **5 Classic Templates**: Drake, Distracted Boyfriend, Change My Mind, Pigeon, Surprised Pikachu
- **Smart Template Selection**: Detailed descriptions help Claude pick the right template for the humor
- **URL-based Generation**: Uses memegen.link API (no authentication needed)
- **Type-safe**: Full TypeScript implementation with validation

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

### Example Usage

In Claude, you can say:

> "Make me a meme about choosing GraphQL over REST"

Claude will use the `generate_meme` tool with something like:
- Template: `drake`
- Top: "REST API"
- Bottom: "GraphQL"

And get back a meme image URL.

## Available Templates

| Template | ID | Use Case |
|----------|-----|----------|
| Drake Hotline Bling | `drake` | Rejecting one option for another |
| Distracted Boyfriend | `db` | Being tempted by something new |
| Change My Mind | `cmm` | Hot takes and controversial opinions |
| Is This a Pigeon? | `pigeon` | Misidentifying something obvious |
| Surprised Pikachu | `pikachu` | Shocked by predictable consequences |

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

## Release 1 Status

This is the "Walking Skeleton" release. Basic functionality works end-to-end.

**Completed:**
- ✅ MCP server with stdio transport
- ✅ MCP server with HTTP/SSE transport (for web access)
- ✅ `generate_meme` tool
- ✅ 5 hardcoded templates
- ✅ URL generation and encoding
- ✅ Tests for URL encoding
- ✅ Type-safe implementation
- ✅ Docker containerization
- ✅ CORS support for web clients

**Future Releases:**
- Expand to 15-20 templates
- Accept URLs and auto-extract content
- User template selection preferences
- Self-hosted memegen instance support

## License

MIT

## Credits

- Powered by [memegen.link](https://memegen.link/)
- Built with [Model Context Protocol SDK](https://github.com/anthropics/modelcontextprotocol)
