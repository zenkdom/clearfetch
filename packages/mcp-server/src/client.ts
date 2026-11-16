export interface ReadUrlParams {
  url: string;
  stealth?: "auto" | "force";
  max_age?: number;
  include_links?: boolean;
  only_main_content?: boolean;
}

export interface ReadUrlResponse {
  success: boolean;
  url: string;
  title: string;
  description: string;
  markdown: string;
  links: string[];
  metadata: {
    status_code: number;
    cached: boolean;
    stealth_used: boolean;
    estimated_tokens: number;
    latency_ms: number;
    credits_used: number;
  };
}

export interface ExtractDataParams {
  url: string;
  json_schema: Record<string, unknown>;
  prompt?: string;
  stealth?: "auto" | "force";
}

export interface ExtractDataResponse {
  success: boolean;
  url: string;
  data: Record<string, unknown>;
  metadata: {
    status_code: number;
    cached: boolean;
    stealth_used: boolean;
    estimated_tokens: number;
    latency_ms: number;
    credits_used: number;
  };
}

export interface SearchAndReadParams {
  query: string;
  limit?: number;
  scrape_results?: boolean;
}

export interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  markdown?: string;
  estimated_tokens?: number;
}

export interface SearchAndReadResponse {
  success: boolean;
  query: string;
  count: number;
  results: SearchResultItem[];
  total_estimated_tokens: number;
  credits_used: number;
}

export class UnblockedApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.CLEARFETCH_API_KEY || process.env.UNBLOCKED_API_KEY || "";
    this.baseUrl = (baseUrl || process.env.CLEARFETCH_API_URL || process.env.UNBLOCKED_API_URL || "https://api.clearfetch.dev").replace(/\/$/, "");

    if (!this.apiKey) {
      console.error(
        "[WARN] CLEARFETCH_API_KEY environment variable is not set. MCP tools will fail authorization if not provided."
      );
    }
  }

  private async request<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "ClearFetch-MCP-Server/1.0.0",
    };

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetail = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetail = errorJson.detail || errorText;
      } catch {
        // ignore json parse error
      }
      throw new Error(`ClearFetch API Error (${response.status}): ${errorDetail}`);
    }

    return (await response.json()) as T;
  }

  async readUrl(params: ReadUrlParams): Promise<ReadUrlResponse> {
    return this.request<ReadUrlResponse>("/v1/read", {
      url: params.url,
      stealth: params.stealth || "auto",
      max_age: params.max_age ?? 3600,
      include_links: params.include_links ?? true,
      only_main_content: params.only_main_content ?? true,
    });
  }

  async extractData(params: ExtractDataParams): Promise<ExtractDataResponse> {
    return this.request<ExtractDataResponse>("/v1/extract", {
      url: params.url,
      json_schema: params.json_schema,
      prompt: params.prompt,
      stealth: params.stealth || "auto",
    });
  }

  async searchAndRead(params: SearchAndReadParams): Promise<SearchAndReadResponse> {
    return this.request<SearchAndReadResponse>("/v1/search", {
      query: params.query,
      limit: params.limit ?? 5,
      scrape_results: params.scrape_results ?? true,
    });
  }
}
