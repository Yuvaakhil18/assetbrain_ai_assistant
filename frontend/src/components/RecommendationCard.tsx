import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RecommendationCardProps {
  description: string;
  onApprove: () => void;
  onDismiss: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ description, onApprove, onDismiss }) => {
  return (
    <div className="glass-panel recommendation-card">
      <div className="status-badge needs-approval">
        <AlertTriangle size={16} /> Requires Approval
      </div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>Recommended Action</h3>
      <p style={{ margin: '0 0 16px 0' }}>{description}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button className="btn-primary" onClick={onApprove}>Approve</button>
        <button className="btn-secondary" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
};
