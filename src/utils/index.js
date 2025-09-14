/**
 * Utility functions for the Irish Music Chord Display app
 */

/**
 * Create a modal for requesting admin API key
 */
export function createAdminKeyModal(operation = 'operation') {
    return new Promise((resolve) => {
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
                max-width: 450px;
                width: 90%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            ">
                <h3 style="margin-top: 0; color: #2d5016;">🔑 Admin Access Required</h3>
                <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
                    To <strong>${operation}</strong> in Algolia, we need your Admin API Key.<br>
                    <small>⚠️ This will be used once and discarded for security.</small>
                </p>
                
                <form id="adminKeyForm">
                    <div style="margin-bottom: 20px;">
                        <input 
                            type="password" 
                            id="adminKeyInput" 
                            placeholder="Enter Admin API Key"
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
                            id="cancelKey"
                            style="
                                padding: 8px 16px;
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
                                padding: 8px 16px;
                                border: 2px solid #2d5016;
                                background: #2d5016;
                                color: white;
                                border-radius: 5px;
                                cursor: pointer;
                            "
                        >
                            Proceed
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const form = modal.querySelector('#adminKeyForm');
        const input = modal.querySelector('#adminKeyInput');
        const cancelBtn = modal.querySelector('#cancelKey');
        
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
 * Format chords HTML with measure separators
 */
export function createChordsHTML(chords) {
    let html = '';
    
    Object.entries(chords).forEach(([section, chordString]) => {
        html += `<div class="chord-line">
            <span class="section-label">${section}</span>
            <div class="chord-measures">`;
        
        // Handle both old array format and new string format
        let chordText;
        if (Array.isArray(chordString)) {
            chordText = chordString.join(' ');
        } else {
            chordText = chordString;
        }
        
        // Split by measure separators (|)
        const measures = chordText.split('|').map(measure => measure.trim()).filter(measure => measure);
        
        measures.forEach((measure, measureIndex) => {
            html += `<div class="measure">`;
            
            // Split each measure by spaces to get individual chords
            const chordsInMeasure = measure.split(/\s+/).filter(chord => chord);
            
            chordsInMeasure.forEach(chord => {
                html += `<span class="chord">${chord}</span>`;
            });
            
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

/**
 * Debounce function to limit rapid function calls
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Sanitize string for use as HTML ID or class
 */
export function sanitizeId(str) {
    return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
}

/**
 * Download data as file
 */
export function downloadFile(data, filename, type = 'text/javascript') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}