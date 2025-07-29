import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TagData } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { AnnouncementsList } from './AnnouncementsList';
import { TagInfo } from './TagInfo';
import { TagHeader } from './TagHeader';
import './SubmissionsList.css';

interface SubmissionsListProps {
  tagData: TagData;
  showAnnouncements?: boolean;
}

type SortOption = 'latest' | 'popular' | 'comments' | 'relevant';

// Single Controls Component that uses CSS positioning instead of DOM recreation
const ControlsContent = React.memo<{
  tagName: string;
  searchTerm: string;
  sortBy: SortOption;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  showInitialAnimation?: boolean;
}>(({ tagName, searchTerm, sortBy, onSearchChange, onSortChange, showInitialAnimation = false }) => (
  <div className={`controls ${showInitialAnimation ? 'initial-animate' : ''}`}>
    <TagInfo tagName={tagName} />
    
    <div className="search-box">
      <input
        type="text"
        placeholder="Search submissions..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
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
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="sort-select"
        >
          <option value="latest">🕒 Latest</option>
          <option value="popular">❤️ Most Popular</option>
          <option value="comments">💬 Most Comments</option>
          <option value="relevant">⭐ Relevant</option>
        </select>
        <div className="sort-dropdown-arrow">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
));

ControlsContent.displayName = 'ControlsContent';

export const SubmissionsList: React.FC<SubmissionsListProps> = ({ 
  tagData, 
  showAnnouncements = true 
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [controlsHeight, setControlsHeight] = useState(100);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Memoized callbacks to prevent child re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
  }, []);

  // Memoized sorted submissions to prevent recalculation on unrelated renders
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
      case 'relevant':
        return [...filtered].sort((a, b) => {
          // Calculate relevance score (100 points total)
          const calculateRelevanceScore = (article: any) => {
            const maxReactions = Math.max(...filtered.map(a => a.positive_reactions_count));
            const maxComments = Math.max(...filtered.map(a => a.comments_count));
            
            // Get the most recent date (edited_at or published_at)
            const getRecentDate = (article: any) => {
              const editedDate = article.edited_at ? new Date(article.edited_at).getTime() : 0;
              const publishedDate = new Date(article.published_at).getTime();
              return Math.max(editedDate, publishedDate);
            };
            
            const articleRecentDate = getRecentDate(article);
            const maxRecentDate = Math.max(...filtered.map(getRecentDate));
            const minRecentDate = Math.min(...filtered.map(getRecentDate));
            
            // Calculate scores (avoid division by zero)
            const reactionScore = maxReactions > 0 ? (article.positive_reactions_count / maxReactions) * 50 : 0;
            const commentScore = maxComments > 0 ? (article.comments_count / maxComments) * 30 : 0;
            const recencyScore = maxRecentDate > minRecentDate ? 
              ((articleRecentDate - minRecentDate) / (maxRecentDate - minRecentDate)) * 20 : 20;
            
            return reactionScore + commentScore + recencyScore;
          };
          
          return calculateRelevanceScore(b) - calculateRelevanceScore(a);
        });
      case 'latest':
      default:
        return [...filtered].sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );
    }
  }, [tagData.submissions, sortBy, searchTerm]);

  // Mark initial animation as complete after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialAnimationComplete(true);
    }, 1300); // Animation duration + delay (0.8s + 0.5s)
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const controlsContainer = controlsContainerRef.current;
    
    if (!sentinel || !controlsContainer) return;

    // Set initial height
    const height = controlsContainer.offsetHeight;
    setControlsHeight(height);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only make sticky when sentinel goes out of view at the TOP (user scrolled past controls)
        // but not when it goes out of view at the bottom (user is above controls)
        const shouldBeSticky = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        
        // Mark as animated when becoming sticky for the first time
        if (shouldBeSticky && !hasAnimated) {
          setHasAnimated(true);
        }
        
        setIsSticky(shouldBeSticky);
      },
      {
        threshold: 0,
        rootMargin: '0px'
      }
    );

    observer.observe(sentinel);

    const handleResize = () => {
      if (!isSticky && controlsContainer) {
        const height = controlsContainer.offsetHeight;
        setControlsHeight(height);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isSticky, hasAnimated]); // Added hasAnimated as dependency

  return (
    <div className="submissions-list">
      {/* Show announcements first if they exist and toggle is enabled */}
      {showAnnouncements && tagData.announcements && tagData.announcements.length > 0 && (
        <AnnouncementsList 
          announcements={tagData.announcements} 
          tagName={tagData.tag} 
        />
      )}
      
      {/* Tag header card with count */}
      <TagHeader 
        tagName={tagData.tag}
        submissionsCount={sortedSubmissions.length}
        fetchedAt={tagData.fetchedAt}
      />
      
      <div className="list-header">
        {/* Single controls container that uses CSS positioning */}
        <div 
          className={`controls-container ${isSticky ? 'sticky' : ''} ${hasAnimated ? 'animate-in' : ''}`}
          ref={controlsContainerRef}
        >
          <ControlsContent
            tagName={tagData.tag}
            searchTerm={searchTerm}
            sortBy={sortBy}
            onSearchChange={handleSearchChange}
            onSortChange={handleSortChange}
            showInitialAnimation={!initialAnimationComplete}
          />
          
          {/* Sentinel element placed at the bottom of controls to detect when user scrolls past */}
          <div ref={sentinelRef} className="controls-sentinel" />
        </div>
        
        {/* Spacer to maintain layout when controls become sticky */}
        {isSticky && <div className="controls-spacer" style={{ height: `${controlsHeight}px` }} />}
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
