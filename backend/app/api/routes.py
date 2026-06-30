from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.concurrency import run_in_threadpool
from typing import List
import os
import shutil
from app.core.config import settings
from app.models.schemas import UploadResponse, QueryRequest, QueryResponse, StatusResponse
from app.services.ingestion import ingest_many
from app.services.embeddings import add_chunks, collection_stats, reset_collection
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
    chunks = retrieve_chunks(question)
    result = answer_question(question, chunks)
    return QueryResponse(**result)


@router.get("/insights")
async def insights():
    return suggest_insights()


@router.post("/reset")
async def reset():
    reset_collection()
    for fname in os.listdir(UPLOAD_DIR):
        try:
            os.remove(os.path.join(UPLOAD_DIR, fname))
        except OSError:
            pass
    return {"status": "reset"}
