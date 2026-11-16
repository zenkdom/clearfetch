import sys
import json
import argparse
from clearfetch.client import ClearFetch, ClearFetchError

def main():
    parser = argparse.ArgumentParser(
        prog="clearfetch",
        description="ClearFetch CLI — Unblocked Web & Anti-Bot Extraction Layer for AI Agents"
    )
    parser.add_argument("--api-key", help="ClearFetch API key (or set CLEARFETCH_API_KEY env var)")
    parser.add_argument("--api-url", help="ClearFetch Gateway base URL")

    subparsers = parser.add_subparsers(dest="command", required=True)

    # Read command
    read_parser = subparsers.add_parser("read", help="Read any webpage as clean Markdown")
    read_parser.add_argument("url", help="Target URL to scrape")
    read_parser.add_argument("--stealth", choices=["auto", "force"], default="auto", help="Anti-bot bypass mode")
    read_parser.add_argument("--max-age", type=int, default=3600, help="Cache TTL in seconds")

    # Extract command
    extract_parser = subparsers.add_parser("extract", help="Extract typed JSON using an LLM")
    extract_parser.add_argument("url", help="Target URL")
    extract_parser.add_argument("--schema", required=True, help="Path to JSON Schema file")
    extract_parser.add_argument("--prompt", help="Optional instruction prompt")

    # Search command
    search_parser = subparsers.add_parser("search", help="Search the live web and bundle Markdown")
    search_parser.add_argument("query", help="Search query string")
    search_parser.add_argument("--limit", type=int, default=5, help="Number of results (1-10)")

    # Usage command
    subparsers.add_parser("usage", help="Check remaining credits and plan details")

    args = parser.parse_args()

    try:
        client = ClearFetch(api_key=args.api_key, base_url=args.api_url)

        if args.command == "read":
            result = client.read(url=args.url, stealth=args.stealth, max_age=args.max_age)
            print(f"# {result.title}\n\n{result.markdown}\n")
            print(f"\n--- Metadata: status={result.metadata.status_code}, tokens={result.metadata.estimated_tokens}, latency={result.metadata.latency_ms}ms, credits={result.metadata.credits_used} ---", file=sys.stderr)

        elif args.command == "extract":
            with open(args.schema, "r", encoding="utf-8") as f:
                schema_data = json.load(f)
            result = client.extract(url=args.url, json_schema=schema_data, prompt=args.prompt)
            print(json.dumps(result.data, indent=2))

        elif args.command == "search":
            result = client.search(query=args.query, limit=args.limit)
            for idx, item in enumerate(result.results, 1):
                print(f"[{idx}] {item.title} ({item.url})\n")
                if item.markdown:
                    print(f"{item.markdown[:500]}...\n")
                else:
                    print(f"{item.snippet}\n")
                print("-" * 50)

        elif args.command == "usage":
            result = client.get_usage()
            print(f"Plan Tier: {result.plan_tier}")
            print(f"Credits Remaining: {result.credits_balance:,}")
            print(f"Concurrency Limit: {result.concurrency_limit} threads")
            print(f"Rate Limit: {result.rate_limit_per_min} req/min")

    except ClearFetchError as e:
        print(f"ClearFetch API Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
