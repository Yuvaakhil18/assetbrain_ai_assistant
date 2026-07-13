import csv
from app.ingestion.parser import DocumentParser
from app.models.domain import RawParsedDocument, Provenance
import uuid

class SpreadsheetParser(DocumentParser):
    """Parses CSV and Excel files (schema-aware, no LLM)."""
    
    def parse(self, filepath: str) -> RawParsedDocument:
        """Parse a CSV file and return structured rows."""
        self._validate_file(filepath)
        
        doc_id = str(uuid.uuid4())
        rows = []
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                rows.append(row)
                
        return RawParsedDocument(
            document_id=doc_id,
            filename=filepath.split('/')[-1],
            mime_type="text/csv",
            content=rows,
            provenance_base=Provenance(document_id=doc_id, confidence=1.0)
        )
