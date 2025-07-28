import React from 'react';
import type { ForemArticle } from '../types';
import './SubmissionCard.css';
import placeholderCover from '../assets/placeholder-cover.svg';

interface SubmissionCardProps {
  article: ForemArticle;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleCardClick = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="submission-card" onClick={handleCardClick}>
      <div className="card-image">
        <img 
          src={article.cover_image || placeholderCover}
          alt={article.cover_image ? article.title : 'No cover image'}
          loading="lazy"
          className={!article.cover_image ? 'placeholder-image' : ''}
        />
      </div>
      
      <div className="card-content">
        <h3 className="card-title">{article.title}</h3>
        
        {article.description && (
          <p className="card-description">{article.description}</p>
        )}
        
        <div className="card-meta">
          <div className="author-info">
            <img 
              src={article.user.profile_image_90} 
              alt={article.user.name}
              className="author-avatar"
            />
            <div className="author-details">
              <span className="author-name">{article.user.name}</span>
              <span className="publish-date">{formatDate(article.published_at)}</span>
            </div>
          </div>
          
          <div className="article-stats">
            <span className="stat">
              ❤️ {article.positive_reactions_count}
            </span>
            <span className="stat">
              💬 {article.comments_count}
            </span>
            <span className="reading-time">
              ⏱️ {article.reading_time_minutes} min read
            </span>
          </div>
        </div>
        
        <div className="card-tags">
          {article.tag_list.slice(0, 5).map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};
