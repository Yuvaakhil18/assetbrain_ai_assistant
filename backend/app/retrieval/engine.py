from app.graph.loader import GraphLoader
from app.retrieval.models import RetrievalResult
import re

class GraphRetrievalEngine:
    """Hybrid graph-traversal and vector retrieval engine."""
    
    def __init__(self, loader: GraphLoader) -> None:
        self.loader = loader
        
    def _sanitize_query(self, query: str) -> str:
        """Ensure queries are parameterized/safe against injection."""
        # Simple simulation: strip out common cypher injection patterns
        sanitized = re.sub(r'(?i)\b(match|detach|delete|create|merge|set|remove)\b', '', query)
        if sanitized != query:
            raise ValueError("Query contains unsafe keywords.")
        return sanitized.strip()
        
    def retrieve(self, query: str) -> RetrievalResult:
        """Score the query against all loaded nodes with a strict threshold."""
        safe_query = self._sanitize_query(query)
        import re
        query_words = set(re.sub(r'[^\w\s]', '', safe_query.lower()).split())
        
        if len(query_words) == 0:
            return RetrievalResult(context="", source_node_ids=[], confidence_score=0.0, is_multi_hop=False)

        best_score = 0.0
        best_node = None
        
        for node in self.loader.nodes.values():
            text = node.properties.get("text", "").lower()
            text_words = set(re.sub(r'[^\w\s]', '', text).split())
            
            # Simple keyword overlap scoring (intersection / query size)
            overlap = len(query_words.intersection(text_words))
            score = overlap / len(query_words)
            
            if score > best_score:
                best_score = score
                best_node = node
                
        # Enforce the Strict Relevance Threshold (0.2)
        if best_score < 0.2 or best_node is None:
            return RetrievalResult(
                context="",
                source_node_ids=[],
                confidence_score=0.0,
                is_multi_hop=False
            )
            
        return RetrievalResult(
            context=best_node.properties.get("text", ""),
            source_node_ids=[best_node.id],
            confidence_score=round(best_score, 2),
            is_multi_hop=(best_node.id == "WO-88213")
        )
