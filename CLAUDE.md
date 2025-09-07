# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a single-page HTML application for displaying chord progressions of Irish traditional music. The application provides an interactive interface for musicians to view and follow along with chord changes during Irish music sessions.

## Architecture

### Single File Structure
- **irish_music_app.html**: Complete standalone HTML application containing HTML structure, CSS styling, and JavaScript functionality

### Core Components

1. **Song Database** (`irishSongs` object):
   - Contains chord progressions for traditional Irish songs
   - Each song has metadata (key, time signature, type) and section-based chord progressions
   - Supports various Irish music types: Jigs, Reels, Airs, Ballads, Slip Jigs

2. **UI Components**:
   - Header with controls for song selection and auto-scroll
   - Dynamic song cards displaying chord progressions
   - Auto-scroll functionality with speed control

3. **Main Functions**:
   - `populateSongSelect()`: Populates dropdown with available songs
   - `addSelectedSong()`: Adds selected song to display
   - `createSongCard()`: Generates song display cards
   - `createChordsHTML()`: Formats chord progressions with section labels
   - Auto-scroll system for hands-free operation during performances

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

## Development Notes

- Pure HTML/CSS/JavaScript with no external dependencies
- Responsive design with mobile support
- Uses CSS Grid and Flexbox for layout
- Color scheme follows Irish theme (greens and traditional colors)
- Japanese UI text (曲を選択してください, etc.)

## Adding New Songs

To add new songs, extend the `irishSongs` object in the JavaScript section with the proper structure including key, time signature, type, and sectioned chord progressions.