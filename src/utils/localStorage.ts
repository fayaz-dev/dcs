/**
 * Safe localStorage utilities with fallback for when localStorage is not available
 */

let isLocalStorageAvailable: boolean | null = null;
let hasNotifiedUser = false;

/**
 * Check if localStorage is available and working
 */
function checkLocalStorageAvailability(): boolean {
  if (isLocalStorageAvailable !== null) {
    return isLocalStorageAvailable;
  }

  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
    return true;
  } catch (error) {
    isLocalStorageAvailable = false;
    return false;
  }
}

/**
 * Show user notification about localStorage not being available
 */
function notifyUserAboutLocalStorage(): void {
  if (hasNotifiedUser) return;
  
  hasNotifiedUser = true;
  
  // Create a simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff6b6b;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    max-width: 300px;
    line-height: 1.4;
  `;
  notification.textContent = 'Local storage is not available. Some features like theme preferences and data caching may not work properly.';
  
  document.body.appendChild(notification);
  
  // Remove after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 10000);
}

/**
 * Safe localStorage.getItem with fallback
 */
export function safeGetItem(key: string): string | null {
  if (!checkLocalStorageAvailability()) {
    if (!hasNotifiedUser) {
      notifyUserAboutLocalStorage();
    }
    return null;
  }

  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn('Failed to get item from localStorage:', error);
    return null;
  }
}

/**
 * Safe localStorage.setItem with fallback
 */
export function safeSetItem(key: string, value: string): boolean {
  if (!checkLocalStorageAvailability()) {
    if (!hasNotifiedUser) {
      notifyUserAboutLocalStorage();
    }
    return false;
  }

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Failed to set item in localStorage:', error);
    return false;
  }
}

/**
 * Safe localStorage.removeItem with fallback
 */
export function safeRemoveItem(key: string): boolean {
  if (!checkLocalStorageAvailability()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to remove item from localStorage:', error);
    return false;
  }
}

/**
 * Check if we're running on localhost
 */
export function isLocalhost(): boolean {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' || 
         window.location.hostname === '::1';
}

/**
 * Safe localStorage operations for iterating over keys
 */
export function safeIterateKeys(callback: (key: string) => void): void {
  if (!checkLocalStorageAvailability()) {
    return;
  }

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        callback(key);
      }
    }
  } catch (error) {
    console.warn('Failed to iterate localStorage keys:', error);
  }
}

/**
 * Get localStorage availability status
 */
export function getLocalStorageStatus(): { available: boolean; notified: boolean } {
  return {
    available: checkLocalStorageAvailability(),
    notified: hasNotifiedUser
  };
}
