import os
import chromadb
from chromadb.utils import embedding_functions
from typing import List, Dict, Any


PERSIST_DIR = os.getenv("CHROMA_DIR", os.path.join(os.getenv("DATA_DIR", "./data"), "chroma"))
COLLECTION_NAME = "documents"

_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
)
_client = chromadb.PersistentClient(path=PERSIST_DIR)


def get_collection():
    return _client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=_embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def add_chunks(chunks: List[Any]) -> int:
    if not chunks:
        return 0
    collection = get_collection()
    collection.add(
        ids=[c.id for c in chunks],
        documents=[c.text for c in chunks],
        metadatas=[
            {"source": c.source, "page": c.page, "chunk_index": c.chunk_index}
            for c in chunks
        ],
    )
    return len(chunks)


def query(question: str, n_results: int = 20) -> List[Dict]:
    collection = get_collection()
    if collection.count() == 0:
        return []
    n_results = min(n_results, collection.count())
    results = collection.query(query_texts=[question], n_results=n_results)
    hits = []
    if not results or not results.get("ids") or not results["ids"][0]:
        return []
    for i in range(len(results["ids"][0])):
        hits.append(
            {
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i] if results.get("distances") else 0.0,
            }
        )
    return hits


def collection_stats() -> Dict:
    collection = get_collection()
    count = collection.count()
    docs_indexed = 0
    if count > 0:
        try:
            results = collection.get(include=["metadatas"])
            metadatas = results.get("metadatas", []) or []
            unique_sources = {m.get("source") for m in metadatas if m and m.get("source")}
            docs_indexed = len(unique_sources)
        except Exception:
            docs_indexed = 0
    return {"total_chunks": count, "documents_indexed": docs_indexed}


def reset_collection():
    try:
        _client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass
