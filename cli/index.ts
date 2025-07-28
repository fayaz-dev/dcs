#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { ForemArticle, TagData } from '../src/types/index.js';

const FOREM_API_BASE = 'https://dev.to/api';
const DATA_DIR = join(process.cwd(), 'data');

interface CLIOptions {
  tag?: string;
  page?: number;
  perPage?: number;
}

class ForemAPIClient {
  private baseURL: string;

  constructor(baseURL: string = FOREM_API_BASE) {
    this.baseURL = baseURL;
  }

  async fetchArticlesByTag(tag: string, page: number = 1, perPage: number = 30): Promise<ForemArticle[]> {
    const url = `${this.baseURL}/articles?tag=${encodeURIComponent(tag)}&page=${page}&per_page=${perPage}`;
    
    console.log(`Fetching articles for tag: ${tag} (page ${page})...`);
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const articles: ForemArticle[] = await response.json();
      console.log(`Fetched ${articles.length} articles for tag: ${tag}`);
      
      return articles;
    } catch (error) {
      console.error(`Error fetching articles for tag ${tag}:`, error);
      throw error;
    }
  }

  async fetchAllArticlesByTag(tag: string): Promise<ForemArticle[]> {
    let allArticles: ForemArticle[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const articles = await this.fetchArticlesByTag(tag, page, 30);
      
      if (articles.length === 0) {
        hasMore = false;
      } else {
        allArticles = [...allArticles, ...articles];
        page++;
        
        // Add a small delay to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return allArticles;
  }
}

async function ensureDataDirectory(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log(`Created data directory: ${DATA_DIR}`);
  }
}

async function saveTagData(tagData: TagData): Promise<void> {
  const filename = `${tagData.tag}.json`;
  const filepath = join(DATA_DIR, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(tagData, null, 2));
    console.log(`Saved ${tagData.submissions.length} submissions to ${filepath}`);
  } catch (error) {
    console.error(`Error saving data for tag ${tagData.tag}:`, error);
    throw error;
  }
}

async function updateTagsIndex(tags: string[]): Promise<void> {
  const indexPath = join(DATA_DIR, 'tags.json');
  
  try {
    let existingTags: string[] = [];
    
    try {
      const existingData = await fs.readFile(indexPath, 'utf-8');
      existingTags = JSON.parse(existingData);
    } catch {
      // File doesn't exist yet, that's okay
    }
    
    const allTags = Array.from(new Set([...existingTags, ...tags])).sort();
    
    await fs.writeFile(indexPath, JSON.stringify(allTags, null, 2));
    console.log(`Updated tags index with ${allTags.length} total tags`);
  } catch (error) {
    console.error('Error updating tags index:', error);
    throw error;
  }
}

async function fetchSubmissions(tag: string): Promise<void> {
  const client = new ForemAPIClient();
  
  try {
    const articles = await client.fetchAllArticlesByTag(tag);
    
    const tagData: TagData = {
      tag,
      submissions: articles,
      fetchedAt: new Date().toISOString()
    };
    
    await saveTagData(tagData);
    await updateTagsIndex([tag]);
    
    console.log(`✅ Successfully fetched and saved ${articles.length} submissions for tag: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to fetch submissions for tag: ${tag}`, error);
    process.exit(1);
  }
}

function printUsage(): void {
  console.log(`
Usage: npm run fetch <tag>

Examples:
  npm run fetch devchallenge
  npm run fetch react
  npm run fetch typescript

This will fetch all submissions with the specified tag from dev.to
and save them to ./data/<tag>.json
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }
  
  const tag = args[0];
  
  if (!tag) {
    console.error('❌ Please provide a tag name');
    printUsage();
    process.exit(1);
  }
  
  console.log(`🚀 Starting fetch for tag: ${tag}`);
  
  await ensureDataDirectory();
  await fetchSubmissions(tag);
}

// Run the CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ CLI failed:', error);
    process.exit(1);
  });
}
