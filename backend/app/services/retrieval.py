from typing import List, Dict
from sentence_transformers import CrossEncoder
from app.services.embeddings import query, collection_stats

TOP_K = 5
MAX_DISTANCE = 1.0

_reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")


def retrieve(question: str, top_k: int = TOP_K) -> List[Dict]:
    raw_hits = query(question, n_results=20)
    relevant = [h for h in raw_hits if h["distance"] <= MAX_DISTANCE]
    if not relevant:
        return []
    pairs = [(question, h["text"]) for h in relevant]
    scores = _reranker.predict(pairs)
    for h, score in zip(relevant, scores):
        h["rerank_score"] = float(score)
    relevant.sort(key=lambda x: x["rerank_score"], reverse=True)
    return relevant[:top_k]


def has_documents() -> bool:
    stats = collection_stats()
    return stats.get("total_chunks", 0) > 0
