# ClearFetch Python SDK (`clearfetch`)

> **Official Python Client for ClearFetch ([clearfetch.dev](https://clearfetch.dev))**  
> Unblocked web access, residential Cloudflare Turnstile / DataDome bypass, and clean Markdown / structured JSON extraction for autonomous AI agents, LangChain, and LlamaIndex.

---

## ⚡ Installation

```bash
pip install clearfetch
```

*(Optional integrations)*
```bash
pip install "clearfetch[langchain]"
pip install "clearfetch[llamaindex]"
```

---

## 🚀 Quick Start

### 1. Read Any Webpage as Clean Markdown

```python
from clearfetch import ClearFetch

# Initialize client (uses CLEARFETCH_API_KEY env var by default)
client = ClearFetch(api_key="cf_live_your_key_here")

# Automatically bypasses Turnstile & DataDome and returns clean Markdown
doc = client.read("https://www.bloomberg.com/markets")

print("Title:", doc.title)
print("Tokens:", doc.metadata.estimated_tokens)
print("Content:\n", doc.markdown)
```

---

### 2. Async Client for High-Concurrency Multi-Agent Frameworks

```python
import asyncio
from clearfetch import AsyncClearFetch

async def main():
    client = AsyncClearFetch(api_key="cf_live_your_key_here")
    doc = await client.read("https://news.ycombinator.com")
    print(doc.markdown)

asyncio.run(main())
```

---

### 3. Extract Typed Structured JSON (LLM Schema Enforcement)

```python
schema = {
    "type": "object",
    "properties": {
        "headline": {"type": "string"},
        "market_index": {"type": "string"},
        "points_change": {"type": "number"}
    },
    "required": ["headline"]
}

result = client.extract(
    url="https://www.bloomberg.com/markets",
    json_schema=schema,
    prompt="Extract top market index status"
)

print(result.data)
```

---

### 4. LangChain Integration

```python
from clearfetch import ClearFetchLoader

loader = ClearFetchLoader(
    urls=["https://www.reddit.com/r/technology"],
    api_key="cf_live_your_key_here"
)

docs = loader.load()
print(docs[0].page_content)
```

---

### 5. CLI Terminal Usage

```bash
# Export your key
export CLEARFETCH_API_KEY="cf_live_..."

# Scrape to Markdown
clearfetch read https://example.com

# Live search and bundle
clearfetch search "Autonomous AI agents" --limit 3
```

---

## 📄 License

MIT License. Developed by ClearFetch Team ([clearfetch.dev](https://clearfetch.dev)).
