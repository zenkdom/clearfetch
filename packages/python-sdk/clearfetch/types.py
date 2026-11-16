from typing import List, Dict, Any, Optional
from dataclasses import dataclass

@dataclass
class Metadata:
    status_code: int
    cached: bool
    stealth_used: bool
    estimated_tokens: int
    latency_ms: int
    credits_used: int

@dataclass
class ReadResult:
    success: bool
    url: str
    title: str
    description: str
    markdown: str
    links: List[str]
    metadata: Metadata

@dataclass
class ExtractResult:
    success: bool
    url: str
    data: Dict[str, Any]
    metadata: Metadata

@dataclass
class SearchItem:
    title: str
    url: str
    snippet: str
    markdown: Optional[str] = None
    estimated_tokens: Optional[int] = None

@dataclass
class SearchResult:
    success: bool
    query: str
    count: int
    results: List[SearchItem]
    total_estimated_tokens: int
    credits_used: int

@dataclass
class UsageResult:
    credits_balance: int
    plan_tier: str
    concurrency_limit: int
    rate_limit_per_min: int
    recent_logs: List[Dict[str, Any]]
