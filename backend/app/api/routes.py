from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool
from typing import List
import os
import shutil
from app.core.config import settings
from app.models.schemas import UploadResponse, QueryRequest, QueryResponse, StatusResponse
from app.services.ingestion import ingest_many
from app.services.embeddings import add_chunks, collection_stats, reset_collection, delete_by_source
from app.services.retrieval import retrieve as retrieve_chunks
from app.services.qa import answer_question
from app.services.insights import suggest_insights

router = APIRouter()

UPLOAD_DIR = os.path.join(settings.DATA_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/health")
async def health():
    return {"status": "ok"}


@router.get("/status", response_model=StatusResponse)
async def status():
    stats = collection_stats()
    return StatusResponse(total_chunks=stats["total_chunks"], documents_indexed=stats.get("documents_indexed", 0), status="active")


@router.post("/upload", response_model=List[UploadResponse])
async def upload(files: List[UploadFile] = File(...)):
    if len(files) > settings.MAX_FILES_PER_UPLOAD:
        raise HTTPException(status_code=400, detail=f"Max {settings.MAX_FILES_PER_UPLOAD} files per upload.")

    saved = []
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            continue
        filename = f.filename
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        saved.append((path, filename))

    if not saved:
        raise HTTPException(status_code=400, detail="No valid PDF files found.")

    results = await run_in_threadpool(ingest_many, saved)
    responses = []
    total_chunks = 0
    for r in results:
        if r.error and r.is_empty:
            responses.append(UploadResponse(filename=r.filename, status="empty", message=r.error))
            continue
        if r.error:
            responses.append(UploadResponse(filename=r.filename, status="error", message=r.error))
            continue
        n = add_chunks(r.chunks)
        total_chunks += n
        responses.append(UploadResponse(filename=r.filename, status="ok", chunks=n))
    return responses


@router.post("/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question is required.")
    chunks = retrieve_chunks(question, sources=request.sources or None)
    result = answer_question(question, chunks)
    return QueryResponse(**result)


@router.get("/insights")
async def insights(sources: str = ""):
    source_list = [s.strip() for s in sources.split(",") if s.strip()] or None
    return suggest_insights(sources=source_list)


@router.get("/about")
async def about():
    import os
    readme_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "README.md")
    readme_content = ""
    try:
        with open(readme_path, "r", encoding="utf-8") as f:
            readme_content = f.read()
    except Exception:
        readme_content = "DocIntel RAG System - A latency-optimized document intelligence system."
    return {
        "name": "DocIntel RAG System",
        "version": "1.0.0",
        "creator": "Divyansh Awasthi",
        "readme": readme_content,
    }


@router.get("/documents")
async def list_documents():
    from app.services.embeddings import get_collection
    collection = get_collection()
    results = collection.get(include=["metadatas"])
    sources = []
    if results and results.get("metadatas"):
        seen = set()
        for meta in results["metadatas"]:
            if meta and meta.get("source") and meta["source"] not in seen:
                seen.add(meta["source"])
                sources.append(meta["source"])
    return {"documents": sources}


@router.delete("/documents/{filename}")
async def delete_document(filename: str):
    deleted = delete_by_source(filename)
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass
    return {"deleted": deleted}


@router.post("/reset")
async def reset():
    reset_collection()
    for fname in os.listdir(UPLOAD_DIR):
        try:
            os.remove(os.path.join(UPLOAD_DIR, fname))
        except OSError:
            pass
    return {"status": "reset"}
