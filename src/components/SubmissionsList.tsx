import React, { useState } from 'react';
import type { TagData } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { AnnouncementsList } from './AnnouncementsList';
import { TagInfo } from './TagInfo';
import './SubmissionsList.css';

interface SubmissionsListProps {
  tagData: TagData;
  showAnnouncements?: boolean;
}

type SortOption = 'latest' | 'popular' | 'comments';

export const SubmissionsList: React.FC<SubmissionsListProps> = ({ 
  tagData, 
  showAnnouncements = true 
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [searchTerm, setSearchTerm] = useState('');

  const sortedSubmissions = React.useMemo(() => {
    let filtered = tagData.submissions.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'popular':
        return [...filtered].sort((a, b) => b.positive_reactions_count - a.positive_reactions_count);
      case 'comments':
        return [...filtered].sort((a, b) => b.comments_count - a.comments_count);
      case 'latest':
      default:
        return [...filtered].sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );
    }
  }, [tagData.submissions, sortBy, searchTerm]);

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
    <div className="submissions-list">
      {/* Show announcements first if they exist and toggle is enabled */}
      {showAnnouncements && tagData.announcements && tagData.announcements.length > 0 && (
        <AnnouncementsList 
          announcements={tagData.announcements} 
          tagName={tagData.tag} 
        />
      )}
      
      <div className="list-header">
        <div className="submissions-count">
          <span className="count">{sortedSubmissions.length}</span>
          <span className="label">
            {sortedSubmissions.length === 1 ? 'submission' : 'submissions'}
          </span>
          <span className="fetch-info">
            • Last updated: {formatFetchDate(tagData.fetchedAt)}
          </span>
        </div>
        
        <div className="controls">
          {/* Tag info with dev.to link */}
          <TagInfo tagName={tagData.tag} />
          
          <div className="search-box">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="sort-controls">
            <span className="sort-label">
              <span className="sort-icon">⚡</span>
              Sort by
            </span>
            <div className="sort-dropdown-wrapper">
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="sort-select"
              >
                <option value="latest">🕒 Latest</option>
                <option value="popular">❤️ Most Popular</option>
                <option value="comments">💬 Most Comments</option>
              </select>
              <div className="sort-dropdown-arrow">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {sortedSubmissions.length === 0 ? (
        <div className="no-results">
          {searchTerm ? (
            <p>No submissions found matching "{searchTerm}"</p>
          ) : (
            <p>No submissions found for this tag.</p>
          )}
        </div>
      ) : (
        <div className="submissions-grid">
          {sortedSubmissions.map((article) => (
            <SubmissionCard key={article.id} article={article} currentTag={tagData.tag} />
          ))}
        </div>
      )}
    </div>
  );
};
