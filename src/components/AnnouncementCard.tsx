import React from 'react';
import type { ForemArticle } from '../types';
import './AnnouncementCard.css';

interface AnnouncementCardProps {
  article: ForemArticle;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishDate = new Date(dateString);
    const diffInMs = now.getTime() - publishDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <article className="announcement-card">
      <div className="announcement-header">
        <div className="announcement-badge">
          <span className="badge-icon">📢</span>
          <span className="badge-text">Announcement</span>
        </div>
        <div className="announcement-meta">
          <span className="announcement-date">{formatDate(article.published_at)}</span>
          <span className="announcement-time-ago">{getTimeAgo(article.published_at)}</span>
        </div>
      </div>
      
      <div className="announcement-content">
        <h3 className="announcement-title">
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="announcement-link"
          >
            {article.title}
          </a>
        </h3>
        
        {article.description && (
          <p className="announcement-description">{article.description}</p>
        )}
        
        <div className="announcement-author">
          <img 
            src={article.organization?.profile_image_90 || article.user.profile_image_90} 
            alt={article.organization?.name || article.user.name}
            className="author-avatar"
          />
          <div className="author-info">
            <span className="author-name">
              {article.organization?.name || article.user.name}
            </span>
            {article.organization && (
              <span className="organization-badge">DEV Team</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="announcement-stats">
        <div className="stat">
          <span className="stat-icon">❤️</span>
          <span className="stat-count">{article.positive_reactions_count}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">💬</span>
          <span className="stat-count">{article.comments_count}</span>
        </div>
        <div className="stat">
          <span className="stat-icon">⏱️</span>
          <span className="stat-count">{article.reading_time_minutes} min read</span>
        </div>
      </div>
    </article>
  );
};
