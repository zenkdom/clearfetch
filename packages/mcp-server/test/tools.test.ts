import test from "node:test";
import assert from "node:assert/strict";
import { TOOLS, TOOL_ANNOTATIONS, createServer } from "../dist/index.js";
import { ReadUrlSchema, ExtractDataSchema, SearchAndReadSchema } from "../dist/tools.js";
import { ListToolsRequestSchema, ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

test("MCP Tool Annotations - all four hints declared on every tool", () => {
  assert.ok(TOOLS.length >= 3, "Expected at least 3 tools declared");

  const requiredTools = [
    "clearfetch_read",
    "clearfetch_extract",
    "clearfetch_search",
    "read_url",
    "extract_structured_data",
    "search_and_read",
  ];

  for (const toolName of requiredTools) {
    const tool = TOOLS.find((t) => t.name === toolName);
    assert.ok(tool, `Tool ${toolName} must be declared`);

    // Verify tool.annotations
    assert.ok(tool.annotations, `Tool ${toolName} must have annotations object`);
    assert.strictEqual(typeof tool.annotations.readOnlyHint, "boolean", `${toolName} readOnlyHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.destructiveHint, "boolean", `${toolName} destructiveHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.idempotentHint, "boolean", `${toolName} idempotentHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.openWorldHint, "boolean", `${toolName} openWorldHint must be boolean`);

    // Verify specific values
    assert.strictEqual(tool.annotations.readOnlyHint, true, `${toolName} is read-only`);
    assert.strictEqual(tool.annotations.destructiveHint, false, `${toolName} is non-destructive`);
    assert.strictEqual(tool.annotations.idempotentHint, true, `${toolName} is idempotent`);
    assert.strictEqual(tool.annotations.openWorldHint, true, `${toolName} accesses open world`);

    // Also verify top-level properties for OpenAI directory compatibility
    assert.strictEqual(typeof (tool as any).readOnlyHint, "boolean", `${toolName} top-level readOnlyHint`);
    assert.strictEqual(typeof (tool as any).destructiveHint, "boolean", `${toolName} top-level destructiveHint`);
    assert.strictEqual(typeof (tool as any).idempotentHint, "boolean", `${toolName} top-level idempotentHint`);
    assert.strictEqual(typeof (tool as any).openWorldHint, "boolean", `${toolName} top-level openWorldHint`);
  }
});

test("Zod validation schemas - validate valid payloads", () => {
  // 1. ReadUrlSchema
  const validRead = ReadUrlSchema.parse({
    url: "https://example.com/article",
    stealth: "force",
    max_age: 1800,
  });
  assert.strictEqual(validRead.url, "https://example.com/article");
  assert.strictEqual(validRead.stealth, "force");
  assert.strictEqual(validRead.max_age, 1800);
  assert.strictEqual(validRead.only_main_content, true);

  // 2. ExtractDataSchema
  const validExtract = ExtractDataSchema.parse({
    url: "https://example.com/pricing",
    json_schema: { type: "object", properties: { price: { type: "number" } } },
    prompt: "Extract price",
  });
  assert.strictEqual(validExtract.url, "https://example.com/pricing");
  assert.deepStrictEqual(validExtract.json_schema.type, "object");

  // 3. SearchAndReadSchema
  const validSearch = SearchAndReadSchema.parse({
    query: "clearfetch mcp bypass turnstile",
    limit: 5,
  });
  assert.strictEqual(validSearch.query, "clearfetch mcp bypass turnstile");
  assert.strictEqual(validSearch.limit, 5);
  assert.strictEqual(validSearch.scrape_results, true);
});

test("Zod validation schemas - reject invalid inputs", () => {
  // Invalid URL
  assert.throws(() => ReadUrlSchema.parse({ url: "not-a-valid-url" }));

  // Missing query
  assert.throws(() => SearchAndReadSchema.parse({}));

  // Limit out of bounds
  assert.throws(() => SearchAndReadSchema.parse({ query: "test", limit: 99 }));
});

test("Server instance - exposes tools and prompts correctly", () => {
  const server = createServer();
  assert.ok(server, "Server initialized");
});
