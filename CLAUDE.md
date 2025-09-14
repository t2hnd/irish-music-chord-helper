# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern web application for displaying chord progressions of Irish traditional music. The application provides an interactive interface for musicians to view and follow along with chord changes during Irish music sessions, with cloud storage capabilities via Algolia.

## Architecture

### Modern Build System
- **Build Tool**: Vite with hot module replacement
- **Package Manager**: npm with proper dependency management
- **Deployment**: Netlify with automatic builds from GitHub
- **Environment**: Node.js with ES modules

### Project Structure
```
src/
├── components/           # React-like components
│   ├── editor.js        # Music data editor with CRUD operations
│   └── migration.js     # Data migration tools for Algolia
├── services/            # Business logic services
│   ├── algolia.js       # Algolia integration with fallback support
│   └── data.js          # Local song database
├── styles/              # CSS modules
│   └── main.css         # Global styles and components
├── utils/               # Utility functions
│   └── index.js         # Helper functions and modals
└── main.js              # Application entry point

Configuration Files:
├── package.json         # Dependencies and scripts
├── vite.config.js       # Build configuration
├── netlify.toml         # Deployment settings
├── .env.example         # Environment variable template
└── index.html           # Main HTML template
```

### Core Services

1. **Algolia Service** (`src/services/algolia.js`):
   - Cloud-based song storage and search
   - Automatic fallback to localStorage when offline
   - Secure admin API key handling for write operations
   - Environment variable configuration support

2. **Music Editor** (`src/components/editor.js`):
   - Full CRUD operations for song management
   - Integration with both Algolia and local storage
   - Dynamic chord section editing
   - Hide/show functionality for songs

3. **Data Migration** (`src/components/migration.js`):
   - Secure migration from local data to Algolia
   - Validation and testing of migrated data
   - Comprehensive logging and error handling

## Environment Configuration

The app supports both cloud and offline modes via environment variables:

```env
VITE_ALGOLIA_APP_ID=your_algolia_app_id
VITE_ALGOLIA_SEARCH_API_KEY=your_search_only_api_key  
VITE_ALGOLIA_INDEX_NAME=irish_music_songs
```

### Data Storage Hierarchy
1. **Algolia Cloud** (when configured) - Primary data source
2. **localStorage Cache** - Secondary/offline cache  
3. **Local Data** (`src/services/data.js`) - Final fallback

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server with HMR
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Linting and Formatting
```bash
# Run ESLint
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Deployment
The app is deployed on Netlify with automatic builds:
- **Live URL**: https://irish-music-chord-helper.netlify.app
- **Admin Panel**: https://app.netlify.com/projects/irish-music-chord-helper
- **Auto-deploy**: Triggered on GitHub pushes to master branch

## Song Data Structure

Songs follow this enhanced format:
```javascript
{
    objectID: "unique-song-identifier",
    title: "Song Name",
    key: "Key signature",
    time: "Time signature", 
    type: "Music type (Jig/Reel/Air/etc.)",
    chords: {
        "Section Name": "G D | Em C | G D G | G"
        // Supports measure separators with |
    },
    hidden: false,              // Hide from dropdown while keeping in editor
    dateCreated: 1640995200000,  // Unix timestamp
    dateModified: 1640995200000, // Unix timestamp
    searchableText: "...",       // Auto-generated for Algolia search
    popularity: 0                // For future ranking features
}
```

## Key Features

### Music Data Management
- **Cloud Storage**: Algolia integration for scalable data management
- **Offline Support**: Automatic fallback to local data and localStorage
- **Data Migration**: Secure tools for moving data between storage systems
- **Version Control**: Timestamps and modification tracking

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Auto-Scroll**: Hands-free scrolling for live performances
- **Real-time Editing**: Changes immediately visible across components
- **Accessibility**: Keyboard navigation and screen reader support

### Security Features
- **API Key Management**: Secure handling of admin credentials
- **Temporary Admin Access**: Admin keys are used once and discarded
- **Environment Variables**: Sensitive data stored in deployment environment
- **Input Validation**: Comprehensive data validation and sanitization

## Development Notes

### Modern JavaScript Features
- ES6 modules with proper imports/exports
- Async/await for all asynchronous operations
- Template literals for dynamic HTML generation
- Destructuring and spread operators throughout

### Build Optimization
- Tree shaking for minimal bundle size
- Code splitting for better loading performance
- CSS extraction and minification
- Source maps for debugging

### Error Handling
- Comprehensive try/catch blocks
- Graceful degradation when services fail
- User-friendly error messages
- Detailed logging for development

## API Integration

### Algolia Search API v5
- **Search Operations**: Public search-only API key
- **Write Operations**: Admin API key required (requested via secure modal)
- **Batch Operations**: Optimized bulk data operations
- **Connection Testing**: Automatic health checks

### Security Best Practices
- Admin API keys never stored in code or localStorage
- Temporary admin clients cleaned up after use
- Environment variables for all sensitive configuration
- HTTPS enforcement for all external communications

## Adding New Songs

### Via Editor Interface
1. Click "データ編集" (Data Edit) button
2. Click "新規作成" (New Song) button
3. Fill in song details and chord progressions
4. Use "|" to separate measures in chord progressions
5. Save to both Algolia (if configured) and local storage

### Direct Data Modification
Modify `src/services/data.js` following the established structure, then restart the development server.

### Migration from Old Format
Use the built-in migration tool to convert existing data to the new Algolia-compatible format with proper validation and error handling.