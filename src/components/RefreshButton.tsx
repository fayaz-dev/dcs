import { useState } from 'react';
import './RefreshButton.css';

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
}

export function RefreshButton({ onRefresh, disabled = false, className = '' }: RefreshButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleClick = async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isRefreshing}
      className={`refresh-button ${className} ${isRefreshing ? 'refreshing' : ''}`}
      title="Refresh data"
      aria-label="Refresh data"
    >
      <span className="refresh-icon">🔁</span>
    </button>
  );
}
