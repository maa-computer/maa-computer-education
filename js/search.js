/* ============================================
   SEARCH.JS - Course Search Functionality (FULLY FIXED)
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

let searchDebounceTimer = null;
let searchResults = [];
let selectedResultIndex = -1;

// ============================================
// SEARCH COURSES (with Debounce)
// ============================================

async function searchCourses() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.trim().toLowerCase();
    
    // Clear previous timer
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // Update clear button visibility
    updateClearButton(query);
    
    if (!query || query.length < 2) {
        // If on homepage, scroll to courses
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            const coursesSection = document.getElementById('courses');
            if (coursesSection) {
                coursesSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // Remove existing results
        const existingResults = document.querySelector('.search-results-overlay');
        if (existingResults) existingResults.remove();
        return;
    }
    
    // Debounce search (wait 300ms after typing stops)
    searchDebounceTimer = setTimeout(async () => {
        try {
            // Show loading state
            showSearchLoader(true);
            
            // Load courses data
            const response = await fetch('data/courses.json');
            if (!response.ok) throw new Error('Courses not found');
            const data = await response.json();
            
            // Filter courses
            const results = data.courses.filter(course => {
                const searchText = (course.name + ' ' + course.id + ' ' + (course.keywords || '')).toLowerCase();
                return searchText.includes(query);
            });
            
            // Store results for keyboard navigation
            searchResults = results;
            selectedResultIndex = -1;
            
            // Show results
            showSearchResults(results, query);
            showSearchLoader(false);
            
        } catch (error) {
            console.error('Search error:', error);
            showToast('⚠️ Error searching courses. Please try again.');
            showSearchLoader(false);
        }
    }, 300);
}

// ============================================
// UPDATE CLEAR BUTTON (FIXED - Inside Search Box)
// ============================================

function updateClearButton(query) {
    const clearBtn = document.getElementById('searchClear');
    if (!clearBtn) return;
    
    // Show/hide based on input length
    if (query && query.length > 0) {
        clearBtn.style.display = 'block';
        clearBtn.style.opacity = '1';
    } else {
        clearBtn.style.display = 'none';
        clearBtn.style.opacity = '0';
    }
}

// ============================================
// SHOW SEARCH LOADER
// ============================================

function showSearchLoader(show) {
    let loader = document.querySelector('.search-loader');
    
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'search-loader';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 9998;
                background: rgba(255,255,255,0.95);
                padding: 30px 40px;
                border-radius: 16px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.2);
                text-align: center;
                display: none;
            `;
            loader.innerHTML = `
                <div style="width:40px; height:40px; border:4px solid #e2e8f0; border-top:4px solid var(--secondary); border-radius:50%; animation: spin 0.8s linear infinite; margin:0 auto 12px;"></div>
                <p style="color:var(--text-gray); font-size:14px;">Searching...</p>
            `;
            document.body.appendChild(loader);
        }
        loader.style.display = 'block';
    } else {
        if (loader) loader.style.display = 'none';
    }
}

// ============================================
// SHOW SEARCH RESULTS
// ============================================

function showSearchResults(results, query) {
    // Remove existing results container
    const existingResults = document.querySelector('.search-results-overlay');
    if (existingResults) existingResults.remove();
    
    selectedResultIndex = -1;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'search-results-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9997;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s ease;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    `;
    
    // Create results container
    const container = document.createElement('div');
    container.className = 'search-results-container';
    container.style.cssText = `
        background: var(--bg-white);
        border-radius: 16px;
        max-width: 600px;
        width: 92%;
        max-height: 80vh;
        overflow-y: auto;
        padding: 24px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        animation: slideUp 0.3s ease;
        position: relative;
        border: 1px solid var(--border-color);
    `;
    
    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position: sticky;
        top: 0;
        float: right;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--text-light);
        padding: 0 8px;
        z-index: 1;
        transition: all 0.3s;
        font-family: 'Inter', sans-serif;
    `;
    closeBtn.onmouseover = () => closeBtn.style.color = '#e53e3e';
    closeBtn.onmouseout = () => closeBtn.style.color = 'var(--text-light)';
    closeBtn.onclick = () => {
        overlay.remove();
        resetSearch();
    };
    
    // Results header
    const header = document.createElement('div');
    header.style.cssText = `
        margin-bottom: 16px;
        padding-right: 40px;
    `;
    header.innerHTML = `
        <h3 style="margin:0; font-size:1.2rem; color:var(--primary);">
            🔍 Results for "<span style="color:var(--secondary);">${query}</span>"
        </h3>
        <p style="margin:4px 0 0; color:var(--text-light); font-size:0.9rem;">
            ${results.length} course${results.length !== 1 ? 's' : ''} found
        </p>
    `;
    
    container.appendChild(closeBtn);
    container.appendChild(header);
    
    if (results.length === 0) {
        container.innerHTML += `
            <div style="text-align:center; padding:40px 20px;">
                <p style="font-size:48px; margin-bottom:12px;">🔍</p>
                <h4 style="color:var(--primary);">No results found</h4>
                <p style="color:var(--text-light);">Try different keywords or check your spelling.</p>
            </div>
        `;
    } else {
        const resultsList = document.createElement('div');
        resultsList.className = 'search-results-list';
        resultsList.style.cssText = 'display:flex; flex-direction:column; gap:10px;';
        
        results.forEach((course, index) => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.dataset.index = index;
            item.style.cssText = `
                padding: 14px 18px;
                background: var(--bg-light);
                border-radius: 10px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border: 2px solid transparent;
            `;
            
            // Highlight matched text
            const highlightedName = highlightText(course.name, query);
            
            item.onmouseover = () => {
                item.style.background = '#e8f0fe';
                item.style.transform = 'translateX(4px)';
                item.style.borderColor = 'var(--secondary)';
            };
            item.onmouseout = () => {
                item.style.background = 'var(--bg-light)';
                item.style.transform = '';
                item.style.borderColor = 'transparent';
            };
            item.onclick = () => {
                overlay.remove();
                resetSearch();
                openCourse(course.id);
            };
            
            item.innerHTML = `
                <div>
                    <div style="font-weight:600; color:var(--primary);">${highlightedName}</div>
                    <div style="font-size:0.85rem; color:var(--text-light);">${course.duration || ''} • ${course.fees || ''}</div>
                </div>
                <span style="color:var(--secondary); font-size:20px;">→</span>
            `;
            
            resultsList.appendChild(item);
        });
        
        container.appendChild(resultsList);
    }
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Close on overlay click
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            overlay.remove();
            resetSearch();
        }
    });
    
    // Keyboard navigation
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            overlay.remove();
            resetSearch();
            document.removeEventListener('keydown', escHandler);
            document.removeEventListener('keydown', keyNavHandler);
        }
    };
    
    const keyNavHandler = function(e) {
        const items = document.querySelectorAll('.search-result-item');
        if (items.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedResultIndex = Math.min(selectedResultIndex + 1, items.length - 1);
            updateSelected(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
            updateSelected(items);
        } else if (e.key === 'Enter' && selectedResultIndex >= 0) {
            e.preventDefault();
            const selected = items[selectedResultIndex];
            if (selected) {
                selected.click();
            }
        }
    };
    
    document.addEventListener('keydown', escHandler);
    document.addEventListener('keydown', keyNavHandler);
}

// ============================================
// UPDATE SELECTED RESULT
// ============================================

function updateSelected(items) {
    items.forEach((item, index) => {
        if (index === selectedResultIndex) {
            item.style.background = '#e8f0fe';
            item.style.borderColor = 'var(--secondary)';
            item.style.transform = 'translateX(4px)';
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.style.background = 'var(--bg-light)';
            item.style.borderColor = 'transparent';
            item.style.transform = '';
        }
    });
}

// ============================================
// HIGHLIGHT TEXT
// ============================================

function highlightText(text, query) {
    if (!text || !query) return text;
    try {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark style="background:#fbbf24; padding:1px 4px; border-radius:3px; color:#1a202c;">$1</mark>');
    } catch (e) {
        return text;
    }
}

// ============================================
// RESET SEARCH
// ============================================

function resetSearch() {
    searchResults = [];
    selectedResultIndex = -1;
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.blur();
    }
}

// ============================================
// CLEAR SEARCH (FIXED - Clear input + hide button)
// ============================================

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
        
        // Trigger input event to update suggestions
        const event = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(event);
    }
    
    if (clearBtn) {
        clearBtn.style.display = 'none';
        clearBtn.style.opacity = '0';
    }
    
    // Remove search results
    const existingResults = document.querySelector('.search-results-overlay');
    if (existingResults) existingResults.remove();
    
    // Reset search state
    resetSearch();
}

// ============================================
// SHOW TOAST
// ============================================

function showToast(message) {
    if (typeof window.showToast === 'function') {
        window.showToast(message);
        return;
    }
    
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 12px 24px;
            border-radius: 30px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
            font-family: 'Inter', sans-serif;
            max-width: 90%;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ============================================
// KEYBOARD SHORTCUT
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl + / to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput && document.activeElement === searchInput) {
            clearSearch();
            searchInput.blur();
        }
    }
});

// ============================================
// INITIALIZE SEARCH INPUT EVENTS
// ============================================

function initSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    
    if (!searchInput) return;
    
    // Input event for search
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        updateClearButton(query);
        searchCourses();
    });
    
    // Focus event
    searchInput.addEventListener('focus', function() {
        const query = this.value.trim();
        if (query.length > 0) {
            updateClearButton(query);
        }
    });
    
    // Blur event - hide clear button if empty
    searchInput.addEventListener('blur', function() {
        const query = this.value.trim();
        if (query.length === 0) {
            if (clearBtn) {
                clearBtn.style.display = 'none';
                clearBtn.style.opacity = '0';
            }
        }
    });
    
    // Clear button click
    if (clearBtn) {
        clearBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            clearSearch();
        });
    }
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.searchCourses = searchCourses;
window.showSearchResults = showSearchResults;
window.showToast = showToast;
window.clearSearch = clearSearch;
window.resetSearch = resetSearch;
window.highlightText = highlightText;
window.updateClearButton = updateClearButton;
window.initSearchEvents = initSearchEvents;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initSearchEvents();
    console.log('🔍 Search initialized');
});

console.log('🔍 Search.js loaded');