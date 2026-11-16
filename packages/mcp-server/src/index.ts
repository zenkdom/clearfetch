import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { UnblockedApiClient } from "./client.js";
import { ReadUrlSchema, ExtractDataSchema, SearchAndReadSchema } from "./tools.js";
import dotenv from "dotenv";

dotenv.config();

const client = new UnblockedApiClient();

const TOOLS: Tool[] = [
  {
    name: "read_url",
    description:
      "Read any URL as clean, token-optimized Markdown. Reliably bypasses Cloudflare Turnstile, DataDome, PerimeterX, and anti-bot systems where other scrapers fail with 403 Forbidden.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The full target URL to read (e.g. https://www.bloomberg.com/news/...)",
        },
        stealth: {
          type: "string",
          enum: ["auto", "force"],
          default: "auto",
          description:
            "'auto' attempts fast TLS spoofing first and auto-escalates on challenge detection; 'force' routes through full residential browser solver immediately.",
        },
        max_age: {
          type: "integer",
          default: 3600,
          description: "Cache TTL in seconds. 0 forces live fresh fetch.",
        },
        include_links: {
          type: "boolean",
          default: true,
          description: "Whether to return extracted outgoing links.",
        },
        only_main_content: {
          type: "boolean",
          default: true,
          description: "Whether to strip navigation, ads, and footers.",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "extract_structured_data",
    description:
      "Extract strongly-typed JSON matching a strict schema from any webpage, even behind heavy anti-bot protections.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target webpage URL to extract data from",
        },
        json_schema: {
          type: "object",
          description: "Strict JSON Schema describing the target data fields",
        },
        prompt: {
          type: "string",
          description: "Optional custom instruction or focus for extraction",
        },
        stealth: {
          type: "string",
          enum: ["auto", "force"],
          default: "auto",
        },
      },
      required: ["url", "json_schema"],
    },
  },
  {
    name: "search_and_read",
    description:
      "Search the live web and return clean Markdown content bundles of top results in a single step for AI agent context / RAG.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
        limit: {
          type: "integer",
          default: 5,
          minimum: 1,
          maximum: 10,
          description: "Number of search results to return (1-10)",
        },
        scrape_results: {
          type: "boolean",
          default: true,
          description: "Whether to fetch full clean Markdown for each result",
        },
      },
      required: ["query"],
    },
  },
];

export function createServer(): Server {
  const server = new Server(
    {
      name: "clearfetch-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "read_url") {
        const validated = ReadUrlSchema.parse(args);
        const res = await client.readUrl(validated);
        return {
          content: [
            {
              type: "text",
              text: `# ${res.title}\n\n${res.markdown}\n\n---\n*Metadata: status=${res.metadata.status_code}, cached=${res.metadata.cached}, stealth=${res.metadata.stealth_used}, tokens=${res.metadata.estimated_tokens}, latency=${res.metadata.latency_ms}ms*`,
            },
          ],
        };
      }

      if (name === "extract_structured_data") {
        const validated = ExtractDataSchema.parse(args);
        const res = await client.extractData(validated);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(res.data, null, 2),
            },
          ],
        };
      }

      if (name === "search_and_read") {
        const validated = SearchAndReadSchema.parse(args);
        const res = await client.searchAndRead(validated);

        const formattedResults = res.results
          .map((item, index) => {
            return `### [${index + 1}] ${item.title}\nURL: ${item.url}\n${
              item.markdown ? `\nContent:\n${item.markdown}\n` : `\nSnippet: ${item.snippet}\n`
            }`;
          })
          .join("\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: `# Search Results for: "${res.query}"\n\n${formattedResults}\n\n---\n*Total tokens: ${res.total_estimated_tokens}, Results count: ${res.count}*`,
            },
          ],
        };
      }

      throw new Error(`Unknown tool requested: ${name}`);
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Error executing ${name}: ${error.message || String(error)}`,
          },
        ],
      };
    }
  });

  return server;
}

export async function runStdioServer() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Unblocked Web MCP Server running on stdio transport.");
}
