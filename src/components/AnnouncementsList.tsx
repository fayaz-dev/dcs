import React from 'react';
import type { ForemArticle } from '../types';
import { AnnouncementCard } from './AnnouncementCard';
import './AnnouncementsList.css';

interface AnnouncementsListProps {
  announcements: ForemArticle[];
  tagName: string;
}

export const AnnouncementsList: React.FC<AnnouncementsListProps> = ({ 
  announcements, 
  tagName 
}) => {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  // Sort announcements by date (newest first)
  const sortedAnnouncements = [...announcements].sort((a, b) => 
    new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );

  return (
    <div className="announcements-list">
      <div className="announcements-header">
        <h2 className="announcements-title">
          <span className="title-icon">📢</span>
          Official Announcements
        </h2>
        <p className="announcements-subtitle">
          Latest updates from the DEV Team about the {tagName.replace('challenge', ' challenge')}
        </p>
      </div>
      
      <div className="announcements-grid">
        {sortedAnnouncements.map((announcement) => (
          <AnnouncementCard key={announcement.id} article={announcement} />
        ))}
      </div>
    </div>
  );
};
