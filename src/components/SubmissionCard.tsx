import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ForemArticle } from '../types';
import './SubmissionCard.css';
import placeholderCover from '../assets/placeholder-cover.svg';

interface SubmissionCardProps {
  article: ForemArticle;
  currentTag: string;
  availableTags?: string[];
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ article, currentTag, availableTags = [] }) => {
  const navigate = useNavigate();
  
  // Use provided available tags, fallback to known challenge tags
  const challengeTags = availableTags.length > 0 ? availableTags : [
    'algoliachallenge', 'alibabachallenge', 'assemblyaichallenge', 
    'brightdatachallenge', 'hacktoberfestchallenge', 'permitchallenge',
    'pinatachallenge', 'postmarkchallenge'
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    const tagLower = tag.toLowerCase();
    if (challengeTags.includes(tagLower)) {
      e.preventDefault();
      navigate(`/${tagLower}`);
    }
    // If not a challenge tag, let the default behavior (external link) happen
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
          
          <span className="publish-date">
            <span className="publish-label">Published:</span> <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
          </span>
          
          {article.description && (
            <p className="card-description">{article.description}</p>
          )}
          
          <div className="description-separator"></div>
          
          <div className="content-meta">
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
              {article.tag_list
                .filter((tag) => {
                  const lowerTag = tag.toLowerCase();
                  // Filter out devchallenge and the current challenge tag
                  return lowerTag !== 'devchallenge' && lowerTag !== currentTag.toLowerCase();
                })
                .slice(0, 4)
                .map((tag) => (
                  <a 
                    key={tag} 
                    href={challengeTags.includes(tag.toLowerCase()) ? `/${tag.toLowerCase()}` : `https://dev.to/t/${tag}`}
                    target={challengeTags.includes(tag.toLowerCase()) ? '_self' : '_blank'}
                    rel={challengeTags.includes(tag.toLowerCase()) ? undefined : 'noopener noreferrer'}
                    className="tag-chip tag-link"
                    title={challengeTags.includes(tag.toLowerCase()) ? `Browse ${tag} submissions` : `Browse ${tag} posts on DEV Community`}
                    onClick={(e) => handleTagClick(tag, e)}
                  >
                    #{tag}
                  </a>
                ))}
              {article.tag_list.filter((tag) => {
                const lowerTag = tag.toLowerCase();
                return lowerTag !== 'devchallenge' && lowerTag !== currentTag.toLowerCase();
              }).length > 4 && (
                <span className="tag-chip tag-more">
                  +{article.tag_list.filter((tag) => {
                    const lowerTag = tag.toLowerCase();
                    return lowerTag !== 'devchallenge' && lowerTag !== currentTag.toLowerCase();
                  }).length - 4}
                </span>
              )}
            </div>
          </div>
        </header>
        
        <footer className="card-footer">
          <div className="author-section">
            <div className="author-main-info">
              <div className="author-avatar-container">
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
              </div>
              
              <div className="author-identity">
                <a 
                  href={`https://dev.to/${article.user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="author-name-link"
                >
                  <h4 className="author-name">{article.user.name}</h4>
                </a>
                <span className="author-username">@{article.user.username}</span>
              </div>
            </div>
            
            <div className="author-social-links">
              <a 
                href={`https://dev.to/${article.user.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link devto-link"
                title={`${article.user.name} on DEV Community`}
              >
                <span className="social-text">DEV.to</span>
              </a>
              
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
                  href={`https://x.com/${article.user.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link twitter-link"
                  title={`${article.user.name} on Twitter`}
                >
                  <span className="social-text">𝕏</span>
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
                  <span className="social-text">Web</span>
                </a>
              )}
            </div>
          </div>
        </footer>
      </div>
    </article>
  );
};
