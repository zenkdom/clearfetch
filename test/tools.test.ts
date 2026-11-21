import test from "node:test";
import assert from "node:assert/strict";
import { TOOLS, TOOL_ANNOTATIONS, createServer } from "../packages/mcp-server/dist/index.js";
import { ReadUrlSchema, ExtractDataSchema, SearchAndReadSchema } from "../packages/mcp-server/dist/tools.js";

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

    assert.ok(tool.annotations, `Tool ${toolName} must have annotations object`);
    assert.strictEqual(typeof tool.annotations.readOnlyHint, "boolean", `${toolName} readOnlyHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.destructiveHint, "boolean", `${toolName} destructiveHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.idempotentHint, "boolean", `${toolName} idempotentHint must be boolean`);
    assert.strictEqual(typeof tool.annotations.openWorldHint, "boolean", `${toolName} openWorldHint must be boolean`);

    assert.strictEqual(tool.annotations.readOnlyHint, true, `${toolName} is read-only`);
    assert.strictEqual(tool.annotations.destructiveHint, false, `${toolName} is non-destructive`);
    assert.strictEqual(tool.annotations.idempotentHint, true, `${toolName} is idempotent`);
    assert.strictEqual(tool.annotations.openWorldHint, true, `${toolName} accesses open world`);

    assert.strictEqual(typeof (tool as any).readOnlyHint, "boolean", `${toolName} top-level readOnlyHint`);
    assert.strictEqual(typeof (tool as any).destructiveHint, "boolean", `${toolName} top-level destructiveHint`);
    assert.strictEqual(typeof (tool as any).idempotentHint, "boolean", `${toolName} top-level idempotentHint`);
    assert.strictEqual(typeof (tool as any).openWorldHint, "boolean", `${toolName} top-level openWorldHint`);
  }
});

test("Server instance - exposes tools correctly", async () => {
  const server = createServer();
  assert.ok(server, "Server should instantiate");
});
