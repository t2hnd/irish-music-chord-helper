import * as algoliasearch from 'algoliasearch/lite';

/**
 * Algolia service for managing Irish music song data
 * Handles both online (Algolia) and offline (localStorage) operations
 */
class AlgoliaService {
    constructor() {
        this.client = null;
        this.index = null;
        this.isConnected = false;
        this.fallbackData = null;
        
        // Configuration from environment variables
        this.config = {
            appId: import.meta.env.VITE_ALGOLIA_APP_ID,
            apiKey: import.meta.env.VITE_ALGOLIA_SEARCH_API_KEY,
            indexName: import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'irish_music_songs'
        };
        
        // Migration-only admin client (created temporarily)
        this.adminClient = null;
        this.adminIndex = null;
    }

    /**
     * Initialize Algolia client and test connection
     */
    async initialize() {
        try {
            console.log('🔧 Algolia config:', {
                appId: this.config.appId ? `${this.config.appId.substring(0, 6)}...` : 'MISSING',
                apiKey: this.config.apiKey ? `${this.config.apiKey.substring(0, 6)}...` : 'MISSING',
                indexName: this.config.indexName
            });
            
            if (!this.config.appId || !this.config.apiKey) {
                throw new Error(`Missing Algolia configuration: appId=${!!this.config.appId}, apiKey=${!!this.config.apiKey}`);
            }
            
            this.client = algoliasearch.algoliasearch(this.config.appId, this.config.apiKey);
            this.index = this.client.initIndex(this.config.indexName);
            
            // Test connection with a simple search
            await this.index.search('', { hitsPerPage: 1 });
            this.isConnected = true;
            console.log('✅ Algolia connection established');
            return true;
        } catch (error) {
            console.warn('⚠️ Algolia connection failed, using fallback:', error.message);
            this.isConnected = false;
            this.loadFallbackData();
            return false;
        }
    }

    /**
     * Load fallback data from localStorage
     */
    loadFallbackData() {
        try {
            const stored = localStorage.getItem('irish_songs_cache');
            if (stored) {
                this.fallbackData = JSON.parse(stored);
                console.log('✅ Loaded cached songs from localStorage');
                return;
            }
            
            // Initialize with empty array if no cache
            // Note: Original irishSongs data will be loaded by the main app as fallback
            this.fallbackData = [];
            console.log('⚠️ No cached songs found in localStorage, will use original data as fallback');
        } catch (error) {
            console.error('Failed to load fallback data:', error);
            this.fallbackData = [];
        }
    }

    /**
     * Convert old format to Algolia format
     */
    convertToAlgoliaFormat(songs) {
        return Object.entries(songs).map(([title, data]) => ({
            objectID: this.createObjectId(title),
            title: title,
            key: data.key,
            time: data.time,
            type: data.type,
            chords: data.chords,
            hidden: data.hidden || false,
            dateCreated: Date.now(),
            dateModified: Date.now(),
            searchableText: this.createSearchableText(title, data),
            popularity: 0
        }));
    }

    /**
     * Create consistent object ID from title
     */
    createObjectId(title) {
        return title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    }

    /**
     * Create searchable text for better search results
     */
    createSearchableText(title, data) {
        const chordText = Object.values(data.chords || {}).join(' ');
        return `${title} ${data.key} ${data.type} ${chordText}`;
    }

