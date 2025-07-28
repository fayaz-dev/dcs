# Dev Challenge Submissions

A modern web application for browsing dev challenge submissions from dev.to. This app consists of a CLI tool to fetch submissions, a React web interface to display them, and an MCP server for AI assistant integration.

## Features

- **CLI Tool**: Fetch, update, and manage submissions from dev.to using the Forem API
- **Beautiful Web Interface**: Browse submissions with sorting and search functionality
- **MCP Server**: Model Context Protocol server for AI assistant integration (GitHub Copilot, Claude, etc.)
- **Auto-refresh**: Web app automatically updates when new data is fetched or removed
- **Responsive Design**: Works great on desktop and mobile devices
- **Safe Operations**: Automatic backups when removing or updating tags
- **Modern Tech Stack**: Built with React, TypeScript, and Vite

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **CLI**: Node.js, TypeScript
- **MCP Server**: Model Context Protocol, stdio transport
- **API**: Forem API V1 (dev.to)
- **Package Manager**: pnpm

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Fetch Submissions

Use the CLI to fetch submissions for a specific tag:

```bash
# Fetch submissions for a specific tag
pnpm run fetch algoliachallenge
```

This will:
- Fetch all submissions with the specified tag from dev.to
- Save them directly to `./public/data/<tag>.json` for immediate web app use
- Update the tags index automatically
- The web app will auto-refresh to show the new tag within seconds

### 3. Start the Web App

```bash
pnpm run dev
```

The web app will be available at `http://localhost:5173`

## Usage

### CLI Commands

```bash
# Fetch submissions for a tag
pnpm run fetch <tag-name>

# Remove a tag (interactive)
pnpm run remove

# Examples
pnpm run fetch hacktoberfestchallenge
pnpm run remove  # Will show dropdown of existing tags
```

The remove command will:
- Show you a list of existing tags to choose from
- Create a timestamped backup in `./backup/` before removal
- Remove the tag data from `./public/data/` directory immediately
- Update the tags index and notify the web app for instant refresh

### Web Interface

1. **Select a Tag**: Choose from available tags that have been fetched
2. **Browse Submissions**: View all submissions for the selected tag
3. **Search**: Filter submissions by title, description, or author
4. **Sort**: Order by latest, most popular, or most commented
5. **Read More**: Click any submission card to open it on dev.to

## Project Structure

```
├── cli/                    # CLI tool for fetching data
│   └── index.ts           # Main CLI script (unified fetch/remove)
├── public/
│   └── data/              # JSON files served directly to web app
├── backup/                # Backup files when tags are removed
├── src/
│   ├── components/        # React components
│   │   ├── TagSelector.*  # Tag selection interface
│   │   ├── SubmissionCard.* # Individual submission display
│   │   ├── SubmissionsList.* # List of submissions with controls
│   │   ├── LoadingSpinner.* # Loading indicator
│   │   └── ErrorDisplay.* # Error handling display
│   ├── hooks/             # Custom React hooks
│   │   └── useSubmissionData.ts # Data management hook
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Shared types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # App entry point
└── package.json          # Dependencies and scripts
```

## Data Format

The CLI generates JSON files directly in `./public/data/` for immediate web app access:

- `tags.json`: Array of available tag names
- `<tag>.json`: Submissions data for each tag
- `.refresh`: Auto-refresh timestamp for live updates

Example submission data structure:
```json
{
  "tag": "devchallenge",
  "submissions": [...],
  "fetchedAt": "2025-01-28T..."
}
```

## Development

### Build for Production

```bash
pnpm run build
```

### Preview Production Build

```bash
pnpm run preview
```

### Linting

```bash
pnpm run lint
```

## API Rate Limiting

The CLI includes built-in rate limiting (100ms delay between requests) to be respectful to the dev.to API. For large tags, fetching may take a few minutes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `pnpm run dev`
5. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.