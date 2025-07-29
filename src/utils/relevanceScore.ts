import type { ForemArticle } from '../types';

interface RelevanceData {
  articleId: number;
  score: number;
  dataHash: string;
}

interface CachedRelevanceData {
  tag: string;
  dataHash: string;
  scores: RelevanceData[];
  timestamp: number;
}

const CACHE_EXPIRY_HOURS = 24;
const STORAGE_KEY_PREFIX = 'relevance_cache_';

/**
 * Generate a simple hash from the submissions data to detect changes
 */
function generateDataHash(submissions: ForemArticle[]): string {
  const dataString = submissions.map(article => 
    `${article.id}-${article.positive_reactions_count}-${article.comments_count}-${article.edited_at || ''}-${article.published_at}`
  ).join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

/**
 * Get the most recent date (edited_at or published_at)
 */
function getRecentDate(article: ForemArticle): number {
  const editedDate = article.edited_at ? new Date(article.edited_at).getTime() : 0;
  const publishedDate = new Date(article.published_at).getTime();
  return Math.max(editedDate, publishedDate);
}

/**
 * Calculate relevance scores for all submissions
 */
function calculateRelevanceScores(submissions: ForemArticle[]): Map<number, number> {
  if (submissions.length === 0) return new Map();

  const maxReactions = Math.max(...submissions.map(a => a.positive_reactions_count));
  const maxComments = Math.max(...submissions.map(a => a.comments_count));
  
  const recentDates = submissions.map(getRecentDate);
  const maxRecentDate = Math.max(...recentDates);
  const minRecentDate = Math.min(...recentDates);
  
  const scores = new Map<number, number>();
  
  submissions.forEach(article => {
    const articleRecentDate = getRecentDate(article);
    
    // Calculate scores (avoid division by zero)
    const reactionScore = maxReactions > 0 ? (article.positive_reactions_count / maxReactions) * 50 : 0;
    const commentScore = maxComments > 0 ? (article.comments_count / maxComments) * 30 : 0;
    const recencyScore = maxRecentDate > minRecentDate ? 
      ((articleRecentDate - minRecentDate) / (maxRecentDate - minRecentDate)) * 20 : 20;
    
    const totalScore = reactionScore + commentScore + recencyScore;
    scores.set(article.id, totalScore);
  });
  
  return scores;
}

/**
 * Load cached relevance scores from localStorage
 */
function loadCachedScores(tag: string, dataHash: string): Map<number, number> | null {
  try {
    const storageKey = STORAGE_KEY_PREFIX + tag;
    const cached = localStorage.getItem(storageKey);
    
    if (!cached) return null;
    
    const cachedData: CachedRelevanceData = JSON.parse(cached);
    
    // Check if cache is valid
    const now = Date.now();
    const cacheAge = (now - cachedData.timestamp) / (1000 * 60 * 60); // hours
    
    if (cacheAge > CACHE_EXPIRY_HOURS || cachedData.dataHash !== dataHash) {
      return null;
    }
    
    // Convert to Map
    const scores = new Map<number, number>();
    cachedData.scores.forEach(item => {
      scores.set(item.articleId, item.score);
    });
    
    return scores;
  } catch (error) {
    console.warn('Failed to load cached relevance scores:', error);
    return null;
  }
}

/**
 * Save relevance scores to localStorage
 */
function saveCachedScores(tag: string, dataHash: string, scores: Map<number, number>): void {
  try {
    const storageKey = STORAGE_KEY_PREFIX + tag;
    const scoresArray: RelevanceData[] = Array.from(scores.entries()).map(([articleId, score]) => ({
      articleId,
      score,
      dataHash
    }));
    
    const cachedData: CachedRelevanceData = {
      tag,
      dataHash,
      scores: scoresArray,
      timestamp: Date.now()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(cachedData));
  } catch (error) {
    console.warn('Failed to save relevance scores to cache:', error);
  }
}

/**
 * Get relevance scores for submissions with caching
 */
export function getRelevanceScores(tag: string, submissions: ForemArticle[]): Map<number, number> {
  const dataHash = generateDataHash(submissions);
  
  // Try to load from cache first
  const cachedScores = loadCachedScores(tag, dataHash);
  if (cachedScores) {
    return cachedScores;
  }
  
  // Calculate fresh scores
  const scores = calculateRelevanceScores(submissions);
  
  // Save to cache
  saveCachedScores(tag, dataHash, scores);
  
  return scores;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  try {
    const keysToRemove: string[] = [];
    const now = Date.now();
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const cachedData: CachedRelevanceData = JSON.parse(cached);
            const cacheAge = (now - cachedData.timestamp) / (1000 * 60 * 60); // hours
            
            if (cacheAge > CACHE_EXPIRY_HOURS) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('Failed to clear expired cache:', error);
  }
}
