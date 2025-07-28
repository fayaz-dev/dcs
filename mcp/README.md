# Dev Challenge Submissions MCP Server

A Model Context Protocol (MCP) server that provides access to dev.to challenge submission data through a standardized interface. This server allows AI assistants like GitHub Copilot, Claude, and others to interact with the Dev Challenge Submissions system.

## Features

The MCP server provides the following tools:

### 1. `get_existing_tags`
- **Description**: Get a list of all existing challenge tags that have been fetched
- **Parameters**: None
- **Returns**: List of available tags and count

### 2. `get_tag_submissions`
- **Description**: Get challenge submissions for a specific tag
- **Parameters**: 
  - `tag` (required): The challenge tag to get submissions for
- **Returns**: Submissions data for the specified tag

### 3. `get_all_submissions`
- **Description**: Get all challenge submissions from all fetched tags
- **Parameters**: None
- **Returns**: All submissions data across all tags

### 4. `fetch_submissions`
- **Description**: Fetch fresh challenge submissions for a specific tag from dev.to API
- **Parameters**:
  - `tag` (required): The challenge tag to fetch (must end with 'challenge')
- **Returns**: Newly fetched submissions data

### 5. `update_submissions`
- **Description**: Update existing challenge submissions or fetch all existing tags
- **Parameters**:
  - `tag` (optional): Specific tag to update. If not provided, all existing tags will be updated
- **Returns**: Updated submissions data

## Setup

### Prerequisites
- Node.js 18+ with TypeScript support
- pnpm package manager
- MCP SDK installed (`@modelcontextprotocol/sdk`)

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. The MCP server is available in two formats:
   - **TypeScript source**: `mcp/server.ts` (requires tsx)
   - **Compiled JavaScript**: `mcp/server.js` (requires Node.js only)

3. To compile TypeScript to JavaScript:
```bash
pnpm run mcp:build
```

### Usage

#### Direct Execution

**Using TypeScript (tsx required):**
```bash
# Run the MCP server directly with TypeScript
tsx mcp/server.ts
```

**Using JavaScript (Node.js only):**
```bash
# Compile first (if not already done)
pnpm run mcp:build

# Run the compiled JavaScript version
node mcp/server.js
```

#### npm Scripts
```bash
# Development (TypeScript)
pnpm run mcp

# Production (JavaScript)
pnpm run mcp:node

# Build JavaScript version
pnpm run mcp:build
```

#### Configuration for MCP Clients

##### GitHub Copilot / VS Code

**Using TypeScript (development):**
```json
{
  "mcpServers": {
    "dev-challenge-submissions": {
      "command": "tsx",
      "args": ["mcp/server.ts"],
      "cwd": "/path/to/your/dcs/project"
    }
  }
}
```

**Using JavaScript (production):**
```json
{
  "mcpServers": {
    "dev-challenge-submissions": {
      "command": "node",
      "args": ["mcp/server.js"],
      "cwd": "/path/to/your/dcs/project"
    }
  }
}
```

##### Claude Desktop

Add to your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

**Using TypeScript (development):**
```json
{
  "mcpServers": {
    "dev-challenge-submissions": {
      "command": "tsx",
      "args": ["/path/to/your/dcs/project/mcp/server.ts"],
      "cwd": "/path/to/your/dcs/project"
    }
  }
}
```

**Using JavaScript (production):**
```json
{
  "mcpServers": {
    "dev-challenge-submissions": {
      "command": "node",
      "args": ["/path/to/your/dcs/project/mcp/server.js"],
      "cwd": "/path/to/your/dcs/project"
    }
  }
}
```

## Data Structure

### TagData
```typescript
interface TagData {
  tag: string;
  submissions: ForemArticle[];
  fetchedAt: string;
}
```

### ForemArticle
```typescript
interface ForemArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  user: ForemUser;
  tag_list: string[];
  published_at: string;
  // ... additional fields
}
```

## Constraints

- Only challenge tags ending with "challenge" are allowed
- Cannot fetch "devchallenge" tag directly (too many submissions)
- Only submissions with "devchallenge" tag are included in results
- Remove functionality is intentionally excluded for safety

## Example Usage

Once connected to an MCP client, you can:

1. **Get available tags**:
   ```
   Use the get_existing_tags tool to see what challenge tags are available
   ```

2. **Fetch new challenge data**:
   ```
   Use fetch_submissions with tag "reactchallenge" to get React challenge submissions
   ```

3. **Update existing data**:
   ```
   Use update_submissions to refresh all existing challenge data
   ```

4. **Get specific submissions**:
   ```
   Use get_tag_submissions with tag "hacktoberfestchallenge" to see Hacktoberfest submissions
   ```

## Error Handling

The server provides detailed error messages for:
- Invalid tag names
- Missing required parameters
- API fetch failures
- File system errors

All errors are returned in a structured format with helpful context and suggestions.

## Security

- Read-only access to submission data
- No remove/delete operations exposed
- Validates all input parameters
- Rate limiting through API delays
- Automatic backup creation before updates

## Files and Directories

- `mcp/server.ts` - Main MCP server implementation
- `mcp/config.json` - Example configuration
- `public/data/` - Challenge submission data
- `backup/` - Automatic backups
- `src/types/` - TypeScript type definitions
