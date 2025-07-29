import { useState } from 'react';
import { useSubmissionData } from './hooks/useSubmissionData';
import { TagSelector } from './components/TagSelector';
import { SubmissionsList } from './components/SubmissionsList';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ThemeToggle } from './components/ThemeToggle';
import { HeroImage } from './components/HeroImage';
import './App.css';

function App() {
  const {
    selectedTag,
    availableTags,
    loading,
    error,
    tagData,
    selectTag,
    refreshTags
  } = useSubmissionData();

  const [showAnnouncements, setShowAnnouncements] = useState(false);

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
              onTagSelect={selectTag}
              onBackToTags={() => selectTag(null)}
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

export default App;
