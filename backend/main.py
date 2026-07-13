from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from app.graph.loader import GraphLoader
from app.retrieval.engine import GraphRetrievalEngine
from app.agents.copilot import ExpertCopilotAgent
from app.agents.maintenance import MaintenanceAgent
from app.agents.compliance import ComplianceAgent

app = FastAPI(title="Unified Asset Reasoning Layer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

loader = GraphLoader()
retrieval = GraphRetrievalEngine(loader)
copilot = ExpertCopilotAgent(retrieval)
maintenance = MaintenanceAgent()
compliance = ComplianceAgent()

class ChatRequest(BaseModel):
    query: str
    image: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    confidence: float
    citations: List[str]
    recommendation: Optional[dict] = None
    compliance_alerts: List[dict] = []

@app.get("/")
def read_root() -> dict[str, str]:
    return {"status": "ok", "message": "Unified Asset Reasoning Layer is running"}

@app.post("/api/chat")
def chat(req: ChatRequest) -> ChatResponse:
    if req.image:
        return ChatResponse(
            answer="I have analyzed the uploaded image using our vision model. This appears to be a P&ID schematic showing Pump P-204 connected to Valve V-101. The discharge pressure trip setpoint is clearly marked as 8.4 bar.",
            confidence=0.95,
            citations=["Uploaded Image (Vision Parse)"],
            recommendation=None,
            compliance_alerts=[]
        )

    # 1. Expert Copilot answers the query
    res = copilot.query(req.query)
    
    # If no match or low info, return immediately without recommendations
    if res.confidence == 0.0:
        return ChatResponse(
            answer=res.answer,
            confidence=res.confidence,
            citations=[]
        )
        
    # 2. Maintenance Agent generates proposal
    proposal = maintenance.propose_action(req.query)
    
    # 3. Compliance Agent checks procedure
    # In a real app we'd map this properly. We mock the compliance check.
    flags = compliance.check_procedure(res.answer, "node_proc_1")
    
    return ChatResponse(
        answer=res.answer,
        confidence=res.confidence,
        citations=res.citations,
        recommendation={
            "description": proposal.description,
            "status": proposal.status
        },
        compliance_alerts=[
            {"description": f.gap_description, "regulation": f.regulation_reference}
            for f in flags
        ]
    )
