import os
import httpx
from typing import Dict, Any, Optional, List
from clearfetch.types import ReadResult, ExtractResult, SearchResult, SearchItem, UsageResult, Metadata

class ClearFetchError(Exception):
    """Base exception for ClearFetch API errors."""
    def __init__(self, message: str, status_code: Optional[int] = None, details: Optional[Any] = None):
        super().__init__(message)
        self.status_code = status_code
        self.details = details

class ClearFetch:
    """Synchronous ClearFetch API Client."""
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0
    ):
        self.api_key = api_key or os.getenv("CLEARFETCH_API_KEY", "")
        self.base_url = (base_url or os.getenv("CLEARFETCH_API_URL", "https://api.clearfetch.dev")).rstrip("/")
        self.timeout = timeout

        if not self.api_key:
            raise ValueError(
                "ClearFetch API key must be provided either via the 'api_key' argument or the 'CLEARFETCH_API_KEY' environment variable."
            )

        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "ClearFetch-Python-SDK/1.0.1"
        }

    def _handle_response(self, response: httpx.Response) -> Dict[str, Any]:
        if not response.is_success:
            detail = response.text
            try:
                err_data = response.json()
                detail = err_data.get("detail", response.text)
            except Exception:
                pass
            raise ClearFetchError(
                f"ClearFetch API returned {response.status_code}: {detail}",
                status_code=response.status_code,
                details=detail
            )
        return response.json()

    def read(
        self,
        url: str,
        stealth: str = "auto",
        max_age: int = 3600,
        only_main_content: bool = True,
        include_links: bool = True
    ) -> ReadResult:
        """Reads any URL as clean Markdown, bypassing Cloudflare Turnstile & DataDome."""
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(
                f"{self.base_url}/v1/read",
                headers=self._headers,
                json={
                    "url": url,
                    "stealth": stealth,
                    "max_age": max_age,
                    "only_main_content": only_main_content,
                    "include_links": include_links
                }
            )
            data = self._handle_response(resp)
            meta = data["metadata"]
            return ReadResult(
                success=data["success"],
                url=data["url"],
                title=data["title"],
                description=data["description"],
                markdown=data["markdown"],
                links=data["links"],
                metadata=Metadata(**meta)
            )

    def extract(
        self,
        url: str,
        json_schema: Dict[str, Any],
        prompt: Optional[str] = None,
        stealth: str = "auto"
    ) -> ExtractResult:
        """Extracts strongly-typed structured JSON conforming to a JSON Schema."""
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(
                f"{self.base_url}/v1/extract",
                headers=self._headers,
                json={
                    "url": url,
                    "json_schema": json_schema,
                    "prompt": prompt,
                    "stealth": stealth
                }
            )
            data = self._handle_response(resp)
            meta = data["metadata"]
            return ExtractResult(
                success=data["success"],
                url=data["url"],
                data=data["data"],
                metadata=Metadata(**meta)
            )

    def search(
        self,
        query: str,
        limit: int = 5,
        scrape_results: bool = True
    ) -> SearchResult:
        """Searches the web and bundles clean Markdown of top results for RAG."""
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.post(
                f"{self.base_url}/v1/search",
                headers=self._headers,
                json={
                    "query": query,
                    "limit": limit,
                    "scrape_results": scrape_results
                }
            )
            data = self._handle_response(resp)
            items = [
                SearchItem(
                    title=item["title"],
                    url=item["url"],
                    snippet=item["snippet"],
                    markdown=item.get("markdown"),
                    estimated_tokens=item.get("estimated_tokens")
                )
                for item in data["results"]
            ]
            return SearchResult(
                success=data["success"],
                query=data["query"],
                count=data["count"],
                results=items,
                total_estimated_tokens=data["total_estimated_tokens"],
                credits_used=data["credits_used"]
            )

    def get_usage(self) -> UsageResult:
        """Retrieves account balance and recent telemetry logs."""
        with httpx.Client(timeout=self.timeout) as client:
            resp = client.get(f"{self.base_url}/v1/usage", headers=self._headers)
            data = self._handle_response(resp)
            return UsageResult(
                credits_balance=data["credits_balance"],
                plan_tier=data["plan_tier"],
                concurrency_limit=data["concurrency_limit"],
                rate_limit_per_min=data["rate_limit_per_min"],
                recent_logs=data.get("recent_logs", [])
            )


