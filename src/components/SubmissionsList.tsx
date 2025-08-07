import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { TagData } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { AnnouncementsList } from './AnnouncementsList';
import { TagInfo } from './TagInfo';
import { TagHeader } from './TagHeader';
import { getRelevanceScores, clearExpiredCache } from '../utils/relevanceScore';
import './SubmissionsList.css';

interface SubmissionsListProps {
  tagData: TagData;
  showAnnouncements?: boolean;
  availableTags?: string[];
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
  showAnnouncements = true,
  availableTags = []
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevant');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [controlsHeight, setControlsHeight] = useState(100);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [initialAnimationComplete, setInitialAnimationComplete] = useState(false);
  const [relevanceScores, setRelevanceScores] = useState<Map<number, number>>(new Map());
  
  const controlsContainerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Memoized callbacks to prevent child re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSortChange = useCallback((value: SortOption) => {
    setSortBy(value);
  }, []);

  // Precompute relevance scores when submissions change
  useEffect(() => {
    const scores = getRelevanceScores(tagData.tag, tagData.submissions);
    setRelevanceScores(scores);
    
    // Clear expired cache on component mount
    clearExpiredCache();
  }, [tagData.tag, tagData.submissions]);

  // Memoized sorted submissions to prevent recalculation on unrelated renders
  const sortedSubmissions = React.useMemo(() => {
    // First deduplicate by ID to ensure no duplicates
    const uniqueSubmissions = tagData.submissions.reduce((acc, submission) => {
      if (!acc.find(s => s.id === submission.id)) {
        acc.push(submission);
      }
      return acc;
    }, [] as typeof tagData.submissions);

    let filtered = uniqueSubmissions.filter(article =>
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
          const scoreA = relevanceScores.get(a.id) || 0;
          const scoreB = relevanceScores.get(b.id) || 0;
          return scoreB - scoreA;
        });
      case 'latest':
      default:
        return [...filtered].sort((a, b) => 
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        );
    }
  }, [tagData.submissions, sortBy, searchTerm, relevanceScores]);

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

    // Set initial height - now both normal and sticky have same height
    const height = controlsContainer.offsetHeight;
    setControlsHeight(height);

    let timeoutId: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // Only make sticky when sentinel goes out of view at the TOP (user scrolled past controls)
        // but not when it goes out of view at the bottom (user is above controls)
        const shouldBeSticky = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        
        // Debounce the state change to prevent rapid toggling
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Mark as animated when becoming sticky for the first time
          if (shouldBeSticky && !hasAnimated) {
            setHasAnimated(true);
          }
          
          setIsSticky(shouldBeSticky);
        }, 16); // One frame delay to prevent flickering
      },
      {
        threshold: 0,
        rootMargin: '-10px 0px 0px 0px' // Small buffer to prevent rapid toggling at the exact edge
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
      clearTimeout(timeoutId);
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [isSticky, hasAnimated]); // Added hasAnimated as dependency

  return (
    <div className="submissions-list">
      {/* Show announcements if they exist and toggle is enabled */}
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
      
      {/* Sentinel element placed BEFORE controls to detect when user scrolls past this point */}
      <div ref={sentinelRef} className="controls-sentinel" />
      
      {/* Single controls container that uses CSS positioning - OUTSIDE of any transform containers */}
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
      </div>
      
      <div className="list-header">
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
          {sortedSubmissions.map((article, index) => (
            <SubmissionCard 
              key={`${article.id}-${index}`} 
              article={article} 
              currentTag={tagData.tag} 
              availableTags={availableTags}
            />
          ))}
        </div>
      )}
    </div>
  );
};
