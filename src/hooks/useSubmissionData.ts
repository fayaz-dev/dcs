import { useState, useEffect, useCallback } from 'react';
import type { TagData, AppState } from '../types';
import { safeGetItem, safeSetItem } from '../utils/localStorage';

export function useSubmissionData(initialTag?: string) {
  const [state, setState] = useState<AppState>({
    selectedTag: initialTag || null,
    availableTags: [],
    loading: true,
    error: null
  });

  const [tagData, setTagData] = useState<Map<string, TagData>>(new Map());

  const loadAvailableTags = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/data/tags.json');
      if (!response.ok) {
        throw new Error('No tags data found. Run the CLI to fetch submissions first.');
      }
      
      const tags: string[] = await response.json();
      setState(prev => ({ 
        ...prev, 
        availableTags: tags, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load tags' 
      }));
    }
  }, []);

  const loadTagSubmissions = useCallback(async (tag: string) => {
    // Check if we already have this data
    setTagData(prev => {
      if (prev.has(tag)) {
        // Data exists in cache, just update selectedTag without loading state
        setState(state => ({ ...state, selectedTag: tag }));
        return prev;
      }
      
      // Data doesn't exist, start loading
      setState(state => ({ ...state, loading: true, error: null, selectedTag: tag }));
      
      // Async loading
      (async () => {
        try {
          const response = await fetch(`/data/${tag}.json`);
          if (!response.ok) {
            throw new Error(`No data found for tag: ${tag}. Run the CLI to fetch it first.`);
          }
          
          const data: TagData = await response.json();
          
          // Deduplicate submissions by ID to prevent React key conflicts
          const uniqueSubmissions = data.submissions.reduce((acc, submission) => {
            if (!acc.find(s => s.id === submission.id)) {
              acc.push(submission);
            }
            return acc;
          }, [] as typeof data.submissions);
          
          data.submissions = uniqueSubmissions;
          
          // Try to load announcements separately if they exist
          try {
            const announcementsResponse = await fetch(`/data/${tag}-announcements.json`);
            if (announcementsResponse.ok) {
              const announcementsData = await announcementsResponse.json();
              data.announcements = announcementsData.announcements;
            }
          } catch {
            // No announcements file, that's okay
          }
          
          setTagData(prevData => new Map(prevData).set(tag, data));
          setState(prevState => ({ 
            ...prevState, 
            loading: false 
          }));
        } catch (error) {
          setState(prevState => ({ 
            ...prevState, 
            loading: false, 
            error: error instanceof Error ? error.message : `Failed to load submissions for ${tag}` 
          }));
        }
      })();
      
      return prev;
    });
  }, []);

  // Load available tags on mount only
  useEffect(() => {
    loadAvailableTags();
  }, [loadAvailableTags]);

  // Manual refresh function for the refresh button
  const manualRefresh = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/data/.refresh');
      if (response.ok) {
        const timestamp = await response.text();
        const lastCheck = safeGetItem('lastDataCheck');
        
        // Initialize lastCheck with current timestamp on first run to avoid immediate reload
        if (lastCheck === null) {
          safeSetItem('lastDataCheck', timestamp);
          return; // No reload needed on first run
        }
        
        if (timestamp !== lastCheck) {
          safeSetItem('lastDataCheck', timestamp);
          await loadAvailableTags();
          // Clear cached tag data to force reload
          setTagData(new Map());
        }
      }
    } catch {
      // Silent fail - polling is optional
    }
  }, [loadAvailableTags]);

  // Load initial tag data if provided - with better conditional logic
  useEffect(() => {
    if (initialTag && state.availableTags.length > 0) {
      // Only try to load if the tag exists in available tags and we don't already have it
      if (state.availableTags.includes(initialTag) && !tagData.has(initialTag)) {
        loadTagSubmissions(initialTag);
      } else if (state.availableTags.includes(initialTag) && tagData.has(initialTag)) {
        // Tag exists and data is cached, just update the selected tag
        setState(prev => ({ ...prev, selectedTag: initialTag }));
      }
    }
  }, [initialTag, state.availableTags.length, loadTagSubmissions, tagData]);

  const selectTag = (tag: string | null) => {
    if (tag === null) {
      setState(prev => ({ ...prev, selectedTag: null, error: null }));
    } else {
      loadTagSubmissions(tag);
    }
  };

  const getCurrentTagData = (): TagData | null => {
    if (!state.selectedTag) return null;
    return tagData.get(state.selectedTag) || null;
  };

  return {
    ...state,
    tagData: getCurrentTagData(),
    selectTag,
    refreshTags: loadAvailableTags,
    manualRefresh
  };
}
