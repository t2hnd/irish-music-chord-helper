import { algoliaService } from '../services/algolia.js';
import { irishSongs } from '../services/data.js';
import { downloadFile } from '../utils/index.js';

/**
 * Data Migration Component
 * Handles migration from local data to Algolia
 */
export class DataMigration {
    constructor() {
        this.migrationLog = [];
    }

    /**
     * Log migration messages
     */
    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.migrationLog.push(logEntry);
        
        const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    /**
     * Main migration function
     */
    async migrate() {
        this.log('Starting data migration to Algolia...');
        
        try {
            // Initialize Algolia service
            this.log('Initializing Algolia service...');
            const connected = await algoliaService.initialize();
            
            if (!connected) {
                this.log('Algolia connection failed, migration will only update local cache', 'warning');
            }

            // Request admin API key for write operations
            this.log('Migration requires Admin API key for write permissions...');
            const adminApiKey = await this.requestAdminApiKey();
            
            if (!adminApiKey) {
                throw new Error('Admin API key is required for migration. Migration cancelled.');
            }

            // Convert existing data
            this.log('Converting existing music data...');
            const convertedSongs = this.convertExistingData();
            this.log(`Converted ${convertedSongs.length} songs`);

            // Validate data
            this.log('Validating converted data...');
            const validationResults = this.validateData(convertedSongs);
            if (validationResults.errors.length > 0) {
                validationResults.errors.forEach(error => this.log(error, 'error'));
                throw new Error('Data validation failed');
            }

            // Batch save to Algolia with admin key
            this.log('Uploading songs to Algolia...');
            await algoliaService.batchSaveSongs(convertedSongs, adminApiKey);
            this.log(`Successfully migrated ${convertedSongs.length} songs`);

            // Test the migration
            this.log('Testing migration...');
            await this.testMigration();

            // Clean up admin client
            algoliaService.cleanupAdminClient();
            this.log('Admin credentials cleaned up for security');

            this.log('✨ Migration completed successfully!');
            return {
                success: true,
                songsCount: convertedSongs.length,
                log: this.migrationLog
            };

        } catch (error) {
            // Always cleanup admin client on error
            algoliaService.cleanupAdminClient();
            this.log(`Migration failed: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message,
                log: this.migrationLog
            };
        }
    }

    /**
     * Request admin API key from user
     */
    async requestAdminApiKey() {
        return new Promise((resolve) => {
            const modal = this.createApiKeyModal();
            document.body.appendChild(modal);
            
            const form = modal.querySelector('#apiKeyForm');
            const input = modal.querySelector('#adminApiKeyInput');
            const cancelBtn = modal.querySelector('#cancelApiKey');
            
            const cleanup = () => {
                document.body.removeChild(modal);
            };
            
            form.onsubmit = (e) => {
                e.preventDefault();
                const apiKey = input.value.trim();
                cleanup();
                resolve(apiKey);
            };
            
            cancelBtn.onclick = () => {
                cleanup();
                resolve(null);
            };
            
            input.focus();
        });
    }

    /**
     * Create modal for API key input
     */
    createApiKeyModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 10px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-top: 0; color: #2d5016;">🔑 Admin API Key Required</h3>
                <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
                    Migration requires <strong>Admin API Key</strong> for write permissions.<br>
                    <strong>⚠️ Security Note:</strong> This key will be used temporarily and cleaned up after migration.
                </p>
                
                <form id="apiKeyForm">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">
                            Admin API Key:
                        </label>
                        <input 
                            type="password" 
                            id="adminApiKeyInput" 
                            placeholder="Enter your Algolia Admin API Key"
                            style="
                                width: 100%;
                                padding: 10px;
                                border: 2px solid #ddd;
                                border-radius: 5px;
                                font-size: 14px;
                                box-sizing: border-box;
                            "
                            required
                        />
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button 
                            type="button" 
                            id="cancelApiKey"
                            style="
                                padding: 10px 20px;
                                border: 2px solid #ccc;
                                background: white;
                                border-radius: 5px;
                                cursor: pointer;
                            "
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            style="
                                padding: 10px 20px;
                                border: 2px solid #2d5016;
                                background: #2d5016;
                                color: white;
                                border-radius: 5px;
                                cursor: pointer;
                            "
                        >
                            Start Migration
                        </button>
                    </div>
                </form>
                
                <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px; font-size: 12px; color: #666;">
                    <strong>Security:</strong> Find your Admin API Key in your Algolia dashboard under API Keys. 
                    It will be used only for this migration and immediately cleaned up afterward.
                </div>
            </div>
        `;
        
        return modal;
    }

    /**
     * Convert existing irishSongs data
     */
    convertExistingData() {
        return Object.entries(irishSongs).map(([title, data], index) => {
            const objectId = algoliaService.createObjectId(title);
            
            return {
                objectID: objectId,
                title: title,
                key: data.key || 'Unknown',
                time: data.time || '4/4',
                type: data.type || 'Traditional',
                chords: data.chords || {},
                hidden: data.hidden || false,
                dateCreated: Date.now() - (index * 1000), // Stagger creation times
                dateModified: Date.now(),
                popularity: 0,
                searchableText: algoliaService.createSearchableText(title, data)
            };
        });
    }

    /**
     * Validate converted data
     */
    validateData(songs) {
        const errors = [];
        const warnings = [];

        songs.forEach((song, index) => {
            // Required fields
            if (!song.objectID) errors.push(`Song ${index}: Missing objectID`);
            if (!song.title) errors.push(`Song ${index}: Missing title`);
            if (!song.key) warnings.push(`Song ${index}: Missing key`);
            if (!song.type) warnings.push(`Song ${index}: Missing type`);
            
            // Chord structure
            if (!song.chords || typeof song.chords !== 'object') {
                errors.push(`Song ${index}: Invalid chords structure`);
            } else if (Object.keys(song.chords).length === 0) {
                warnings.push(`Song ${index}: No chord sections defined`);
            }

            // Duplicate objectIDs
            const duplicates = songs.filter(s => s.objectID === song.objectID);
            if (duplicates.length > 1) {
                errors.push(`Duplicate objectID found: ${song.objectID}`);
            }
        });

        warnings.forEach(warning => this.log(warning, 'warning'));
        
        return { errors, warnings };
    }

    /**
     * Test the migration
     */
    async testMigration() {
        // Test basic search
        const allSongs = await algoliaService.getAllSongs();
        if (allSongs.length === 0) {
            throw new Error('No songs found after migration');
        }

        // Test search functionality
        const searchResults = await algoliaService.searchSongs('jig');
        this.log(`Search test: Found ${searchResults.length} jigs`);

        // Test individual song retrieval
        const firstSong = allSongs[0];
        const retrievedSong = await algoliaService.getSong(firstSong.objectID);
        if (!retrievedSong) {
            throw new Error('Failed to retrieve individual song');
        }

        this.log('All tests passed successfully');
    }

    /**
     * Export migration log
     */
    downloadMigrationLog() {
        const logText = this.migrationLog
            .map(entry => `[${entry.timestamp}] ${entry.type.toUpperCase()}: ${entry.message}`)
            .join('\n');
        
        downloadFile(logText, 'algolia-migration-log.txt', 'text/plain');
    }
}

/**
 * Migration functions for UI integration
 */
export async function runMigration() {
    const migration = new DataMigration();
    const result = await migration.migrate();
    
    if (result.success) {
        alert(`✅ Migration successful! Migrated ${result.songsCount} songs.`);
        
        // Trigger event to refresh the app
        window.dispatchEvent(new CustomEvent('migrationCompleted', { 
            detail: result 
        }));
    } else {
        alert(`❌ Migration failed: ${result.error}`);
    }
    
    // Offer to download log
    if (confirm('Would you like to download the migration log?')) {
        migration.downloadMigrationLog();
    }
    
    return result;
}

/**
 * Add migration button to editor actions
 */
export function addMigrationButton() {
    const editorActions = document.querySelector('.editor-actions');
    if (editorActions) {
        const migrationBtn = document.createElement('button');
        migrationBtn.className = 'btn-secondary';
        migrationBtn.textContent = 'Algolia移行';
        migrationBtn.onclick = runMigration;
        migrationBtn.title = 'Migrate data to Algolia';
        editorActions.appendChild(migrationBtn);
    }
}