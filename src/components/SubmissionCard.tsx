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

  return (
    <article className="submission-card">
      <div className="card-image">
        <a 
          href={article.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="image-link"
        >
          <img 
            src={article.cover_image || placeholderCover}
            alt={article.cover_image ? article.title : 'No cover image'}
            loading="lazy"
            className={!article.cover_image ? 'placeholder-image' : ''}
          />
        </a>
      </div>
      
      <div className="card-content">
        <header className="card-header">
          <h3 className="card-title">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="title-link"
            >
              {article.title}
            </a>
          </h3>
          
          {article.description && (
            <p className="card-description">{article.description}</p>
          )}
        </header>
        
        <footer className="card-footer">
          <div className="author-section">
            <a 
              href={`https://dev.to/${article.user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="author-avatar-link"
            >
              <img 
                src={article.user.profile_image_90} 
                alt={article.user.name}
                className="author-avatar"
              />
            </a>
            <div className="author-details">
              <a 
                href={`https://dev.to/${article.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="author-name-link"
              >
                <span className="author-name">{article.user.name}</span>
              </a>
              
              <span className="publish-date">
                <span className="publish-label">Published:</span> <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              </span>
            </div>
          </div>
          
          {(article.user.github_username || article.user.twitter_username || article.user.website_url) && (
            <div className="author-social-links">
              {article.user.github_username && (
                <a 
                  href={`https://github.com/${article.user.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link github-link"
                  title={`${article.user.name} on GitHub`}
                >
                  <span className="social-icon">⚡</span>
                  <span className="social-text">GitHub</span>
                </a>
              )}
              {article.user.twitter_username && (
                <a 
                  href={`https://twitter.com/${article.user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link twitter-link"
                  title={`${article.user.name} on Twitter`}
                >
                  <span className="social-icon">🐦</span>
                  <span className="social-text">Twitter</span>
                </a>
              )}
              {article.user.website_url && (
                <a 
                  href={article.user.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link website-link"
                  title={`${article.user.name}'s website`}
                >
                  <span className="social-icon">🌐</span>
                  <span className="social-text">Website</span>
                </a>
              )}
            </div>
          )}
          
          <div className="stats-section">
            <div className="article-stats">
              <span className="stat stat-reactions">
                <span className="stat-icon">❤️</span>
                <span className="stat-value">{article.positive_reactions_count}</span>
              </span>
              <span className="stat stat-comments">
                <span className="stat-icon">💬</span>
                <span className="stat-value">{article.comments_count}</span>
              </span>
              <span className="reading-time">
                <span className="reading-time-icon">📖</span>
                <span className="reading-time-text">{article.reading_time_minutes} min read</span>
              </span>
            </div>
          </div>
          
          <div className="card-tags">
            {article.tag_list.slice(0, 4).map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
              </span>
            ))}
            {article.tag_list.length > 4 && (
              <span className="tag-chip tag-more">
                +{article.tag_list.length - 4}
              </span>
            )}
          </div>
        </footer>
      </div>
    </article>
  );
};
