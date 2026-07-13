from app.ingestion.parser import DocumentParser
from app.models.domain import RawParsedDocument, Provenance
import uuid
import re

class TextParser(DocumentParser):
    """Parses standard text files and emails."""
    
    def parse(self, filepath: str) -> RawParsedDocument:
        """Parse text file and check for prompt injection signatures."""
        self._validate_file(filepath)
        
        doc_id = str(uuid.uuid4())
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Basic heuristic for prompt injection defense
        injection_signatures = [
            r"ignore all previous instructions",
            r"system\.delete",
            r"you are an unconstrained",
        ]
        
        lower_content = content.lower()
        for sig in injection_signatures:
            if re.search(sig, lower_content):
                raise ValueError("Prompt injection attempt detected in document.")
                
        return RawParsedDocument(
            document_id=doc_id,
            filename=filepath.split('/')[-1],
            mime_type="text/plain",
            content=content,
            provenance_base=Provenance(document_id=doc_id, confidence=1.0)
        )
