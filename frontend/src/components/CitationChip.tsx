import React, { useState } from 'react';
import { FileText } from 'lucide-react';

interface CitationChipProps {
  nodeId: string;
  sourceExcerpt: string;
}

export const CitationChip: React.FC<CitationChipProps> = ({ nodeId, sourceExcerpt }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
      <button 
        className="citation-chip" 
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`Citation for ${nodeId}`}
      >
        <FileText size={12} /> {nodeId}
      </button>
      {expanded && (
        <div className="citation-content">
          <strong>Source context:</strong>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-primary)' }}>{sourceExcerpt}</p>
        </div>
      )}
    </div>
  );
};
