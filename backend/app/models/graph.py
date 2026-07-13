from pydantic import BaseModel, Field
from typing import Literal, Dict, Any
from app.models.domain import BaseEntity, Provenance

# Strict Entity Types
EntityType = Literal[
    "Asset", "Fault", "Fix", "Document", "Technician", 
    "WorkOrder", "RegulatoryRequirement", "InspectionRecord", "ProcessParameter"
]

class GraphEntity(BaseEntity):
    """An entity ready to be loaded into the Knowledge Graph."""
    type: EntityType
    properties: Dict[str, Any] = Field(default_factory=dict)

# Strict Relationship Types
RelationType = Literal[
    "HAS_FAULT", "RESOLVED_BY", "PERFORMED_BY", "MENTIONS", "GOVERNS", "DOCUMENTED_IN"
]

class GraphRelationship(BaseModel):
    """A directed edge in the Knowledge Graph."""
    id: str
    source_id: str
    target_id: str
    type: RelationType
    provenance: Provenance
    properties: Dict[str, Any] = Field(default_factory=dict)

class ExtractionResult(BaseModel):
    """The structured output from the LLM extraction pass."""
    entities: list[GraphEntity]
    relationships: list[GraphRelationship]
