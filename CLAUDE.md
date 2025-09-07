# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page HTML application for displaying chord progressions of Irish traditional music. The application provides an interactive interface for musicians to view and follow along with chord changes during Irish music sessions.

## Architecture

### Modular File Structure
- **irish_music_app.html**: Main HTML structure and layout
- **styles.css**: All CSS styling including responsive design and editor modal
- **app.js**: JavaScript application logic and functionality
- **music-data.js**: Song database with chord progressions

### Core Components

1. **Song Database** (`music-data.js`):
   - Contains chord progressions for traditional Irish songs
   - Each song has metadata (key, time signature, type) and section-based chord progressions
   - Supports various Irish music types: Jigs, Reels, Airs, Ballads, Slip Jigs

2. **UI Components** (`styles.css`):
   - Header with controls for song selection and auto-scroll
   - Dynamic song cards displaying chord progressions
   - Auto-scroll functionality with speed control
   - Modal-based music data editor with comprehensive styling

3. **Application Logic** (`app.js`):
   - `populateSongSelect()`: Populates dropdown with available songs
   - `addSelectedSong()`: Adds selected song to display
   - `createSongCard()`: Generates song display cards
   - `createChordsHTML()`: Formats chord progressions with section labels
   - Auto-scroll system for hands-free operation during performances
   - **Music Editor Functions**: Complete CRUD operations for song management

## Running the Application

This is a client-side only application with no build process required:

```bash
# Simply open in browser
open irish_music_app.html
# or
firefox irish_music_app.html
# or double-click the file in your file manager
```

## Song Data Structure

Songs follow this format:
```javascript
"Song Name": {
    key: "Key signature",
    time: "Time signature", 
    type: "Music type (Jig/Reel/Air/etc.)",
    chords: {
        "Section Name": ["Chord1", "Chord2", "..."],
        // Multiple sections supported
    }
}
```

## Key Features

### Music Data Editor
- **Access**: Click "データ編集" button in main interface
- **CRUD Operations**: Create, read, update, delete songs
- **Dynamic Editing**: Add/remove chord sections with custom names
- **Real-time Preview**: Changes immediately visible in main application
- **Export Functionality**: Download updated music-data.js file
- **Responsive Design**: Works on desktop and mobile devices

### Auto-Scroll System
- Hands-free scrolling for live performance
- Adjustable speed control (1-10)
- Visual indicator when active
- Automatic stop at page bottom

## Development Notes

- Pure HTML/CSS/JavaScript with no external dependencies
- Modular architecture with separated concerns
- Responsive design with mobile support
- Uses CSS Grid and Flexbox for layout
- Color scheme follows Irish theme (greens and traditional colors)
- Japanese UI text (曲を選択してください, etc.)

## Adding New Songs

Two methods available:
1. **Via Editor**: Use the built-in "データ編集" interface for GUI-based editing
2. **Direct Edit**: Modify `music-data.js` file directly following the structure:

```javascript
"Song Name": {
    key: "Key signature",
    time: "Time signature", 
    type: "Music type (Jig/Reel/Air/etc.)",
    chords: {
        "Section Name": ["Chord1", "Chord2", "..."],
        // Multiple sections supported
    }
}
```