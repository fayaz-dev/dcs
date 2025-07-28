import React from 'react';
import './TagSelector.css';

interface TagSelectorProps {
  tags: string[];
  selectedTag: string | null;
  onTagSelect: (tag: string) => void;
  onBackToTags: () => void;
  loading: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  onBackToTags,
  loading
}) => {
  if (selectedTag) {
    return (
      <div className="tag-selector">
        <button 
          className="back-button" 
          onClick={onBackToTags}
          disabled={loading}
        >
          ← Back to Tags
        </button>
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
