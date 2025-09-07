// Irish Session Chord Display Application Logic

let isScrolling = false;
let scrollInterval;
let scrollSpeed = 3;
let currentEditingSong = null;
let editedSongs = {...irishSongs}; // Copy of original data for editing

// 初期化
function initializeApp() {
    populateSongSelect();
    updateSpeedDisplay();
    populateEditorSongList();
}

// セレクトボックスに曲を追加
function populateSongSelect() {
    const select = document.getElementById('songSelect');
    // Clear existing options except the first one
    select.innerHTML = '<option value="">曲を選択してください</option>';
    
    Object.keys(editedSongs).forEach(songName => {
        const option = document.createElement('option');
        option.value = songName;
        option.textContent = songName;
        select.appendChild(option);
    });
}

// 選択された曲を表示に追加
function addSelectedSong() {
    const select = document.getElementById('songSelect');
    const songName = select.value;
    
    if (!songName) {
        alert('曲を選択してください');
        return;
    }

    const songData = editedSongs[songName]; // Use edited data
    const songDisplay = document.getElementById('songDisplay');
    
    // 初回追加時は説明文を削除
    if (songDisplay.children.length === 1 && songDisplay.children[0].style.textAlign === 'center') {
        songDisplay.innerHTML = '';
    }

    const songCard = createSongCard(songName, songData);
    songDisplay.appendChild(songCard);
    
    // 追加後は選択をリセット
    select.value = '';
}

// 曲カードを作成
function createSongCard(songName, songData) {
    const card = document.createElement('div');
    card.className = 'song-card';
    
    card.innerHTML = `
        <div class="song-title">${songName}</div>
        <div class="song-info">
            <div><strong>Key:</strong> ${songData.key}</div>
            <div><strong>Time:</strong> ${songData.time}</div>
            <div><strong>Type:</strong> ${songData.type}</div>
            <div><button onclick="removeSong(this)" style="background: #dc3545; color: white; border: none;">削除</button></div>
        </div>
        <div class="chords-section">
            <div class="chords-title">Chord Progression</div>
            ${createChordsHTML(songData.chords)}
        </div>
    `;
    
    return card;
}

// コード進行のHTMLを作成（小節線とコード変更対応）
function createChordsHTML(chords) {
    let html = '';
    
    Object.entries(chords).forEach(([section, chordString]) => {
        html += `<div class="chord-line">
            <span class="section-label">${section}</span>
            <div class="chord-measures">`;
        
        // Handle both old array format and new string format
        let chordText;
        if (Array.isArray(chordString)) {
            // Convert old array format to string
            chordText = chordString.join(' ');
        } else {
            chordText = chordString;
        }
        
        // Split by measure separators (|) first
        const measures = chordText.split('|').map(measure => measure.trim()).filter(measure => measure);
        
        measures.forEach((measure, measureIndex) => {
            // Start measure container
            html += `<div class="measure">`;
            
            // Split each measure by spaces to get individual chords
            const chordsInMeasure = measure.split(/\s+/).filter(chord => chord);
            
            chordsInMeasure.forEach(chord => {
                html += `<span class="chord">${chord}</span>`;
            });
            
            // End measure container
            html += `</div>`;
            
            // Add measure separator if not the last measure
            if (measureIndex < measures.length - 1) {
                html += `<span class="measure-separator">|</span>`;
            }
        });
        
        html += `</div></div>`;
    });
    
    return html;
}

// 曲を削除
function removeSong(button) {
    const songCard = button.closest('.song-card');
    songCard.remove();
    
    // 全て削除された場合は説明文を再表示
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

// 全曲クリア
function clearAllSongs() {
    if (confirm('全ての曲を削除しますか？')) {
        const songDisplay = document.getElementById('songDisplay');
        songDisplay.innerHTML = `
            <div style="text-align: center; padding: 50px; color: rgba(255,255,255,0.8); font-size: 1.2em;">
                <p>左上のセレクトボックスから曲を選んで「曲を追加」ボタンを押してください</p>
                <p>複数の曲を縦に並べてセッション用に表示できます</p>
            </div>
        `;
        
        // スクロールを停止
        if (isScrolling) {
            toggleAutoScroll();
        }
    }
}

// 自動スクロールの切り替え
function toggleAutoScroll() {
    const scrollBtn = document.getElementById('scrollBtn');
    const scrollIndicator = document.getElementById('scrollIndicator');
    
    if (isScrolling) {
        clearInterval(scrollInterval);
        isScrolling = false;
        scrollBtn.textContent = '自動スクロール開始';
        scrollIndicator.style.display = 'none';
    } else {
        startAutoScroll();
        isScrolling = true;
        scrollBtn.textContent = '自動スクロール停止';
        scrollIndicator.style.display = 'block';
    }
}

// 自動スクロール開始
function startAutoScroll() {
    const speed = 11 - scrollSpeed; // 1-10を10-1に変換（数値が大きいほど速い）
    scrollInterval = setInterval(() => {
        window.scrollBy(0, 1);
        
        // ページの最下部に到達したら停止
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            toggleAutoScroll();
        }
    }, speed * 10);
}

