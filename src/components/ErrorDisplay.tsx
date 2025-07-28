import React from 'react';
import './ErrorDisplay.css';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Something went wrong</h3>
      <p className="error-message">{error}</p>
      
      {showRetry && onRetry && (
        <button className="retry-button" onClick={onRetry}>
          Try Again
        </button>
      )}
      
      <div className="error-help">
        <p>To fetch data, run the CLI command:</p>
        <code className="cli-command">npm run fetch &lt;tag-name&gt;</code>
      </div>
    </div>
  );
};
