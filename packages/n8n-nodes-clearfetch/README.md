# n8n-nodes-clearfetch

> **Official n8n Community Node for ClearFetch ([clearfetch.dev](https://clearfetch.dev))**  
> Easily bypass Cloudflare Turnstile, DataDome, and strict anti-bot protections to extract clean Markdown and structured JSON directly in your n8n workflows.

---

## ⚡ Installation in n8n

1. In your self-hosted or cloud n8n instance, navigate to **Settings** > **Community Nodes**.
2. Click **Install a community node**.
3. Enter:
   ```text
   n8n-nodes-clearfetch
   ```
4. Check the box agreeing to risks, and click **Install**.

---

## 🔑 Credentials Setup

1. In n8n, create a new credential: **ClearFetch API**.
2. Enter your live API key (`cf_live_...`) generated from your [ClearFetch Dashboard](https://clearfetch.dev/dashboard).
3. The Base URL defaults to `https://api.clearfetch.dev`.

---

## 🛠 Supported Operations

- **Web Scraper & Reader (`/v1/read`):** Unblocks any target URL and converts it into token-optimized Markdown.
- **Structured JSON Extractor (`/v1/extract`):** Enforces a strict JSON Schema via an LLM.
- **Web Search & RAG Context (`/v1/search`):** Concurrently searches and fetches top results into clean Markdown.

---

## 📄 License

MIT License. Maintained by the ClearFetch Infrastructure Team ([clearfetch.dev](https://clearfetch.dev)).