// スクロール速度表示更新
function updateSpeedDisplay() {
    const speedSlider = document.getElementById('scrollSpeed');
    const speedValue = document.getElementById('speedValue');
    
    speedSlider.addEventListener('input', function() {
        scrollSpeed = this.value;
        speedValue.textContent = this.value;
        
        // スクロール中なら再開
        if (isScrolling) {
            clearInterval(scrollInterval);
            startAutoScroll();
        }
    });
}

// ============ Editor Functions ============

// Toggle editor modal
function toggleEditor() {
    const modal = document.getElementById('editorModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        populateEditorSongList();
    }
}

// Populate song list in editor
function populateEditorSongList() {
    const songList = document.getElementById('songList');
    songList.innerHTML = '';
    
    Object.keys(editedSongs).forEach(songName => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.innerHTML = `
            <span>${songName}</span>
            <small>${editedSongs[songName].key} - ${editedSongs[songName].type}</small>
        `;
        songItem.onclick = () => loadSongForEdit(songName);
        songList.appendChild(songItem);
    });
}

// Load song data into editor form
function loadSongForEdit(songName) {
    currentEditingSong = songName;
    const song = editedSongs[songName];
    
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
    
    // Populate chord sections
    populateChordSections(song.chords);
}

// Populate chord sections in editor
function populateChordSections(chords) {
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
                <input type="text" class="section-name" value="${sectionName}" onchange="updateSectionName(this)">
                <button class="btn-danger" onclick="removeSection(this)">削除</button>
            </div>
            <input type="text" class="chord-input" value="${chordText}" data-section="${sectionName}">
        `;
        sectionsContainer.appendChild(sectionDiv);
    });
}

// Add new chord section
function addSection() {
    const sectionsContainer = document.getElementById('chordSections');
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-editor';
    sectionDiv.innerHTML = `
        <div class="section-header">
            <input type="text" class="section-name" value="New Section" onchange="updateSectionName(this)">
            <button class="btn-danger" onclick="removeSection(this)">削除</button>
        </div>
        <input type="text" class="chord-input" placeholder="例: G D | Em C | G D G | G (| で小節区切り)" data-section="New Section">
    `;
    sectionsContainer.appendChild(sectionDiv);
}

// Remove chord section
function removeSection(button) {
    if (confirm('このセクションを削除しますか？')) {
        button.closest('.section-editor').remove();
    }
}

// Update section name
function updateSectionName(input) {
    const chordInput = input.closest('.section-editor').querySelector('.chord-input');
    chordInput.setAttribute('data-section', input.value);
}

// Create new song
function newSong() {
    currentEditingSong = null;
    
    // Clear form
    document.getElementById('songTitle').value = '';
    document.getElementById('songKey').value = 'G';
    document.getElementById('songTime').value = '4/4';
    document.getElementById('songType').value = 'Jig';
    
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
    addSection();
}

// Save song
function saveSong() {
    const title = document.getElementById('songTitle').value.trim();
    const key = document.getElementById('songKey').value.trim();
    const time = document.getElementById('songTime').value;
    const type = document.getElementById('songType').value;
    
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
            // Store as string to preserve measure separators
            chords[sectionName] = chordText;
        }
    });
    
    if (Object.keys(chords).length === 0) {
        alert('少なくとも1つのコード進行セクションを入力してください');
        return;
    }
    
    // Remove old song if name changed
    if (currentEditingSong && currentEditingSong !== title) {
        delete editedSongs[currentEditingSong];
    }
    
    // Save song
    editedSongs[title] = {
        key: key,
        time: time,
        type: type,
        chords: chords
    };
    
    currentEditingSong = title;
    
    // Refresh displays
    populateEditorSongList();
    populateSongSelect();
    
    alert('楽曲を保存しました');
}

// Delete current song
function deleteSong() {
    if (!currentEditingSong) {
        alert('削除する楽曲を選択してください');
        return;
    }
    
    if (confirm(`「${currentEditingSong}」を削除しますか？`)) {
        delete editedSongs[currentEditingSong];
        currentEditingSong = null;
        
        // Refresh displays
        populateEditorSongList();
        populateSongSelect();
        newSong(); // Clear form
        
        alert('楽曲を削除しました');
    }
}

// Export data as JavaScript
function exportData() {
    const dataString = `// Irish traditional music songs database
const irishSongs = ${JSON.stringify(editedSongs, null, 4)};`;
    
    // Create download
    const blob = new Blob([dataString], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'music-data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('データをmusic-data.jsとしてダウンロードしました');
}

// ページ読み込み時に初期化
window.addEventListener('load', initializeApp);