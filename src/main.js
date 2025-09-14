import './styles/main.css';
import { algoliaService } from './services/algolia.js';
import { irishSongs } from './services/data.js';
import { MusicEditor } from './components/editor.js';
import { addMigrationButton } from './components/migration.js';
import { createChordsHTML } from './utils/index.js';

/**
 * Irish Session Chord Display Application
 * Main application logic and initialization
 */
class IrishMusicApp {
    constructor() {
        this.isScrolling = false;
        this.scrollInterval = null;
        this.scrollSpeed = 3;
        this.editedSongs = {};
        this.isAlgoliaInitialized = false;
        
        // Initialize components
        this.musicEditor = new MusicEditor();
        
        // Make editor globally available for onclick handlers
        window.musicEditor = this.musicEditor;
        
        // Bind methods to maintain context
        this.addSelectedSong = this.addSelectedSong.bind(this);
        this.clearAllSongs = this.clearAllSongs.bind(this);
        this.toggleAutoScroll = this.toggleAutoScroll.bind(this);
    }

    /**
     * Initialize the application
     */
    async initialize() {
        try {
            console.log('🍀 Initializing Irish Music Chord Display...');
            
            // Initialize Algolia service
            this.isAlgoliaInitialized = await algoliaService.initialize();
            console.log('Algolia initialized:', this.isAlgoliaInitialized);
            
            // Load songs from Algolia or fallback
            await this.loadSongsFromAlgolia();
            
            // If no songs were loaded from Algolia, use local data as fallback
            if (Object.keys(this.editedSongs).length === 0) {
                console.log('No songs loaded from Algolia, using local data as fallback');
                this.editedSongs = this.convertLocalToAlgoliaFormat(irishSongs);
            }
            
        } catch (error) {
            console.warn('Failed to initialize Algolia, using local data:', error);
            // Fallback to original data
            this.editedSongs = this.convertLocalToAlgoliaFormat(irishSongs);
        }
        
        // Initialize UI
        this.populateSongSelect();
        this.updateSpeedDisplay();
        this.showConnectionStatus();
        
        // Initialize editor
        await this.musicEditor.initialize(this.editedSongs);
        
        // Add migration button
        addMigrationButton();
        
        // Set up event listeners
        this.setupEventListeners();
        
        console.log('✅ Application initialized successfully');
    }

    /**
     * Convert local data format to Algolia format for consistency
     */
    convertLocalToAlgoliaFormat(songs) {
        const converted = {};
        Object.entries(songs).forEach(([title, data]) => {
            converted[title] = {
                ...data,
                objectID: algoliaService.createObjectId(title),
                title: title,
                dateCreated: Date.now(),
                dateModified: Date.now(),
                hidden: data.hidden || false
            };
        });
        return converted;
    }

    /**
     * Load songs from Algolia
     */
    async loadSongsFromAlgolia() {
        try {
            const songs = await algoliaService.getAllSongs(true);
            this.editedSongs = {};
            
            // Convert array to object keyed by title for compatibility
            songs.forEach(song => {
                this.editedSongs[song.title] = song;
            });
            
            console.log(`Loaded ${songs.length} songs from Algolia`);
        } catch (error) {
            console.error('Failed to load songs from Algolia:', error);
            throw error;
        }
    }

    /**
     * Show connection status in UI
     */
    showConnectionStatus() {
        const status = algoliaService.getConnectionStatus();
        const header = document.querySelector('.header h1');
        
        if (status.connected) {
            header.title = '🟢 Connected to Algolia';
        } else if (status.hasCache) {
            header.title = '🟡 Offline mode (using cache)';
        } else {
            header.title = '🔴 No data connection';
        }
    }

    /**
     * Populate song selection dropdown
     */
    populateSongSelect() {
        const select = document.getElementById('songSelect');
        select.innerHTML = '<option value="">曲を選択してください</option>';
        
        Object.keys(this.editedSongs).forEach(songName => {
            const songData = this.editedSongs[songName];
            // Only show songs that are not hidden
            if (!songData.hidden) {
                const option = document.createElement('option');
                option.value = songName;
                option.textContent = songName;
                select.appendChild(option);
            }
        });
    }

    /**
     * Add selected song to display
     */
    addSelectedSong() {
        const select = document.getElementById('songSelect');
        const songName = select.value;
        
        if (!songName) {
            alert('曲を選択してください');
            return;
        }

        const songData = this.editedSongs[songName];
        const songDisplay = document.getElementById('songDisplay');
        
        // Remove initial instructions if this is the first song
        if (songDisplay.children.length === 1 && songDisplay.children[0].style.textAlign === 'center') {
            songDisplay.innerHTML = '';
        }

        const songCard = this.createSongCard(songName, songData);
        songDisplay.appendChild(songCard);
        
        // Reset selection
        select.value = '';
    }

