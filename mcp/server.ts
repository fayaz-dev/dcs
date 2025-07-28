#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import { join } from 'path';
import { ForemArticle, TagData } from '../src/types/index.js';

const FOREM_API_BASE = 'https://dev.to/api';
const DATA_DIR = join(process.cwd(), 'public', 'data');
const BACKUP_DIR = join(process.cwd(), 'backup');

class ForemAPIClient {
  private baseURL: string;

  constructor(baseURL: string = FOREM_API_BASE) {
    this.baseURL = baseURL;
  }

  async fetchArticlesByTag(tag: string, page: number = 1, perPage: number = 30): Promise<ForemArticle[]> {
    const url = `${this.baseURL}/articles?tag=${encodeURIComponent(tag)}&page=${page}&per_page=${perPage}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const articles: ForemArticle[] = await response.json();
      
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
  }
}

async function ensureBackupDirectory(): Promise<void> {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

async function validateTagName(tag: string): Promise<void> {
  if (tag.toLowerCase() === 'devchallenge') {
    throw new Error('Cannot fetch "devchallenge" tag directly - it contains too many submissions. Use specific challenge tags like "hacktoberfestchallenge", "algoliachallenge", etc.');
  }
  
  if (!tag.toLowerCase().endsWith('challenge')) {
    throw new Error(`Invalid tag "${tag}" - only challenge tags ending with "challenge" are allowed. Examples: hacktoberfestchallenge, algoliachallenge, reactchallenge`);
  }
}

async function filterChallengeSubmissions(articles: ForemArticle[]): Promise<ForemArticle[]> {
  return articles.filter(article => {
    return article.tag_list.some(tag => 
      tag.toLowerCase() === 'devchallenge'
    );
  });
}

async function saveTagData(tagData: TagData): Promise<void> {
  const filename = `${tagData.tag}.json`;
  const filepath = join(DATA_DIR, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(tagData, null, 2));
  } catch (error) {
    console.error(`Error saving data for tag ${tagData.tag}:`, error);
    throw error;
  }
}

async function ensureTagInIndex(tag: string): Promise<void> {
  const indexPath = join(DATA_DIR, 'tags.json');
  
  try {
    let existingTags: string[] = [];
    
    try {
      const existingData = await fs.readFile(indexPath, 'utf-8');
      existingTags = JSON.parse(existingData);
    } catch {
      // File doesn't exist yet, that's okay
    }
    
    if (!existingTags.includes(tag)) {
      existingTags.push(tag);
      const sortedTags = existingTags.sort();
      await fs.writeFile(indexPath, JSON.stringify(sortedTags, null, 2));
    }
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

async function getTagData(tag: string): Promise<TagData | null> {
  const filepath = join(DATA_DIR, `${tag}.json`);
  
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function getAllTagData(): Promise<TagData[]> {
  const tags = await getExistingTags();
  const allData: TagData[] = [];
  
  for (const tag of tags) {
    const data = await getTagData(tag);
    if (data) {
      allData.push(data);
    }
  }
  
  return allData;
}

async function backupTagData(tag: string): Promise<void> {
  const sourceFile = join(DATA_DIR, `${tag}.json`);
  const backupFile = join(BACKUP_DIR, `${tag}_${Date.now()}.json`);
  
  try {
    await fs.access(sourceFile);
    await fs.copyFile(sourceFile, backupFile);
  } catch {
    // No existing file to backup
  }
}

async function fetchSubmissions(tag: string): Promise<TagData> {
  await validateTagName(tag);
  await ensureDataDirectory();
  
  const client = new ForemAPIClient();
  
  const rawArticles = await client.fetchAllArticlesByTag(tag);
  const validArticles = await filterChallengeSubmissions(rawArticles);
  
  if (validArticles.length === 0) {
    throw new Error(`No valid challenge submissions found for tag: ${tag}. Make sure the tag contains submissions that also have the "devchallenge" tag.`);
  }
  
  const tagData: TagData = {
    tag,
    submissions: validArticles,
    fetchedAt: new Date().toISOString()
  };
  
  await saveTagData(tagData);
  await ensureTagInIndex(tag);
  
  return tagData;
}

async function updateTag(tag: string): Promise<TagData> {
  const dataFile = join(DATA_DIR, `${tag}.json`);
  let tagExists = false;
  
  try {
    await fs.access(dataFile);
    tagExists = true;
  } catch {
    // Tag doesn't exist, will fetch fresh
  }
  
  if (tagExists) {
    await ensureBackupDirectory();
    await backupTagData(tag);
  }
  
  return await fetchSubmissions(tag);
}

async function updateAllTags(): Promise<TagData[]> {
  const existingTags = await getExistingTags();
  
  if (existingTags.length === 0) {
    throw new Error('No existing tags found. Use fetch to add some tags first.');
  }
  
  const results: TagData[] = [];
  
  for (const tag of existingTags) {
    try {
      const result = await updateTag(tag);
      results.push(result);
      
      // Add a small delay between updates
      if (existingTags.indexOf(tag) < existingTags.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Failed to update tag: ${tag}`, error);
      // Continue with next tag
    }
  }
  
  return results;
}

