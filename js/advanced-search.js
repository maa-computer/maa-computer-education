/* ============================================
   ADVANCED SEARCH - Live Suggestions
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

let searchData = [];
let searchTimeout = null;
let selectedIndex = -1;
let isSearchOpen = false;

// ============================================
// LOAD SEARCH DATA
// ============================================

async function loadSearchData() {
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) throw new Error('Courses not found');
        const data = await response.json();
        searchData = data.courses || [];
        console.log('🔍 Search data loaded:', searchData.length + ' courses');
        return searchData;
    } catch (error) {
        console.error('Error loading search data:', error);
        return [];
    }
}

// ============================================
// SEARCH COURSES WITH SUGGESTIONS
// ============================================

function searchCourses() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    const query = input.value.trim().toLowerCase();
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Remove existing suggestions
    removeSuggestions();
    
    if (query.length === 0) {
        return;
    }
    
    // Debounce: Wait 300ms after typing stops
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

// ============================================
// PERFORM SEARCH
// ============================================

function performSearch(query) {
    if (searchData.length === 0) {
        loadSearchData().then(() => {
            performSearch(query);
        });
        return;
    }
    
    const results = searchData.filter(course => {
        const searchText = (
            course.name + ' ' + 
            course.id + ' ' + 
            (course.keywords || '') + ' ' +
            (course.description || '')
        ).toLowerCase();
        return searchText.includes(query);
    });
    
    // Limit to 8 results
    const limitedResults = results.slice(0, 8);
    showSuggestions(limitedResults, query);
}

// ============================================
// SHOW SUGGESTIONS
// ============================================

function showSuggestions(results, query) {
    // Remove existing suggestions
    removeSuggestions();
    
    if (results.length === 0) {
        showNoResults(query);
        return;
    }
    
    selectedIndex = -1;
    isSearchOpen = true;
    
    const wrapper = document.querySelector('.search-wrapper');
    if (!wrapper) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    dropdown.id = 'searchSuggestions';
    dropdown.style.cssText = `
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--bg-white);
        border-radius: var(--radius);
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        max-height: 360px;
        overflow-y: auto;
        z-index: 9999;
        padding: 8px 0;
        animation: slideDown 0.25s ease;
        border: 1px solid var(--border-color);
    `;
    
    // Add results
    results.forEach((course, index) => {
        const item = document.createElement('div');
        item.className = 'search-suggestion-item';
        item.dataset.index = index;
        item.style.cssText = `
            padding: 10px 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid var(--border-color);
        `;
        item.onmouseenter = () => {
            selectedIndex = index;
            highlightItem(item);
        };
        item.onclick = () => {
            selectCourse(course.id);
        };
        
        // Highlight matching text
        const highlightedName = highlightText(course.name, query);
        
        item.innerHTML = `
            <span style="font-size:20px;">📚</span>
            <div style="flex:1;">
                <div style="font-weight:600; color:var(--text-dark);">${highlightedName}</div>
                <div style="font-size:0.8rem; color:var(--text-light);">
                    ${course.fees || ''} ${course.duration ? '• ' + course.duration : ''}
                </div>
            </div>
            <span style="color:var(--text-light); font-size:14px;">→</span>
        `;
        
        dropdown.appendChild(item);
    });
    
    // Add "View All Results" button
    if (results.length > 0) {
        const viewAll = document.createElement('div');
        viewAll.className = 'search-suggestion-item view-all';
        viewAll.style.cssText = `
            padding: 10px 16px;
            cursor: pointer;
            text-align: center;
            color: var(--secondary);
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.2s;
            border-top: 1px solid var(--border-color);
        `;
        viewAll.textContent = `🔍 View all ${results.length} results`;
        viewAll.onclick = () => {
            const input = document.getElementById('searchInput');
            if (input) {
                searchCoursesDirect(input.value.trim());
            }
        };
        dropdown.appendChild(viewAll);
    }
    
    wrapper.style.position = 'relative';
    wrapper.appendChild(dropdown);
}

// ============================================
// SHOW NO RESULTS
// ============================================

function showNoResults(query) {
    const wrapper = document.querySelector('.search-wrapper');
    if (!wrapper) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'search-suggestions';
    dropdown.id = 'searchSuggestions';
    dropdown.style.cssText = `
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: var(--bg-white);
        border-radius: var(--radius);
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        z-index: 9999;
        padding: 20px;
        text-align: center;
        animation: slideDown 0.25s ease;
        border: 1px solid var(--border-color);
    `;
    
    dropdown.innerHTML = `
        <p style="font-size:32px; margin-bottom:8px;">🔍</p>
        <h4 style="color:var(--text-dark); margin-bottom:4px;">No results found</h4>
        <p style="color:var(--text-light); font-size:0.9rem;">Try different keywords</p>
    `;
    
    wrapper.style.position = 'relative';
    wrapper.appendChild(dropdown);
}

// ============================================
// REMOVE SUGGESTIONS
// ============================================

function removeSuggestions() {
    const existing = document.getElementById('searchSuggestions');
    if (existing) existing.remove();
    isSearchOpen = false;
    selectedIndex = -1;
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
// HIGHLIGHT ITEM
// ============================================

function highlightItem(item) {
    const items = document.querySelectorAll('.search-suggestion-item');
    items.forEach(el => {
        el.style.background = '';
    });
    if (item) {
        item.style.background = '#e8f0fe';
    }
}

// ============================================
// SELECT COURSE
// ============================================

function selectCourse(courseId) {
    removeSuggestions();
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = '';
        input.blur();
    }
    // Open course
    if (typeof openCourse === 'function') {
        openCourse(courseId);
    } else {
        window.location.href = `course-details.html?id=${courseId}`;
    }
}

// ============================================
// SEARCH COURSES DIRECT (for view all)
// ============================================

function searchCoursesDirect(query) {
    removeSuggestions();
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = query;
        input.blur();
    }
    // Call global search
    if (typeof searchCourses === 'function') {
        searchCourses();
    }
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

document.addEventListener('keydown', function(e) {
    if (!isSearchOpen) return;
    
    const items = document.querySelectorAll('.search-suggestion-item');
    if (items.length === 0) return;
    
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                highlightItem(item);
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = '';
            }
        });
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        items.forEach((item, index) => {
            if (index === selectedIndex) {
                highlightItem(item);
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.style.background = '';
            }
        });
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
            items[selectedIndex].click();
        }
    } else if (e.key === 'Escape') {
        removeSuggestions();
        const input = document.getElementById('searchInput');
        if (input) input.blur();
    }
});

// ============================================
// SEARCH INPUT EVENT LISTENERS
// ============================================

function initAdvancedSearch() {
    const input = document.getElementById('searchInput');
    if (!input) return;
    
    // Remove existing listeners to avoid duplicates
    input.removeEventListener('input', searchCourses);
    input.removeEventListener('focus', onSearchFocus);
    input.removeEventListener('blur', onSearchBlur);
    
    input.addEventListener('input', searchCourses);
    input.addEventListener('focus', onSearchFocus);
    input.addEventListener('blur', onSearchBlur);
    
    // Load search data
    loadSearchData();
    
    console.log('🔍 Advanced Search Initialized');
}

function onSearchFocus() {
    // If there's already text, show suggestions
    const input = document.getElementById('searchInput');
    if (input && input.value.trim().length > 0) {
        searchCourses();
    }
}

function onSearchBlur() {
    // Delay removal to allow click on suggestions
    setTimeout(() => {
        // Check if click is on suggestion
        const suggestions = document.getElementById('searchSuggestions');
        if (suggestions) {
            const isClickInside = suggestions.matches(':hover');
            if (!isClickInside) {
                removeSuggestions();
            }
        }
    }, 200);
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.searchCourses = searchCourses;
window.initAdvancedSearch = initAdvancedSearch;
window.loadSearchData = loadSearchData;
window.selectCourse = selectCourse;
window.removeSuggestions = removeSuggestions;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initAdvancedSearch();
});