    /**
     * Create song display card
     */
    createSongCard(songName, songData) {
        const card = document.createElement('div');
        card.className = 'song-card';
        
        card.innerHTML = `
            <div class="song-title">${songName}</div>
            <div class="song-info">
                <div><strong>Key:</strong> ${songData.key}</div>
                <div><strong>Time:</strong> ${songData.time}</div>
                <div><strong>Type:</strong> ${songData.type}</div>
                <div><button onclick="this.closest('.song-card').remove(); app.checkEmptyDisplay();" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">削除</button></div>
            </div>
            <div class="chords-section">
                <div class="chords-title">Chord Progression</div>
                ${createChordsHTML(songData.chords)}
            </div>
        `;
        
        return card;
    }

    /**
     * Check if display is empty and show instructions
     */
    checkEmptyDisplay() {
        const songDisplay = document.getElementById('songDisplay');
        if (songDisplay.children.length === 0) {
            songDisplay.innerHTML = `
                <div style="text-align: center; padding: 50px; color: rgba(255,255,255,0.8); font-size: 1.2em;">
                    <p>左上のセレクトボックスから曲を選んで「曲を追加」ボタンを押してください</p>
                    <p>複数の曲を縦に並べてセッション用に表示できます</p>
                </div>
            `;
        }
    }

    /**
     * Clear all songs from display
     */
    clearAllSongs() {
        if (confirm('全ての曲を削除しますか？')) {
            const songDisplay = document.getElementById('songDisplay');
            this.checkEmptyDisplay();
            
            // Stop scrolling
            if (this.isScrolling) {
                this.toggleAutoScroll();
            }
        }
    }

    /**
     * Toggle auto-scroll functionality
     */
    toggleAutoScroll() {
        const scrollBtn = document.getElementById('scrollBtn');
        const scrollIndicator = document.getElementById('scrollIndicator');
        
        if (this.isScrolling) {
            clearInterval(this.scrollInterval);
            this.isScrolling = false;
            scrollBtn.textContent = '自動スクロール開始';
            scrollIndicator.style.display = 'none';
        } else {
            this.startAutoScroll();
            this.isScrolling = true;
            scrollBtn.textContent = '自動スクロール停止';
            scrollIndicator.style.display = 'block';
        }
    }

    /**
     * Start auto-scroll
     */
    startAutoScroll() {
        const speed = 11 - this.scrollSpeed; // Convert 1-10 to 10-1 (higher number = faster)
        this.scrollInterval = setInterval(() => {
            window.scrollBy(0, 1);
            
            // Stop at bottom of page
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
                this.toggleAutoScroll();
            }
        }, speed * 10);
    }

    /**
     * Update scroll speed display
     */
    updateSpeedDisplay() {
        const speedSlider = document.getElementById('scrollSpeed');
        const speedValue = document.getElementById('speedValue');
        
        speedSlider.addEventListener('input', () => {
            this.scrollSpeed = speedSlider.value;
            speedValue.textContent = speedSlider.value;
            
            // Restart scrolling with new speed if currently scrolling
            if (this.isScrolling) {
                clearInterval(this.scrollInterval);
                this.startAutoScroll();
            }
        });
    }

    /**
     * Set up application event listeners
     */
    setupEventListeners() {
        // Songs updated event from editor
        window.addEventListener('songsUpdated', (event) => {
            this.editedSongs = event.detail.songs;
            this.populateSongSelect();
        });

        // Migration completed event
        window.addEventListener('migrationCompleted', async (event) => {
            console.log('Migration completed, reloading songs...');
            await this.loadSongsFromAlgolia();
            this.populateSongSelect();
            await this.musicEditor.initialize(this.editedSongs);
        });

        // Global function bindings for onclick handlers in HTML
        window.addSelectedSong = this.addSelectedSong;
        window.clearAllSongs = this.clearAllSongs;
        window.toggleAutoScroll = this.toggleAutoScroll;
        window.toggleEditor = () => this.musicEditor.toggleEditor();
        window.addSection = () => this.musicEditor.addSection();
        window.saveSong = () => this.musicEditor.saveSong();
        window.newSong = () => this.musicEditor.newSong();
        window.deleteSong = () => this.musicEditor.deleteSong();
        window.exportData = () => this.musicEditor.exportData();
    }
}

// Initialize application when DOM is ready
const app = new IrishMusicApp();
window.app = app; // Make globally available for debugging

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.initialize());
} else {
    app.initialize();
}