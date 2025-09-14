import { algoliaService } from '../services/algolia.js';
import { createAdminKeyModal } from '../utils/index.js';

/**
 * Music Data Editor Component
 * Handles CRUD operations for songs
 */
export class MusicEditor {
    constructor() {
        this.currentEditingSong = null;
        this.editedSongs = {};
    }

    /**
     * Initialize editor with song data
     */
    async initialize(songs) {
        this.editedSongs = { ...songs };
        this.populateEditorSongList();
    }

    /**
     * Toggle editor modal visibility
     */
    toggleEditor() {
        const modal = document.getElementById('editorModal');
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
            this.populateEditorSongList();
        }
    }

    /**
     * Populate song list in editor
     */
    populateEditorSongList() {
        const songList = document.getElementById('songList');
        songList.innerHTML = '';
        
        Object.keys(this.editedSongs).forEach(songName => {
            const songData = this.editedSongs[songName];
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            const hiddenIndicator = songData.hidden ? ' 🚫' : '';
            songItem.innerHTML = `
                <span>${songName}${hiddenIndicator}</span>
                <small>${songData.key} - ${songData.type}${songData.hidden ? ' (非表示)' : ''}</small>
            `;
            songItem.onclick = () => this.loadSongForEdit(songName);
            songList.appendChild(songItem);
        });
    }

    /**
     * Load song data into editor form
     */
    loadSongForEdit(songName) {
        this.currentEditingSong = songName;
        const song = this.editedSongs[songName];
        
        // Clear previous selection
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Highlight selected song
        event.target.closest('.song-item').classList.add('selected');
        
        // Populate form
        document.getElementById('songTitle').value = songName;
        document.getElementById('songKey').value = song.key;
        document.getElementById('songTime').value = song.time;
        document.getElementById('songType').value = song.type;
        
        const hiddenCheckbox = document.getElementById('songHidden');
        if (hiddenCheckbox) {
            hiddenCheckbox.checked = song.hidden || false;
        }
        
        // Populate chord sections
        this.populateChordSections(song.chords);
    }

    /**
     * Populate chord sections in editor
     */
    populateChordSections(chords) {
        const sectionsContainer = document.getElementById('chordSections');
        const title = sectionsContainer.querySelector('h3');
        sectionsContainer.innerHTML = '';
        sectionsContainer.appendChild(title);
        
        Object.entries(chords).forEach(([sectionName, chordData]) => {
            const sectionDiv = document.createElement('div');
            sectionDiv.className = 'section-editor';
            
            // Handle both old array format and new string format
            let chordText;
            if (Array.isArray(chordData)) {
                chordText = chordData.join(' ');
            } else {
                chordText = chordData;
            }
            
            sectionDiv.innerHTML = `
                <div class="section-header">
                    <input type="text" class="section-name" value="${sectionName}" onchange="window.musicEditor.updateSectionName(this)">
                    <button class="btn-danger" onclick="window.musicEditor.removeSection(this)">削除</button>
                </div>
                <input type="text" class="chord-input" value="${chordText}" data-section="${sectionName}">
            `;
            sectionsContainer.appendChild(sectionDiv);
        });
    }

    /**
     * Add new chord section
     */
    addSection() {
        const sectionsContainer = document.getElementById('chordSections');
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section-editor';
        sectionDiv.innerHTML = `
            <div class="section-header">
                <input type="text" class="section-name" value="New Section" onchange="window.musicEditor.updateSectionName(this)">
                <button class="btn-danger" onclick="window.musicEditor.removeSection(this)">削除</button>
            </div>
            <input type="text" class="chord-input" placeholder="例: G D | Em C | G D G | G (| で小節区切り)" data-section="New Section">
        `;
        sectionsContainer.appendChild(sectionDiv);
    }

    /**
     * Remove chord section
     */
    removeSection(button) {
        if (confirm('このセクションを削除しますか？')) {
            button.closest('.section-editor').remove();
        }
    }

    /**
     * Update section name
     */
    updateSectionName(input) {
        const chordInput = input.closest('.section-editor').querySelector('.chord-input');
        chordInput.setAttribute('data-section', input.value);
    }

    /**
     * Create new song
     */
    newSong() {
        this.currentEditingSong = null;
        
        // Clear form
        document.getElementById('songTitle').value = '';
        document.getElementById('songKey').value = 'G';
        document.getElementById('songTime').value = '4/4';
        document.getElementById('songType').value = 'Jig';
        
        const hiddenCheckbox = document.getElementById('songHidden');
        if (hiddenCheckbox) {
            hiddenCheckbox.checked = false;
        }
        
        // Clear selections
        document.querySelectorAll('.song-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Reset chord sections
        const sectionsContainer = document.getElementById('chordSections');
        const title = sectionsContainer.querySelector('h3');
        sectionsContainer.innerHTML = '';
        sectionsContainer.appendChild(title);
        
        // Add default section
        this.addSection();
    }

    /**
     * Save song
     */
    async saveSong() {
        const title = document.getElementById('songTitle').value.trim();
        const key = document.getElementById('songKey').value.trim();
        const time = document.getElementById('songTime').value;
        const type = document.getElementById('songType').value;
        
        const hiddenCheckbox = document.getElementById('songHidden');
        const hidden = hiddenCheckbox ? hiddenCheckbox.checked : false;
        
        if (!title) {
            alert('曲名を入力してください');
            return;
        }
        
        // Collect chord sections
        const chords = {};
        const sectionEditors = document.querySelectorAll('.section-editor');
        
        sectionEditors.forEach(editor => {
            const sectionName = editor.querySelector('.section-name').value.trim();
            const chordText = editor.querySelector('.chord-input').value.trim();
            
            if (sectionName && chordText) {
                chords[sectionName] = chordText;
            }
        });
        
        if (Object.keys(chords).length === 0) {
            alert('少なくとも1つのコード進行セクションを入力してください');
            return;
        }
        
        // Prepare song data
        const existingSong = this.editedSongs[this.currentEditingSong];
        const songData = {
            title: title,
            key: key,
            time: time,
            type: type,
            chords: chords,
            hidden: hidden,
            dateCreated: existingSong ? existingSong.dateCreated : Date.now(),
            dateModified: Date.now()
        };
        
        try {
            // Remove old song if name changed
            if (this.currentEditingSong && this.currentEditingSong !== title) {
                const oldSong = this.editedSongs[this.currentEditingSong];
                if (oldSong && oldSong.objectID) {
                    try {
                        await algoliaService.deleteSong(oldSong.objectID);
                    } catch (error) {
                        if (error.message.includes('Search-only API key cannot delete')) {
                            const adminKey = await createAdminKeyModal('delete song');
                            if (adminKey) {
                                await algoliaService.deleteSong(oldSong.objectID, adminKey);
                            } else {
                                throw new Error('Admin API key required for deleting songs from Algolia');
                            }
                        } else {
                            throw error;
                        }
                    }
                }
                delete this.editedSongs[this.currentEditingSong];
            }
            
            // Save to Algolia
            let savedSong;
            try {
                savedSong = await algoliaService.saveSong(songData);
            } catch (error) {
                if (error.message.includes('Search-only API key cannot write')) {
                    const adminKey = await createAdminKeyModal('save song');
                    if (adminKey) {
                        savedSong = await algoliaService.saveSong(songData, adminKey);
                    } else {
                        throw new Error('Admin API key required for saving songs to Algolia');
                    }
                } else {
                    throw error;
                }
            }
            
            // Update local cache
            this.editedSongs[title] = savedSong;
            this.currentEditingSong = title;
            
            // Refresh displays
            this.populateEditorSongList();
            
            // Trigger event for main app to update song select
            window.dispatchEvent(new CustomEvent('songsUpdated', { 
                detail: { songs: this.editedSongs } 
            }));
            
            alert('楽曲を保存しました');
            
        } catch (error) {
            console.error('Failed to save song:', error);
            alert('保存に失敗しました: ' + error.message);
        }
    }

    /**
     * Delete current song
     */
    async deleteSong() {
        if (!this.currentEditingSong) {
            alert('削除する楽曲を選択してください');
            return;
        }
        
        if (confirm(`「${this.currentEditingSong}」を削除しますか？`)) {
            try {
                const song = this.editedSongs[this.currentEditingSong];
                
                // Delete from Algolia if it has an objectID
                if (song && song.objectID) {
                    try {
                        await algoliaService.deleteSong(song.objectID);
                    } catch (error) {
                        if (error.message.includes('Search-only API key cannot delete')) {
                            const adminKey = await createAdminKeyModal('delete song');
                            if (adminKey) {
                                await algoliaService.deleteSong(song.objectID, adminKey);
                            } else {
                                throw new Error('Admin API key required for deleting songs from Algolia');
                            }
                        } else {
                            throw error;
                        }
                    }
                }
                
                // Remove from local cache
                delete this.editedSongs[this.currentEditingSong];
                this.currentEditingSong = null;
                
                // Refresh displays
                this.populateEditorSongList();
                this.newSong(); // Clear form
                
                // Trigger event for main app to update song select
                window.dispatchEvent(new CustomEvent('songsUpdated', { 
                    detail: { songs: this.editedSongs } 
                }));
                
                alert('楽曲を削除しました');
                
            } catch (error) {
                console.error('Failed to delete song:', error);
                alert('削除に失敗しました: ' + error.message);
            }
        }
    }

    /**
     * Export data as JavaScript file
     */
    exportData() {
        const dataString = `// Irish traditional music songs database
const irishSongs = ${JSON.stringify(this.editedSongs, null, 4)};`;
        
        import('../utils/index.js').then(({ downloadFile }) => {
            downloadFile(dataString, 'music-data.js', 'text/javascript');
            alert('データをmusic-data.jsとしてダウンロードしました');
        });
    }
}