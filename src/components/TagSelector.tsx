import React from 'react';
import './TagSelector.css';

interface TagSelectorProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string) => void;
  onBackToTags: () => void;
  loading: boolean;
  // New props for announcements toggle
  hasAnnouncements?: boolean;
  showAnnouncements?: boolean;
  onToggleAnnouncements?: () => void;
  announcementsCount?: number;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  onBackToTags,
  loading,
  hasAnnouncements = false,
  showAnnouncements = true,
  onToggleAnnouncements,
  announcementsCount = 0
}) => {
  if (selectedTag) {
    return (
      <div className="tag-selector">
        <div className="tag-header">
          <button 
            className="back-button" 
            onClick={onBackToTags}
            disabled={loading}
          >
            ← Back to Tags
          </button>
          
          {hasAnnouncements && onToggleAnnouncements && (
            <div className="announcements-toggle">
              <button
                type="button"
                onClick={onToggleAnnouncements}
                className={`toggle-button ${showAnnouncements ? 'active' : ''}`}
                aria-label={showAnnouncements ? 'Hide announcements' : 'Show announcements'}
                disabled={loading}
              >
                <span className="toggle-icon">📢</span>
                <span className="toggle-text">
                  {showAnnouncements ? 'Hide' : 'Show'} Announcements
                </span>
                <span className="announcement-count">({announcementsCount})</span>
              </button>
            </div>
          )}
        </div>
        
        <h2 className="selected-tag">
          Submissions for: <span className="tag-name">#{selectedTag}</span>
        </h2>
      </div>
    );
  }

  return (
    <div className="tag-selector">
      <h2>Select a Challenge Tag</h2>
      <div className="tags-grid">
        {tags.map((tag) => (
          <button
            key={tag}
            className="tag-button"
            onClick={() => onTagSelect(tag)}
            disabled={loading}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
};
