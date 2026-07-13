from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime, timezone

class Provenance(BaseModel):
    """Tracks the exact origin of any extracted entity or relationship."""
    document_id: str
    page_num: Optional[int] = None
    span: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)
    ingested_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BaseEntity(BaseModel):
    """Base model for all knowledge graph nodes."""
    id: str
    type: str
    provenance: Provenance

class RawParsedDocument(BaseModel):
    """The output of the ingestion layer before graph extraction."""
    document_id: str
    filename: str
    mime_type: str
    content: Any # string for text, dict for spreadsheet rows
    provenance_base: Provenance
