from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    APP_NAME: str = "DocIntel RAG"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama-3.1-8b-instant"

    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150

    TOP_K_DENSE: int = 20
    TOP_K_FINAL: int = 5
    RERANK_SCORE_THRESHOLD: float = 0.3

    DATA_DIR: str = "./data"
    CHROMA_DIR: str = "./data/chroma"

    MAX_FILE_SIZE_MB: int = 50
    MAX_FILES_PER_UPLOAD: int = 50

    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "https://div0011.github.io"]

    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"


settings = Settings()
