# ClearFetch — Model Context Protocol (MCP) & SDKs for AI Agents

<div align="center">

[![PyPI version](https://img.shields.io/pypi/v/clearfetch.svg?color=blue)](https://pypi.org/project/clearfetch/)
[![npm version](https://img.shields.io/npm/v/clearfetch.svg?color=red)](https://www.npmjs.com/package/clearfetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Node.js 18+](https://img.shields.io/badge/node-18+-green.svg)](https://nodejs.org/)

**The Official Model Context Protocol (MCP) Server & Client SDKs for ClearFetch.**  
*Bypass Cloudflare Turnstile, DataDome, and anti-bot challenges to deliver clean, token-optimized Markdown and structured JSON directly into your AI workflows.*

[Website](https://clearfetch.dev) • [API Documentation](https://clearfetch.dev/docs) • [PyPI SDK](https://pypi.org/project/clearfetch/) • [npm MCP Server](https://www.npmjs.com/package/clearfetch)

</div>

---

## 🚀 Quick Install & Distribution Packages

### 1. Model Context Protocol (MCP) Server for Cursor & Claude Desktop
Run instantly without cloning or local installation:
```bash
npx -y clearfetch
```

#### Claude Desktop Configuration (`claude_desktop_config.json`)
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

#### Cursor IDE Configuration (`.cursor/mcp.json`)
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

#### Available MCP Tools
- `clearfetch_read`: Fetches any protected URL and returns token-optimized, clean Markdown.
- `clearfetch_extract`: Extracts strictly-typed JSON matching your provided JSON schema.
- `clearfetch_search`: Performs concurrent web search and scrapes top results into a single context object.

---

### 2. Python SDK (`clearfetch`)

Install from PyPI:
```bash
pip install clearfetch
```

#### Basic Usage
```python
from clearfetch import ClearFetch

client = ClearFetch(api_key="cf_live_your_api_key_here")

# 1. Read protected webpage as clean Markdown
doc = client.read("https://www.bloomberg.com/markets", stealth="auto")
print(doc.title)
print(doc.markdown)

# 2. Extract structured JSON using JSON Schema
schema = {
    "type": "object",
    "properties": {
        "market_indices": {"type": "array", "items": {"type": "string"}},
        "top_stories": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["market_indices"]
}
data = client.extract("https://www.bloomberg.com/markets", schema=schema)
print(data.data)
```

#### LangChain Integration
```python
from clearfetch.integrations.langchain import ClearFetchTool

tool = ClearFetchTool(api_key="cf_live_your_api_key_here")
response = tool.run("https://news.ycombinator.com")
print(response)
```

#### LlamaIndex Integration
```python
from clearfetch.integrations.llamaindex import ClearFetchReader

reader = ClearFetchReader(api_key="cf_live_your_api_key_here")
documents = reader.load_data(urls=["https://en.wikipedia.org/wiki/Artificial_intelligence"])
```

---

### 3. n8n Community Node (`n8n-nodes-clearfetch`)

In your n8n instance:
1. Navigate to **Settings → Community Nodes**.
2. Click **Install a community node**.
3. Enter `n8n-nodes-clearfetch` and confirm.

---

## 📡 REST API Reference

All requests authenticate using standard Bearer authorization: `Authorization: Bearer cf_live_...`.

### Read Webpage (`POST https://api.clearfetch.dev/v1/read`)
```bash
curl -X POST https://api.clearfetch.dev/v1/read \
  -H "Authorization: Bearer cf_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/protected-page",
    "stealth": "auto",
    "only_main_content": true
  }'
```

### Extract Structured Data (`POST https://api.clearfetch.dev/v1/extract`)
```bash
curl -X POST https://api.clearfetch.dev/v1/extract \
  -H "Authorization: Bearer cf_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://store.example.com/item/123",
    "json_schema": {
      "type": "object",
      "properties": {
        "product_name": { "type": "string" },
        "price_usd": { "type": "number" }
      },
      "required": ["product_name", "price_usd"]
    }
  }'
```

### Search & Scrape (`POST https://api.clearfetch.dev/v1/search`)
```bash
curl -X POST https://api.clearfetch.dev/v1/search \
  -H "Authorization: Bearer cf_live_your_api_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Model Context Protocol servers 2026",
    "limit": 3,
    "scrape_results": true
  }'
```

---

## 📦 Packages in this Repository

- [`packages/mcp-server`](./packages/mcp-server): Model Context Protocol server published to npm as `clearfetch`.
- [`packages/python-sdk`](./packages/python-sdk): Python SDK with LangChain/LlamaIndex support published to PyPI as `clearfetch`.
- [`packages/n8n-nodes-clearfetch`](./packages/n8n-nodes-clearfetch): Official n8n community node.

---

## 🔑 Getting an API Key

Create a free account and get your API key at [clearfetch.dev](https://clearfetch.dev).

---

## 📄 License

MIT License. See [LICENSE](./LICENSE) for details.
