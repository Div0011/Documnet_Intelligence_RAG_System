import os
import re
import uuid
from dataclasses import dataclass
from typing import List, Optional
from pypdf import PdfReader
from pypdf.errors import PdfReadError


@dataclass
class Chunk:
    id: str
    text: str
    source: str
    page: int
    chunk_index: int


@dataclass
class IngestionResult:
    filename: str
    chunks: List[Chunk]
    error: Optional[str] = None
    is_empty: bool = False


CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", 800))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", 150))


def extract_pages(file_path: str) -> List[str]:
    reader = PdfReader(file_path)
    pages = []
    for page in reader.pages:
        try:
            text = page.extract_text() or ""
        except Exception:
            text = ""
        pages.append(text)
    return pages


def _split_into_windows(text: str, size: int, overlap: int) -> List[str]:
    if len(text) <= size:
        return [text] if text.strip() else []
    windows = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + size, n)
        if end < n:
            snap_window = text[end:end + 200]
            match = re.search(r"[.!?]\s", snap_window)
            if match:
                end = end + match.end()
        chunk_text = text[start:end].strip()
        if chunk_text:
            windows.append(chunk_text)
        if end >= n:
            break
        start = max(end - overlap, start + 1)
    return windows


def ingest_pdf(file_path: str, filename: str) -> IngestionResult:
    try:
        pages = extract_pages(file_path)
    except PdfReadError as e:
        return IngestionResult(filename=filename, chunks=[], error=f"Corrupted PDF: {e}")
    except Exception as e:
        return IngestionResult(filename=filename, chunks=[], error=f"Failed to read PDF: {e}")

    full_text_len = sum(len(p.strip()) for p in pages)
    if full_text_len == 0:
        return IngestionResult(
            filename=filename,
            chunks=[],
            is_empty=True,
            error="No extractable text found (PDF may be scanned/image-only).",
        )

    chunks = []
    chunk_idx = 0
    for page_num, page_text in enumerate(pages, start=1):
        if not page_text.strip():
            continue
        for window in _split_into_windows(page_text, CHUNK_SIZE, CHUNK_OVERLAP):
            chunks.append(
                Chunk(
                    id=str(uuid.uuid4()),
                    text=window,
                    source=filename,
                    page=page_num,
                    chunk_index=chunk_idx,
                )
            )
            chunk_idx += 1
    return IngestionResult(filename=filename, chunks=chunks)


def ingest_many(file_paths_and_names: List[tuple]) -> List[IngestionResult]:
    return [ingest_pdf(path, name) for path, name in file_paths_and_names]
