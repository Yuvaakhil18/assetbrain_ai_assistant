import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { CitationChip } from './CitationChip';

interface ComplianceAlertProps {
  gapDescription: string;
  regulationReference: string;
}

export const ComplianceAlert: React.FC<ComplianceAlertProps> = ({ gapDescription, regulationReference }) => {
  return (
    <div className="glass-panel compliance-alert">
      <div className="status-badge compliance-risk">
        <AlertOctagon size={16} /> Compliance Gap Detected
      </div>
      <p style={{ margin: '0 0 8px 0', fontWeight: 500, color: 'var(--text-primary)' }}>{gapDescription}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="label">Regulation:</span>
        <CitationChip nodeId={regulationReference} sourceExcerpt={`Official safety regulation text for ${regulationReference}`} />
      </div>
    </div>
  );
};