class AsyncClearFetch:
    """Asynchronous ClearFetch API Client."""
    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0
    ):
        self.api_key = api_key or os.getenv("CLEARFETCH_API_KEY", "")
        self.base_url = (base_url or os.getenv("CLEARFETCH_API_URL", "https://api.clearfetch.dev")).rstrip("/")
        self.timeout = timeout

        if not self.api_key:
            raise ValueError(
                "ClearFetch API key must be provided either via the 'api_key' argument or the 'CLEARFETCH_API_KEY' environment variable."
            )

        self._headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "ClearFetch-Python-AsyncSDK/1.0.1"
        }

    def _handle_response(self, response: httpx.Response) -> Dict[str, Any]:
        if not response.is_success:
            detail = response.text
            try:
                err_data = response.json()
                detail = err_data.get("detail", response.text)
            except Exception:
                pass
            raise ClearFetchError(
                f"ClearFetch API returned {response.status_code}: {detail}",
                status_code=response.status_code,
                details=detail
            )
        return response.json()

    async def read(
        self,
        url: str,
        stealth: str = "auto",
        max_age: int = 3600,
        only_main_content: bool = True,
        include_links: bool = True
    ) -> ReadResult:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/v1/read",
                headers=self._headers,
                json={
                    "url": url,
                    "stealth": stealth,
                    "max_age": max_age,
                    "only_main_content": only_main_content,
                    "include_links": include_links
                }
            )
            data = self._handle_response(resp)
            meta = data["metadata"]
            return ReadResult(
                success=data["success"],
                url=data["url"],
                title=data["title"],
                description=data["description"],
                markdown=data["markdown"],
                links=data["links"],
                metadata=Metadata(**meta)
            )

    async def extract(
        self,
        url: str,
        json_schema: Dict[str, Any],
        prompt: Optional[str] = None,
        stealth: str = "auto"
    ) -> ExtractResult:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/v1/extract",
                headers=self._headers,
                json={
                    "url": url,
                    "json_schema": json_schema,
                    "prompt": prompt,
                    "stealth": stealth
                }
            )
            data = self._handle_response(resp)
            meta = data["metadata"]
            return ExtractResult(
                success=data["success"],
                url=data["url"],
                data=data["data"],
                metadata=Metadata(**meta)
            )

    async def search(
        self,
        query: str,
        limit: int = 5,
        scrape_results: bool = True
    ) -> SearchResult:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/v1/search",
                headers=self._headers,
                json={
                    "query": query,
                    "limit": limit,
                    "scrape_results": scrape_results
                }
            )
            data = self._handle_response(resp)
            items = [
                SearchItem(
                    title=item["title"],
                    url=item["url"],
                    snippet=item["snippet"],
                    markdown=item.get("markdown"),
                    estimated_tokens=item.get("estimated_tokens")
                )
                for item in data["results"]
            ]
            return SearchResult(
                success=data["success"],
                query=data["query"],
                count=data["count"],
                results=items,
                total_estimated_tokens=data["total_estimated_tokens"],
                credits_used=data["credits_used"]
            )

    async def get_usage(self) -> UsageResult:
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.get(f"{self.base_url}/v1/usage", headers=self._headers)
            data = self._handle_response(resp)
            return UsageResult(
                credits_balance=data["credits_balance"],
                plan_tier=data["plan_tier"],
                concurrency_limit=data["concurrency_limit"],
                rate_limit_per_min=data["rate_limit_per_min"],
                recent_logs=data.get("recent_logs", [])
            )
