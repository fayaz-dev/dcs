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
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="refresh-icon"
      >
        <polyline points="23 4 23 10 17 10"></polyline>
        <polyline points="1 20 1 14 7 14"></polyline>
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M22.35 14.36A9 9 0 0 1 18.36 18.36L23 14"></path>
      </svg>
    </button>
  );
}
