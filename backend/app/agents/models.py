from pydantic import BaseModel
from typing import List, Literal

ActionStatus = Literal["PENDING", "APPROVED", "REJECTED", "EXECUTED"]

class CopilotResponse(BaseModel):
    answer: str
    confidence: float
    citations: List[str]

class ActionProposal(BaseModel):
    proposal_id: str
    description: str
    status: ActionStatus = "PENDING"
    evidence_nodes: List[str]

class ComplianceFlag(BaseModel):
    gap_description: str
    regulation_reference: str
    procedure_node_id: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