    /**
     * Save to localStorage for offline use
     */
    saveFallbackCache() {
        try {
            localStorage.setItem('irish_songs_cache', JSON.stringify(this.fallbackData));
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    /**
     * Get all songs
     */
    async getAllSongs(includeHidden = true) {
        if (this.isConnected) {
            try {
                const result = await this.index.search('', {
                    hitsPerPage: 1000,
                    filters: includeHidden ? '' : 'hidden:false'
                });
                return result.hits;
            } catch (error) {
                console.warn('Algolia search failed, using fallback');
                this.isConnected = false;
            }
        }
        
        return this.fallbackData ? 
            this.fallbackData.filter(song => includeHidden || !song.hidden) : 
            [];
    }

    /**
     * Search songs
     */
    async searchSongs(query, filters = {}) {
        const searchOptions = {
            hitsPerPage: 100,
            ...filters
        };

        if (this.isConnected) {
            try {
                const result = await this.index.search(query, searchOptions);
                return result.hits;
            } catch (error) {
                console.warn('Algolia search failed, using fallback');
                this.isConnected = false;
            }
        }

        // Fallback search
        if (!this.fallbackData) return [];
        
        const lowerQuery = query.toLowerCase();
        return this.fallbackData.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.key.toLowerCase().includes(lowerQuery) ||
            song.type.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get single song by ID
     */
    async getSong(objectId) {
        if (this.isConnected) {
            try {
                return await this.index.getObject(objectId);
            } catch (error) {
                console.warn('Failed to get song from Algolia:', error);
            }
        }

        return this.fallbackData ? 
            this.fallbackData.find(song => song.objectID === objectId) : 
            null;
    }

    /**
     * Initialize admin client for write operations
     */
    initializeAdminClient(adminApiKey) {
        if (!adminApiKey) {
            throw new Error('Admin API key is required for write operations');
        }
        
        this.adminClient = algoliasearch.algoliasearch(this.config.appId, adminApiKey);
        this.adminIndex = this.adminClient.initIndex(this.config.indexName);
        console.log('✅ Admin client initialized for write operations');
    }

    /**
     * Cleanup admin client after use
     */
    cleanupAdminClient() {
        this.adminClient = null;
        this.adminIndex = null;
        console.log('🧹 Admin client cleaned up');
    }

    /**
     * Save/Update song (requires admin API key for Algolia writes)
     */
    async saveSong(songData, adminApiKey = null) {
        const song = {
            ...songData,
            objectID: songData.objectID || this.createObjectId(songData.title),
            dateModified: Date.now(),
            dateCreated: songData.dateCreated || Date.now(),
            searchableText: this.createSearchableText(songData.title, songData)
        };

        // Try to use admin client for write operations
        if (adminApiKey || this.adminIndex) {
            try {
                if (adminApiKey && !this.adminIndex) {
                    this.initializeAdminClient(adminApiKey);
                }
                
                await this.adminIndex.saveObject(song);
                console.log('✅ Song saved to Algolia:', song.title);
            } catch (error) {
                console.error('Failed to save to Algolia (admin):', error);
                throw new Error('Save failed: Admin API key may be invalid or expired');
            }
        } else if (this.isConnected) {
            try {
                await this.index.saveObject(song);
                console.log('✅ Song saved to Algolia:', song.title);
            } catch (error) {
                console.error('Failed to save to Algolia (search-only key):', error);
                throw new Error('Save failed: Search-only API key cannot write. Please provide admin API key.');
            }
        }

        // Always update fallback data
        if (this.fallbackData) {
            const existingIndex = this.fallbackData.findIndex(s => s.objectID === song.objectID);
            if (existingIndex >= 0) {
                this.fallbackData[existingIndex] = song;
            } else {
                this.fallbackData.push(song);
            }
            this.saveFallbackCache();
        }

        return song;
    }

    /**
     * Delete song (requires admin API key for Algolia deletes)
     */
    async deleteSong(objectId, adminApiKey = null) {
        if (adminApiKey || this.adminIndex) {
            try {
                if (adminApiKey && !this.adminIndex) {
                    this.initializeAdminClient(adminApiKey);
                }
                
                await this.adminIndex.deleteObject(objectId);
                console.log('✅ Song deleted from Algolia:', objectId);
            } catch (error) {
                console.error('Failed to delete from Algolia (admin):', error);
                throw new Error('Delete failed: Admin API key may be invalid or expired');
            }
        } else if (this.isConnected) {
            try {
                await this.index.deleteObject(objectId);
                console.log('✅ Song deleted from Algolia:', objectId);
            } catch (error) {
                console.error('Failed to delete from Algolia (search-only key):', error);
                throw new Error('Delete failed: Search-only API key cannot delete. Please provide admin API key.');
            }
        }

        // Always update fallback data
        if (this.fallbackData) {
            this.fallbackData = this.fallbackData.filter(song => song.objectID !== objectId);
            this.saveFallbackCache();
        }
    }

    /**
     * Batch operations for migration (requires admin API key)
     */
    async batchSaveSongs(songs, adminApiKey = null) {
        const algoliaObjects = songs.map(song => ({
            ...song,
            objectID: song.objectID || this.createObjectId(song.title),
            searchableText: this.createSearchableText(song.title, song)
        }));

        if (adminApiKey || this.adminIndex) {
            try {
                if (adminApiKey && !this.adminIndex) {
                    this.initializeAdminClient(adminApiKey);
                }
                
                await this.adminIndex.saveObjects(algoliaObjects);
                console.log(`✅ Batch saved ${algoliaObjects.length} songs to Algolia`);
            } catch (error) {
                console.error('Failed to batch save to Algolia (admin):', error);
                throw new Error('Batch save failed: Admin API key may be invalid or expired');
            }
        }

        // Update fallback
        this.fallbackData = algoliaObjects;
        this.saveFallbackCache();
        
        return algoliaObjects;
    }

    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            hasCache: !!this.fallbackData,
            cacheSize: this.fallbackData ? this.fallbackData.length : 0
        };
    }
}

// Create and export singleton instance
export const algoliaService = new AlgoliaService();