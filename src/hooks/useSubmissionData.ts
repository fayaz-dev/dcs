import { useState, useEffect } from 'react';
import type { TagData, AppState } from '../types';

export function useSubmissionData() {
  const [state, setState] = useState<AppState>({
    selectedTag: null,
    availableTags: [],
    loading: true,
    error: null
  });

  const [tagData, setTagData] = useState<Map<string, TagData>>(new Map());

  // Load available tags
  useEffect(() => {
    loadAvailableTags();
    
    // Set up polling to check for updates
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/data/.refresh');
        if (response.ok) {
          const timestamp = await response.text();
          const lastCheck = localStorage.getItem('lastDataCheck');
          
          if (!lastCheck || timestamp !== lastCheck) {
            localStorage.setItem('lastDataCheck', timestamp);
            await loadAvailableTags();
            // Clear cached tag data to force reload
            setTagData(new Map());
          }
        }
      } catch {
        // Silent fail - polling is optional
      }
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadAvailableTags = async () => {
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
  };

  const loadTagSubmissions = async (tag: string) => {
    // Check if we already have this data
    if (tagData.has(tag)) {
      setState(prev => ({ ...prev, selectedTag: tag }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch(`/data/${tag}.json`);
      if (!response.ok) {
        throw new Error(`No data found for tag: ${tag}. Run the CLI to fetch it first.`);
      }
      
      const data: TagData = await response.json();
      
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
      
      setTagData(prev => new Map(prev).set(tag, data));
      setState(prev => ({ 
        ...prev, 
        selectedTag: tag, 
        loading: false 
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : `Failed to load submissions for ${tag}` 
      }));
    }
  };

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
    refreshTags: loadAvailableTags
  };
}
