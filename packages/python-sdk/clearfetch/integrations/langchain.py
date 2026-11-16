from typing import List, Optional, Any, Iterator
from clearfetch.client import ClearFetch

class ClearFetchLoader:
    """LangChain Document Loader for ClearFetch unblocked web extraction."""
    def __init__(
        self,
        urls: List[str],
        api_key: Optional[str] = None,
        stealth: str = "auto",
        only_main_content: bool = True
    ):
        self.urls = urls if isinstance(urls, list) else [urls]
        self.client = ClearFetch(api_key=api_key)
        self.stealth = stealth
        self.only_main_content = only_main_content

    def lazy_load(self) -> Iterator[Any]:
        try:
            from langchain_core.documents import Document
        except ImportError:
            # Fallback mock Document class if langchain_core is not installed
            from dataclasses import dataclass
            @dataclass
            class Document:
                page_content: str
                metadata: dict

        for url in self.urls:
            res = self.client.read(
                url=url,
                stealth=self.stealth,
                only_main_content=self.only_main_content
            )
            yield Document(
                page_content=res.markdown,
                metadata={
                    "source": res.url,
                    "title": res.title,
                    "description": res.description,
                    "tokens": res.metadata.estimated_tokens,
                    "stealth_used": res.metadata.stealth_used
                }
            )

    def load(self) -> List[Any]:
        return list(self.lazy_load())