const server = new Server(
  {
    name: "dev-challenge-submissions",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_existing_tags",
        description: "Get a list of all existing challenge tags that have been fetched",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get_tag_submissions",
        description: "Get challenge submissions for a specific tag",
        inputSchema: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              description: "The challenge tag to get submissions for",
            },
          },
          required: ["tag"],
        },
      },
      {
        name: "get_all_submissions",
        description: "Get all challenge submissions from all fetched tags",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "fetch_submissions",
        description: "Fetch fresh challenge submissions for a specific tag from dev.to API",
        inputSchema: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              description: "The challenge tag to fetch submissions for (must end with 'challenge')",
            },
          },
          required: ["tag"],
        },
      },
      {
        name: "update_submissions",
        description: "Update existing challenge submissions or fetch all existing tags",
        inputSchema: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              description: "Optional: specific tag to update. If not provided, all existing tags will be updated",
            },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    switch (request.params.name) {
      case "get_existing_tags": {
        const tags = await getExistingTags();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tags,
                count: tags.length,
                message: tags.length > 0 
                  ? `Found ${tags.length} existing challenge tags`
                  : "No challenge tags found. Use fetch_submissions to add some."
              }, null, 2),
            },
          ],
        };
      }

      case "get_tag_submissions": {
        const args = request.params.arguments as Record<string, unknown>;
        const tag = args.tag;
        
        if (!tag || typeof tag !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, "Tag parameter is required and must be a string");
        }
        
        const tagData = await getTagData(tag);
        
        if (!tagData) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: `No data found for tag: ${tag}`,
                  available_tags: await getExistingTags(),
                  suggestion: `Use fetch_submissions with tag "${tag}" to fetch data first`
                }, null, 2),
              },
            ],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tag: tagData.tag,
                submissions_count: tagData.submissions.length,
                fetched_at: tagData.fetchedAt,
                submissions: tagData.submissions
              }, null, 2),
            },
          ],
        };
      }

      case "get_all_submissions": {
        const allData = await getAllTagData();
        
        const totalSubmissions = allData.reduce((sum, data) => sum + data.submissions.length, 0);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                total_tags: allData.length,
                total_submissions: totalSubmissions,
                tags_data: allData
              }, null, 2),
            },
          ],
        };
      }

      case "fetch_submissions": {
        const args = request.params.arguments as Record<string, unknown>;
        const tag = args.tag;
        
        if (!tag || typeof tag !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, "Tag parameter is required and must be a string");
        }
        
        const tagData = await fetchSubmissions(tag);
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: true,
                message: `Successfully fetched ${tagData.submissions.length} challenge submissions for tag: ${tag}`,
                tag: tagData.tag,
                submissions_count: tagData.submissions.length,
                fetched_at: tagData.fetchedAt,
                submissions: tagData.submissions
              }, null, 2),
            },
          ],
        };
      }

      case "update_submissions": {
        const args = request.params.arguments as Record<string, unknown>;
        const tag = args.tag;
        
        if (tag && typeof tag !== 'string') {
          throw new McpError(ErrorCode.InvalidParams, "Tag parameter must be a string if provided");
        }
        
        if (tag) {
          // Update specific tag - we know tag is string because of the check above
          const tagData = await updateTag(tag as string);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `Successfully updated ${tagData.submissions.length} challenge submissions for tag: ${tag}`,
                  tag: tagData.tag,
                  submissions_count: tagData.submissions.length,
                  fetched_at: tagData.fetchedAt,
                  submissions: tagData.submissions
                }, null, 2),
              },
            ],
          };
        } else {
          // Update all existing tags
          const allUpdated = await updateAllTags();
          const totalSubmissions = allUpdated.reduce((sum, data) => sum + data.submissions.length, 0);
          
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  success: true,
                  message: `Successfully updated all ${allUpdated.length} existing tags`,
                  total_tags_updated: allUpdated.length,
                  total_submissions: totalSubmissions,
                  updated_tags: allUpdated.map(data => ({
                    tag: data.tag,
                    submissions_count: data.submissions.length,
                    fetched_at: data.fetchedAt
                  }))
                }, null, 2),
              },
            ],
          };
        }
      }

      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Dev Challenge Submissions MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
