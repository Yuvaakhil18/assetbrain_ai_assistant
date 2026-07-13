from app.agents.models import ComplianceFlag
from typing import List

class ComplianceAgent:
    def __init__(self) -> None:
        pass
        
    def check_procedure(self, procedure_text: str, procedure_node_id: str) -> List[ComplianceFlag]:
        """Check a procedure against regulations and flag gaps."""
        flags = []
        
        # Mocking a compliance check: if 'lockout' is missing
        if "lockout" not in procedure_text.lower():
            flags.append(ComplianceFlag(
                gap_description="Procedure does not mention LOTO (Lockout/Tagout).",
                regulation_reference="Factory Act, Sec 32",
                procedure_node_id=procedure_node_id,
                severity="CRITICAL"
            ))
            
        return flags
