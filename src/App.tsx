import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { useSubmissionData } from './hooks/useSubmissionData';
import { TagSelector } from './components/TagSelector';
import { SubmissionsList } from './components/SubmissionsList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { HeroImage } from './components/HeroImage';
import './App.css';

// Main app content component that handles tag-based routing
function AppContent() {
  const { tag } = useParams<{ tag?: string }>();
  const navigate = useNavigate();
  
  const {
    selectedTag,
    availableTags,
    loading,
    error,
    tagData,
    selectTag,
    refreshTags
  } = useSubmissionData(tag);

  const [showAnnouncements, setShowAnnouncements] = useState(false);

  // Handle URL changes and sync with selected tag
  useEffect(() => {
    if (tag && tag !== selectedTag) {
      // URL has a tag but it's different from current selection
      selectTag(tag);
    } else if (!tag && selectedTag) {
      // URL has no tag but we have a selection, clear it
      selectTag(null);
    }
  }, [tag, selectedTag, selectTag]);

  // Check if the URL tag is valid when available tags are loaded
  useEffect(() => {
    if (tag && availableTags.length > 0 && !availableTags.includes(tag)) {
      // Invalid tag in URL, redirect to home
      navigate('/');
    }
  }, [tag, availableTags, navigate]);

  // Handle tag selection with URL navigation
  const handleTagSelect = (newTag: string) => {
    navigate(`/${newTag}`);
  };

  // Handle back to tags with URL navigation
  const handleBackToTags = () => {
    navigate('/');
  };

  return (
    <div className="app">
      <ThemeToggle />
      
      <header className="app-header">
        <HeroImage />
        <h1 className="app-title">Dev Challenge Submissions</h1>
      </header>

      <main className="app-main">
        {error ? (
          <ErrorDisplay 
            error={error} 
            onRetry={selectedTag ? () => selectTag(selectedTag) : refreshTags}
          />
        ) : loading ? (
          <LoadingSpinner 
            message={
              selectedTag 
                ? `Loading submissions for #${selectedTag}...`
                : 'Loading available tags...'
            }
          />
        ) : (
          <>
            <TagSelector
              tags={availableTags}
              selectedTag={selectedTag}
              onTagSelect={handleTagSelect}
              onBackToTags={handleBackToTags}
              loading={loading}
              hasAnnouncements={tagData?.announcements && tagData.announcements.length > 0}
              showAnnouncements={showAnnouncements}
              onToggleAnnouncements={() => setShowAnnouncements(!showAnnouncements)}
              announcementsCount={tagData?.announcements?.length || 0}
            />

            {tagData && (
              <SubmissionsList 
                tagData={tagData} 
                showAnnouncements={showAnnouncements}
                availableTags={availableTags}
              />
            )}
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          Data fetched from{' '}
          <a 
            href="https://dev.to" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            dev.to
          </a>{' '}
          using the Forem API
        </p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppContent />} />
        <Route path="/:tag" element={<AppContent />} />
      </Routes>
    </Router>
  );
}

export default App;
