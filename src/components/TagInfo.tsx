import React from 'react';
import './TagInfo.css';

interface TagInfoProps {
  tagName: string;
}

export const TagInfo: React.FC<TagInfoProps> = ({ tagName }) => {
  const devToUrl = `https://dev.to/t/${tagName}`;
  
  return (
    <div className="tag-info">
      <a
        href={devToUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="tag-info-button"
        aria-label={`View #${tagName} on dev.to`}
      >
        <span className="tag-info-icon">🏷️</span>
        <span className="tag-info-name">#{tagName}</span>
      </a>
    </div>
  );
};
