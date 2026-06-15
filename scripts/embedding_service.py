import os

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


MODEL_NAME = os.getenv("SENTENCE_TRANSFORMER_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer(MODEL_NAME)
app = FastAPI(title="YUDHSVAH Embedding Service")


class EmbedRequest(BaseModel):
    text: str


@app.post("/embed")
def embed(request: EmbedRequest):
    embedding = model.encode([request.text])[0].tolist()
    return {"embedding": embedding}
