# clearfetch

> **The Model Context Protocol (MCP) Server for ClearFetch (`clearfetch.dev`)**  
> Where Jina Reader and Firecrawl fail with `403 Forbidden` on Cloudflare Turnstile, DataDome, PerimeterX, or TLS/JA4 fingerprinting, ClearFetch guarantees clean, token-optimized Markdown and structured JSON extraction for AI agents.

---

## ⚡ Quick Start

Run directly via `npx` with zero installation:

```bash
npx -y clearfetch
```

### Required Environment Variables

- `CLEARFETCH_API_KEY`: Your live API key from [ClearFetch Dashboard](https://clearfetch.dev/dashboard) (starts with `cf_live_...`).
- `CLEARFETCH_API_URL`: (Optional) Defaults to `https://api.clearfetch.dev`.

---

## 🛠 Available Agent Tools

| Tool | Description | Key Parameters |
| :--- | :--- | :--- |
| `clearfetch_read` | Reads any URL (including Cloudflare/DataDome protected pages) as clean, token-optimized Markdown. | `url` (required), `stealth` ("auto" \| "force"), `max_age` (cache TTL in sec), `only_main_content` (bool) |
| `clearfetch_extract` | Extracts typed JSON matching a strict schema from any webpage. | `url` (required), `json_schema` (required object), `prompt` (optional instruction) |
| `clearfetch_search` | Searches the web and returns full clean Markdown content of top results in one step. | `query` (required), `limit` (1-10, default 5), `scrape_results` (bool) |

---

## 💻 Client Configuration Examples

### 1. n8n (AI Agent Workflows)

In your n8n workflow with the **AI Agent** node:
1. Add the **Model Context Protocol (MCP) Tool** node connected to your AI Agent.
2. Configure Execution:
   - **Command:** `npx`
   - **Arguments:** `-y, clearfetch`
   - **Environment Variables:**
     - Key: `CLEARFETCH_API_KEY`, Value: `cf_live_your_api_key_here`
3. The AI Agent in n8n can now autonomously browse, unblock Turnstile-protected pages, and extract structured data!

*(Alternatively in n8n, you can use the standard **HTTP Request node** directly against `https://api.clearfetch.dev/v1/read`).*

---

### 2. Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "clearfetch": {
      "command": "npx",
      "args": ["-y", "clearfetch"],
      "env": {
        "CLEARFETCH_API_KEY": "cf_live_your_api_key_here"
      }
    }
  }
}
```

---

### 3. Cursor IDE (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "clearfetch": {
      "command": "npx",
      "args": ["-y", "clearfetch"],
      "env": {
        "CLEARFETCH_API_KEY": "cf_live_your_api_key_here"
      }
    }
  }
}
```

---

### 4. Windsurf / Cline / Roo-Code

```json
{
  "clearfetch": {
    "command": "npx",
    "args": ["-y", "clearfetch"],
    "env": {
      "CLEARFETCH_API_KEY": "cf_live_your_api_key_here"
    },
    "disabled": false,
    "autoApprove": [
      "clearfetch_read",
      "clearfetch_extract",
      "clearfetch_search"
    ]
  }
}
```

---

## 📦 Building from Source

```bash
cd packages/mcp-server
npm install
npm run build
```

Verify stdio connectivity:
```bash
node ./bin/clearfetch-mcp.js
```

---

## 🛡 License

MIT License. Maintained by the ClearFetch Infrastructure Team (`clearfetch.dev`).
