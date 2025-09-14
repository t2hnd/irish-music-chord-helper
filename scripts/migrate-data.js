#!/usr/bin/env node
/**
 * Data Migration Script for Irish Music Chord Display
 * Run with: npm run migrate
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrateData() {
    console.log('🍀 Starting data migration...');
    
    try {
        // Read old music data file
        const oldDataPath = join(__dirname, '../music-data.js');
        const newDataPath = join(__dirname, '../src/services/data.js');
        
        let oldData;
        try {
            const oldContent = await fs.readFile(oldDataPath, 'utf-8');
            // Extract the data object from the old file
            const match = oldContent.match(/const irishSongs = ({[\s\S]*});/);
            if (match) {
                // Use eval to parse the object (safe since we control the source)
                oldData = eval(`(${match[1]})`);
                console.log(`✅ Found ${Object.keys(oldData).length} songs in old format`);
            } else {
                throw new Error('Could not parse old data format');
            }
        } catch (error) {
            console.log('ℹ️ No old data file found, using default songs');
            return;
        }

        // Generate new ES module format
        const newContent = `// Irish traditional music songs database
export const irishSongs = ${JSON.stringify(oldData, null, 4)};`;

        // Write new format
        await fs.writeFile(newDataPath, newContent, 'utf-8');
        console.log('✅ Successfully migrated data to new format');

        // Backup old file
        const backupPath = join(__dirname, '../music-data.js.backup');
        await fs.copyFile(oldDataPath, backupPath);
        console.log('✅ Created backup of old file');

        console.log('🎵 Migration completed successfully!');
        console.log(`   Songs: ${Object.keys(oldData).length}`);
        console.log(`   New file: ${newDataPath}`);
        console.log(`   Backup: ${backupPath}`);

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    migrateData();
}