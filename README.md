# Dev Challenge Submissions

A modern web application for browsing dev challenge submissions from dev.to. This app consists of a CLI tool to fetch submissions and a React web interface to display them.

## Features

- **CLI Tool**: Fetch submissions from dev.to using the Forem API
- **Beautiful Web Interface**: Browse submissions with sorting and search functionality
- **Responsive Design**: Works great on desktop and mobile devices
- **Modern Tech Stack**: Built with React, TypeScript, and Vite

## Technologies Used

- **Frontend**: React 19, TypeScript, Vite
- **CLI**: Node.js, TypeScript
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
npm run fetch algoliachallenge
```

This will:
- Fetch all submissions with the specified tag from dev.to
- Save them as JSON files in the `./data` directory
- Update the tags index for the web app

### 3. Start the Web App

```bash
npm run dev
```

The web app will be available at `http://localhost:5173`

## Usage

### CLI Commands

```bash
# Fetch submissions for a tag
npm run fetch <tag-name>

# Examples
npm run fetch devchallenge
npm run fetch javascript
npm run fetch beginners
```

### Web Interface

1. **Select a Tag**: Choose from available tags that have been fetched
2. **Browse Submissions**: View all submissions for the selected tag
3. **Search**: Filter submissions by title, description, or author
4. **Sort**: Order by latest, most popular, or most commented
5. **Read More**: Click any submission card to open it on dev.to

## Project Structure

```
├── cli/                    # CLI tool for fetching data
│   └── index.ts           # Main CLI script
├── data/                  # Generated JSON files (created by CLI)
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

The CLI generates the following files in the `./data` directory:

- `tags.json`: Array of available tag names
- `<tag>.json`: Submissions data for each tag

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
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## API Rate Limiting

The CLI includes built-in rate limiting (100ms delay between requests) to be respectful to the dev.to API. For large tags, fetching may take a few minutes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm run dev`
5. Submit a pull request

## License

See [LICENSE](LICENSE) file for details.