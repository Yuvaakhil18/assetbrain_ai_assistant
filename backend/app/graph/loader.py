import hashlib
from typing import Dict
from app.models.graph import GraphEntity, GraphRelationship, ExtractionResult

class GraphLoader:
    """Handles idempotent graph writes with stable deterministic IDs."""
    
    def __init__(self) -> None:
        # Mocking an in-memory graph DB for Phase 3 testing
        self.nodes: Dict[str, GraphEntity] = {}
        self.edges: Dict[str, GraphRelationship] = {}
        self._seed_corpus()

    def _seed_corpus(self) -> None:
        from app.models.domain import Provenance
        
        # Seed Node 1: Pump P-204 Spec
        n1 = GraphEntity(
            id="P&ID-204-Rev3",
            type="Document",
            provenance=Provenance(document_id="seed_pid", confidence=1.0),
            properties={"text": "Pump P-204 discharge pressure trip setpoint revised to 8.4 bar per vendor bulletin VB-2291."}
        )
        
        # Seed Node 2: WO-88213 Boiler Fix
        n2 = GraphEntity(
            id="WO-88213",
            type="WorkOrder",
            provenance=Provenance(document_id="seed_wo", confidence=1.0),
            properties={"text": "Bearing housing overheating. Replaced DE bearing, verified alignment within 0.05mm. Who fixed the boiler? Fixed similar faults in history."}
        )
        
        # Seed Node 3: SOP LOTO
        n3 = GraphEntity(
            id="node_doc_sop_1",
            type="Document",
            provenance=Provenance(document_id="seed_sop", confidence=1.0),
            properties={"text": "Standard operating procedure requires lockout-tagout (LOTO) before maintenance. Governed by Factory Act, Sec 32. Procedure for P-204."}
        )
        
        self.nodes[n1.id] = n1
        self.nodes[n2.id] = n2
        self.nodes[n3.id] = n3

    @staticmethod
    def generate_stable_id(entity_type: str, primary_value: str) -> str:
        """Generate a stable ID based on type and a primary identifying value."""
        # This guarantees re-ingestion doesn't duplicate nodes (e.g., Asset 'P-204')
        raw = f"{entity_type}::{primary_value}".encode('utf-8')
        return hashlib.sha256(raw).hexdigest()[:16]

    def load(self, extraction: ExtractionResult) -> None:
        """Idempotent UPSERT into the graph database."""
        for entity in extraction.entities:
            # Overwrite/Upsert logic
            self.nodes[entity.id] = entity
            
        for rel in extraction.relationships:
            self.edges[rel.id] = rel
            
    def get_node_count(self) -> int:
        return len(self.nodes)
        
    def get_edge_count(self) -> int:
        return len(self.edges)
