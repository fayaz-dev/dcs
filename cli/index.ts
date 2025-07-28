#!/usr/bin/env node

import { promises as fs } from 'fs';
import { join } from 'path';
import { ForemArticle, TagData } from '../src/types/index.js';

const FOREM_API_BASE = 'https://dev.to/api';
const DATA_DIR = join(process.cwd(), 'public', 'data');
const BACKUP_DIR = join(process.cwd(), 'backup');

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

async function ensureBackupDirectory(): Promise<void> {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }
}

async function notifyWebApp(): Promise<void> {
  // Create a timestamp file to trigger web app refresh
  const timestampFile = join(DATA_DIR, '.refresh');
  try {
    await fs.writeFile(timestampFile, Date.now().toString());
  } catch {
    // Silent fail - web app will still work without this
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

async function getExistingTags(): Promise<string[]> {
  const indexPath = join(DATA_DIR, 'tags.json');
  
  try {
    const data = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function removeTagFromIndex(tagToRemove: string): Promise<void> {
  const indexPath = join(DATA_DIR, 'tags.json');
  
  try {
    const existingTags = await getExistingTags();
    const updatedTags = existingTags.filter(tag => tag !== tagToRemove);
    
    await fs.writeFile(indexPath, JSON.stringify(updatedTags, null, 2));
    console.log(`Updated tags index, removed: ${tagToRemove}`);
  } catch (error) {
    console.error('Error updating tags index:', error);
    throw error;
  }
}

async function backupTagData(tag: string): Promise<void> {
  const sourceFile = join(DATA_DIR, `${tag}.json`);
  const backupFile = join(BACKUP_DIR, `${tag}_${Date.now()}.json`);
  
  try {
    await fs.access(sourceFile);
    await fs.copyFile(sourceFile, backupFile);
    console.log(`📦 Backed up ${tag}.json to ${backupFile}`);
  } catch (error) {
    console.log(`⚠️  No data file found for tag: ${tag}`);
  }
}

async function removeTagFiles(tag: string): Promise<void> {
  const dataFile = join(DATA_DIR, `${tag}.json`);
  
  const removeFile = async (filePath: string, location: string) => {
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      console.log(`🗑️  Removed ${tag}.json from ${location}`);
    } catch {
      console.log(`ℹ️  No ${tag}.json found in ${location}`);
    }
  };
  
  await removeFile(dataFile, 'public/data directory');
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
    await notifyWebApp();
    
    console.log(`✅ Successfully fetched and saved ${articles.length} submissions for tag: ${tag}`);
  } catch (error) {
    console.error(`❌ Failed to fetch submissions for tag: ${tag}`, error);
    process.exit(1);
  }
}

async function promptTagSelection(availableTags: string[]): Promise<string> {
  console.log('\n📋 Available tags:');
  availableTags.forEach((tag, index) => {
    console.log(`  ${index + 1}. ${tag}`);
  });
  
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve, reject) => {
    rl.question('\nEnter the number of the tag to remove (or "q" to quit): ', (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'q') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
      
      const choice = parseInt(answer);
      if (isNaN(choice) || choice < 1 || choice > availableTags.length) {
        reject(new Error('Invalid selection. Please enter a valid number.'));
        return;
      }
      
      resolve(availableTags[choice - 1]);
    });
  });
}

async function confirmRemoval(tag: string): Promise<boolean> {
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(`\n⚠️  Are you sure you want to remove tag "${tag}"? This will:\n  - Create a backup in ./backup/\n  - Remove from ./data/ and ./public/data/\n  - Remove from web app\n\nType "yes" to confirm: `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function removeTag(): Promise<void> {
  try {
    const availableTags = await getExistingTags();
    
    if (availableTags.length === 0) {
      console.log('❌ No tags found. Fetch some submissions first using:');
      console.log('   pnpm run fetch <tag-name>');
      return;
    }
    
    console.log(`\n🏷️  Found ${availableTags.length} available tags`);
    
    const tagToRemove = await promptTagSelection(availableTags);
    const confirmed = await confirmRemoval(tagToRemove);
    
    if (!confirmed) {
      console.log('Operation cancelled.');
      return;
    }
    
    console.log(`\n🚀 Removing tag: ${tagToRemove}`);
    
    await ensureBackupDirectory();
    await backupTagData(tagToRemove);
    await removeTagFiles(tagToRemove);
    await removeTagFromIndex(tagToRemove);
    await notifyWebApp();
    
    console.log(`\n✅ Successfully removed tag: ${tagToRemove}`);
    console.log(`📦 Backup saved in ./backup/`);
    
  } catch (error) {
    console.error('❌ Failed to remove tag:', error);
    process.exit(1);
  }
}

function printUsage(): void {
  console.log(`
Usage: 
  npm run fetch <tag>     - Fetch submissions for a tag
  npm run remove          - Remove a tag (interactive)

Examples:
  npm run fetch devchallenge
  npm run fetch react
  npm run remove

Fetch will download all submissions with the specified tag from dev.to
and save them directly to ./public/data/<tag>.json for immediate web app use.

Remove will interactively let you select and remove a tag, creating
a backup in ./backup/ before removing from ./public/data/

The web app will automatically reflect changes when you fetch or remove tags.
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }
  
  const command = args[0];
  
  // Handle remove command
  if (command === 'remove' || command === '--remove' || command === '-r') {
    await removeTag();
    return;
  }
  
  // Handle fetch command (default behavior)
  const tag = command;
  
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
