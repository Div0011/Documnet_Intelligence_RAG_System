import os
from app.services.embeddings import query
from app.services.qa import _get_client, _build_context


def suggest_insights(max_chunks: int = 12, sources: list[str] | None = None) -> dict:
    raw = query("", n_results=max_chunks)
    if sources:
        raw = [h for h in raw if h.get("metadata", {}).get("source") in sources]
    if not raw:
        return {"insights": "Upload some documents first to get suggested insights."}
    chunks = [{"metadata": h["metadata"], "text": h["text"]} for h in raw]
    context = _build_context(chunks)
    num_docs = len({c["metadata"].get("source") for c in chunks if c["metadata"].get("source")})
    cross_doc_note = (
        f"Note: The excerpts below come from {num_docs} different document(s). "
        "Where relevant, identify themes, contradictions, or connections that span across these documents."
        if num_docs > 1
        else ""
    )
    prompt = (
        "Based on the document excerpts below, provide a concise analysis:\n"
        "1) 3-5 key insights or themes\n"
        "2) If multiple documents are present, highlight cross-document connections, contradictions, or complementary points\n"
        "3) 3 good follow-up questions the user could ask this system\n\n"
        f"{cross_doc_note}\n\n"
        f"Excerpts:\n\n{context}"
    )
    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful research assistant synthesizing document insights."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=600,
    )
    return {"insights": response.choices[0].message.content}
