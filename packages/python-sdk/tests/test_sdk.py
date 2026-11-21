import pytest
from clearfetch import ClearFetch, AsyncClearFetch
from clearfetch.types import Metadata, ReadResult, ExtractResult, SearchItem, SearchResult, UsageResult
from clearfetch.client import ClearFetchError

def test_client_init_requires_key():
    with pytest.raises(ValueError, match="ClearFetch API key must be provided"):
        ClearFetch(api_key=None)

def test_client_init_with_key():
    client = ClearFetch(api_key="cf_live_test12345", base_url="https://api.clearfetch.dev/")
    assert client.api_key == "cf_live_test12345"
    assert client.base_url == "https://api.clearfetch.dev"
    assert client._headers["Authorization"] == "Bearer cf_live_test12345"

def test_async_client_init_with_key():
    async_client = AsyncClearFetch(api_key="cf_live_async12345")
    assert async_client.api_key == "cf_live_async12345"
    assert async_client.base_url == "https://api.clearfetch.dev"

def test_types_dataclasses():
    meta = Metadata(
        status_code=200,
        cached=False,
        stealth_used=True,
        estimated_tokens=500,
        latency_ms=120,
        credits_used=1
    )
    read_res = ReadResult(
        success=True,
        url="https://example.com",
        title="Example",
        description="Desc",
        markdown="# Content",
        links=["https://example.com/about"],
        metadata=meta
    )
    assert read_res.success is True
    assert read_res.metadata.stealth_used is True

def test_error_class():
    err = ClearFetchError("Unauthorized", status_code=401, details={"detail": "Bad Key"})
    assert err.status_code == 401
    assert err.details == {"detail": "Bad Key"}
    assert str(err) == "Unauthorized"
