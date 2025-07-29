import React from 'react';
import './TagHeader.css';

interface TagHeaderProps {
  tagName: string;
  submissionsCount: number;
  fetchedAt: string;
}

export const TagHeader: React.FC<TagHeaderProps> = ({ 
  tagName, 
  submissionsCount, 
  fetchedAt 
}) => {
  const formatFetchDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tag-header-card">
      <div className="tag-header-content">
        <div className="tag-header-info">
          <h2 className="selected-tag-title">
            <span className="tag-icon">🏷️</span>
            <span className="tag-name">#{tagName}</span>
          </h2>
          <p className="tag-description">Challenge submissions</p>
        </div>
        
        <div className="submissions-count">
          <span className="count">{submissionsCount}</span>
          <span className="label">
            {submissionsCount === 1 ? 'submission' : 'submissions'}
          </span>
          <span className="fetch-info">
            • Last updated: {formatFetchDate(fetchedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
