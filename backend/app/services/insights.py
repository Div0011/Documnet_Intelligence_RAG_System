import os
from app.services.embeddings import query
from app.services.qa import _get_client, _build_context


def suggest_insights(max_chunks: int = 12) -> dict:
    raw = query("", n_results=max_chunks)
    if not raw:
        return {"insights": "Upload some documents first to get suggested insights."}
    chunks = [{"metadata": h["metadata"], "text": h["text"]} for h in raw]
    context = _build_context(chunks)
    prompt = (
        "Based on the document excerpts below, suggest:\n"
        "1) 3-5 key insights or themes across the documents\n"
        "2) 3 good follow-up questions the user could ask this system\n\n"
        f"Excerpts:\n\n{context}"
    )
    client = _get_client()
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful research assistant summarizing documents."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )
    return {"insights": response.choices[0].message.content}
