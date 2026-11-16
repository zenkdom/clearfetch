from typing import List, Optional, Any
from clearfetch.client import ClearFetch

class ClearFetchReader:
    """LlamaIndex Document Reader for ClearFetch."""
    def __init__(self, api_key: Optional[str] = None):
        self.client = ClearFetch(api_key=api_key)

    def load_data(
        self,
        urls: List[str],
        stealth: str = "auto",
        only_main_content: bool = True
    ) -> List[Any]:
        try:
            from llama_index.core.schema import Document
        except ImportError:
            from dataclasses import dataclass
            @dataclass
            class Document:
                text: str
                extra_info: dict

        documents = []
        for url in urls:
            res = self.client.read(
                url=url,
                stealth=stealth,
                only_main_content=only_main_content
            )
            doc = Document(
                text=res.markdown,
                extra_info={
                    "url": res.url,
                    "title": res.title,
                    "tokens": res.metadata.estimated_tokens
                }
            )
            documents.append(doc)
        return documents
