# DocIntel RAG System

A professional, latency-optimized Retrieval-Augmented Generation (RAG) system for document intelligence. Upload 1–50 PDFs, ask natural language questions, and receive answers with exact citations.

## Architecture

```
Browser (React + Vite) → GitHub Pages
         │
         │  CORS-enabled REST API
         ▼
Backend (FastAPI) → EC2 / Docker
         │
         ├── PDF Ingestion (pypdf)
         ├── Chunking (sliding window, 800 chars / 150 overlap)
         ├── Embeddings (all-MiniLM-L6-v2 → ChromaDB)
         ├── Retrieval (dense top-20 → Cross-Encoder rerank → top-5)
         └── Generation (Groq Llama 3.1 8B Instant)
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Optimization Target | **Latency** | Local embeddings + dense ANN + small reranker + Groq delivers ~1–2s E2E |
| Embeddings | `all-MiniLM-L6-v2` (local) | Zero network latency, 384-dim, proven accuracy |
| Vector Store | ChromaDB (persistent) | Embedded, no separate infra, HNSW cosine ANN |
| Reranking | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Tiny (~80 MB), fast, CPU-friendly |
| LLM | Groq `llama-3.1-8b-instant` | Sub-200ms inference, production-grade API |
| Chunking | Sliding window 800/150 | Predictable latency, simple, works well for PDFs |
| Frontend Host | GitHub Pages | Zero-cost, SSL, custom domain ready |
| Backend Host | EC2 / Docker | Persistent, full filesystem access, low cost |

## Tradeoffs

- **Latency vs Accuracy:** Chose latency. Accuracy is kept acceptable via reranking and temperature 0.1. For higher accuracy, one would use a larger LLM (e.g., GPT-4o / Claude) and larger embedding model (e.g., Voyage), but latency would increase 5–10x.
- **Local vs Cloud Embeddings:** Local SentenceTransformers remove network dependency and cost, but are slightly less accurate than OpenAI/Voyage. For 10k+ docs, cloud embeddings may be worth revisiting.
- **Single-tenant:** Current design is single-user. Multi-tenant would need per-user Chroma collections, auth (JWT), and PostgreSQL metadata.

## What Would Break at Scale (10k+ docs)

- **Chroma single-node:** HNSW index memory grows linearly; query latency degrades. Solution: move to Qdrant / Weaviate / Pinecone.
- **In-memory reranker:** CrossEncoder loads into RAM and scores all pairs. At 10k docs, this becomes a bottleneck. Solution: precompute embeddings, use a faster late-interaction model (e.g., ColBERT), or cache top-k.
- **No query cache:** Repeated identical queries hit the LLM every time. Solution: Redis cache with TTL.
- **Synchronous ingestion:** Uploading 50 PDFs blocks the event loop. Solution: Celery / ARQ background workers.
- **SQLite metadata:** Doesn't support concurrent writes well. Solution: PostgreSQL.

## What Would Improve with More Time

1. Streaming response from LLM (SSE) for perceived latency
2. Async PDF ingestion with progress websockets
3. Multi-tenant auth (JWT + per-user Chroma collections)
4. Document management UI (delete, list, re-ingest)
5. OCR fallback for scanned PDFs (Tesseract / GPT-4o Vision)
6. Hybrid search (BM25 + dense) for better recall
7. A/B testing framework for reranker/LLM swaps
8. Observability: Prometheus metrics, distributed tracing

## Required API Keys & Credentials

| Service | Variable | Required | Notes |
|---------|----------|----------|-------|
| **Groq** | `GROQ_API_KEY` | ✅ Yes | Get from https://console.groq.com/keys |
| **OpenAI** | `OPENAI_API_KEY` | ❌ No | Optional fallback for embeddings |
| **Anthropic** | `ANTHROPIC_API_KEY` | ❌ No | Optional alternative LLM |
| **Voyage** | `VOYAGE_API_KEY` | ❌ No | Optional premium embeddings |

**Minimum requirement:** Only `GROQ_API_KEY` is required to run the full system.

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set GROQ_API_KEY
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Deploy Backend to EC2

```bash
# On EC2 instance
sudo cp deploy/backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now backend
```

### Deploy Frontend to GitHub Pages

Push to `main` branch. The GitHub Actions workflow will automatically build and deploy to `https://div0011.github.io/Documnet_Intelligence_RAG_System/`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/status` | Index statistics |
| POST | `/api/upload` | Upload PDFs (multipart) |
| POST | `/api/query` | Ask a question |
| GET | `/api/insights` | Get document insights |
| POST | `/api/reset` | Clear index and uploads |

## Design System

Inspired by modern SaaS documentation platforms (e.g., pengon.dev), with significant original modifications:

- **Color palette:** Off-white (`#F8F7F4`) background, pure black (`#0A0A0A`) text, muted gray accents
- **Typography:** Inter (Google Fonts), tight tracking on headings, relaxed line-height on body
- **Layout:** 12-column grid with generous whitespace, card-based surfaces, subtle 1px borders
- **Interactions:** Smooth hover states, focus rings, drag-and-drop upload zone
- **Proprietary differences:** No pengon.dev logo, brand colors, 3D shapes, or specific illustration style are used. This is an original implementation inspired by structural principles only.
