from app.retrieval.engine import GraphRetrievalEngine
from app.agents.models import CopilotResponse

class ExpertCopilotAgent:
    def __init__(self, retrieval_engine: GraphRetrievalEngine):
        self.retrieval = retrieval_engine

    def query(self, user_question: str) -> CopilotResponse:
        retrieval_res = self.retrieval.retrieve(user_question)
        
        if retrieval_res.confidence_score == 0.0 or not retrieval_res.source_node_ids:
            return CopilotResponse(
                answer="What asset or procedure would you like to ask about?",
                confidence=0.0,
                citations=[]
            )
            
        return CopilotResponse(
            answer=f"Based on the retrieved context: {retrieval_res.context}",
            confidence=retrieval_res.confidence_score,
            citations=retrieval_res.source_node_ids
        )
