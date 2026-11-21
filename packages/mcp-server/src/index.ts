import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  Tool,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";
import { ClearFetchApiClient } from "./client.js";
import { ReadUrlSchema, ExtractDataSchema, SearchAndReadSchema } from "./tools.js";
import dotenv from "dotenv";

dotenv.config();

const client = new ClearFetchApiClient();

export const TOOL_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
};

export const TOOLS: (Tool & {
  readOnlyHint?: boolean;
  destructiveHint?: boolean;
  idempotentHint?: boolean;
  openWorldHint?: boolean;
})[] = [
  {
    name: "clearfetch_read",
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
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
  {
    name: "clearfetch_extract",
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
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
  {
    name: "clearfetch_search",
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
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
  {
    name: "read_url",
    description:
      "Alias for clearfetch_read: Read any URL as clean, token-optimized Markdown with automatic anti-bot bypass.",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Target web URL to scrape and convert to Markdown",
        },
        stealth: {
          type: "string",
          enum: ["auto", "force"],
          default: "auto",
        },
        max_age: {
          type: "integer",
          default: 3600,
        },
        include_links: {
          type: "boolean",
          default: true,
        },
        only_main_content: {
          type: "boolean",
          default: true,
        },
      },
      required: ["url"],
    },
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
  {
    name: "extract_structured_data",
    description:
      "Alias for clearfetch_extract: Extract structured JSON matching a strict schema from any webpage.",
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
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
  {
    name: "search_and_read",
    description:
      "Alias for clearfetch_search: Search the live web and return clean Markdown content bundles in one step.",
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
        },
        scrape_results: {
          type: "boolean",
          default: true,
        },
      },
      required: ["query"],
    },
    annotations: TOOL_ANNOTATIONS,
    ...TOOL_ANNOTATIONS,
  },
];

const PROMPTS: Prompt[] = [
  {
    name: "read_and_summarize",
    description: "Read any webpage or article behind Cloudflare/Turnstile and generate a concise summary",
    arguments: [
      {
        name: "url",
        description: "Target webpage URL to read (e.g. https://news.ycombinator.com)",
        required: true,
      },
    ],
  },
  {
    name: "extract_pricing_table",
    description: "Extract tiers, prices, and features from a SaaS pricing page into clean JSON",
    arguments: [
      {
        name: "url",
        description: "Pricing page URL (e.g. https://clearfetch.dev/pricing)",
        required: true,
      },
    ],
  },
  {
    name: "web_deep_research",
    description: "Search the live web and read top results to research any topic or query",
    arguments: [
      {
        name: "query",
        description: "Research topic or query (e.g. Model Context Protocol best practices 2026)",
        required: true,
      },
    ],
  },
];

export function createServer(): Server {
  const server = new Server(
    {
      name: "clearfetch",
      version: "1.0.1",
    },
    {
      capabilities: {
        tools: {},
        prompts: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return { prompts: PROMPTS };
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "read_and_summarize") {
      const url = args?.url || "https://example.com";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please use the clearfetch_read tool to fetch the content from ${url} and provide a well-structured summary with key takeaways.`,
            },
          },
        ],
      };
    }
    if (name === "extract_pricing_table") {
      const url = args?.url || "https://clearfetch.dev/pricing";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please use the clearfetch_extract tool on ${url} to extract all pricing plans, monthly/annual costs, and included limits/features into structured JSON.`,
            },
          },
        ],
      };
    }
    if (name === "web_deep_research") {
      const query = args?.query || "Model Context Protocol";
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Please use the clearfetch_search tool with the query "${query}" and write a detailed synthesis report covering the top findings.`,
            },
          },
        ],
      };
    }
    throw new Error(`Unknown prompt requested: ${name}`);
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === "clearfetch_read" || name === "read_url") {
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

      if (name === "clearfetch_extract" || name === "extract_structured_data") {
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

      if (name === "clearfetch_search" || name === "search_and_read") {
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
  console.error("ClearFetch MCP Server running on stdio transport.");
}
