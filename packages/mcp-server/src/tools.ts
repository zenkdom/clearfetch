import { z } from "zod";

export const ReadUrlSchema = z.object({
  url: z.string().url().describe("The full web URL to scrape and read into clean Markdown"),
  stealth: z
    .enum(["auto", "force"])
    .optional()
    .default("auto")
    .describe(
      "'auto' tries fast TLS spoofing first and auto-escalates on 403/Turnstile; 'force' routes through full residential proxy + Turnstile solver immediately."
    ),
  max_age: z
    .number()
    .int()
    .nonnegative()
    .optional()
    .default(3600)
    .describe("Redis cache TTL in seconds. Use 0 to force a real-time fresh bypass fetch."),
  include_links: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to include extracted outgoing links in the response"),
  only_main_content: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to strip navigational headers, footers, and ad noise using Trafilatura"),
});

export const ExtractDataSchema = z.object({
  url: z.string().url().describe("Target webpage URL to extract data from"),
  json_schema: z
    .record(z.string(), z.any())
    .describe("JSON Schema definition defining the desired typed structure"),
  prompt: z
    .string()
    .optional()
    .describe("Optional extraction prompt or instructions for the LLM"),
  stealth: z
    .enum(["auto", "force"])
    .optional()
    .default("auto")
    .describe("Anti-bot bypass level"),
});

export const SearchAndReadSchema = z.object({
  query: z.string().min(1).describe("Search query to execute"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .default(5)
    .describe("Number of top results to return (1-10)"),
  scrape_results: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether to concurrently fetch and convert each search result into clean Markdown"),
});
