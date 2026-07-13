from pydantic import BaseModel, Field
from typing import List

class RetrievalResult(BaseModel):
    """The result of a query against the knowledge graph."""
    context: str
    source_node_ids: List[str] = Field(default_factory=list)
    confidence_score: float = Field(ge=0.0, le=1.0)
    
    # If the answer required multiple hops to reach, flag it.
    is_multi_hop: bool = False
