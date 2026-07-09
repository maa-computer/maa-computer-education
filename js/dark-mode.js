/* ============================================
   DARK-MODE.JS - Dark Mode Toggle (FULLY FIXED)
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

let darkModeInitialized = false;

// ============================================
// TOGGLE DARK MODE
// ============================================

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
    
    // Update toggle button icon
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
        toggle.textContent = isDark ? '☀️' : '🌙';
        toggle.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
    
    // Update sidebar dark mode link
    updateSidebarDarkLink(isDark);
    
    // Dispatch custom event for other scripts
    document.dispatchEvent(new CustomEvent('darkModeChanged', { 
        detail: { isDark: isDark } 
    }));
    
    // Show toast with smooth animation
    showToast(isDark ? '🌙 Dark Mode' : '☀️ Light Mode');
}

// ============================================
// UPDATE SIDEBAR DARK LINK
// ============================================

function updateSidebarDarkLink(isDark) {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        const text = link.querySelector('.link-text');
        const icon = link.querySelector('.link-icon');
        if (text && text.textContent === 'Dark Mode') {
            if (icon) {
                icon.textContent = isDark ? '☀️' : '🌙';
            }
        }
    });
}

// ============================================
// INIT DARK MODE
// ============================================

function initDarkMode() {
    if (darkModeInitialized) return;
    
    const isDark = localStorage.getItem('darkMode') === 'true';
    
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
    
    // Update toggle button
    const toggle = document.getElementById('darkToggle');
    if (toggle) {
        toggle.textContent = isDark ? '☀️' : '🌙';
    }
    
    // Update sidebar link
    updateSidebarDarkLink(isDark);
    
    // Apply smooth transition
    document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
    
    darkModeInitialized = true;
    console.log(`🌙 Dark Mode: ${isDark ? 'On' : 'Off'}`);
}

// ============================================
// DETECT SYSTEM PREFERENCE
// ============================================

function detectSystemDarkMode() {
    if (localStorage.getItem('darkMode') === null) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'true');
            const toggle = document.getElementById('darkToggle');
            if (toggle) {
                toggle.textContent = '☀️';
            }
            updateSidebarDarkLink(true);
        }
    }
}

// ============================================
// KEYBOARD SHORTCUT (NEW)
// ============================================

document.addEventListener('keydown', function(e) {
    // Ctrl + Shift + D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleDarkMode();
    }
});

// ============================================
// SHOW TOAST (FIXED - Uses app.js version if available)
// ============================================

function showToast(message) {
    // Try to use app.js toast if available
    if (typeof window.showToast === 'function') {
        window.showToast(message);
        return;
    }
    
    // Fallback toast
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
    }, 2000);
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Detect system preference first
    detectSystemDarkMode();
    
    // Then initialize dark mode
    initDarkMode();
    
    // Add transition class after load
    setTimeout(() => {
        document.body.style.transition = 'background 0.3s ease, color 0.3s ease';
    }, 100);
});

// ============================================
// LISTEN FOR SYSTEM THEME CHANGES
// ============================================

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (localStorage.getItem('darkMode') === null) {
        const isDark = e.matches;
        document.body.classList.toggle('dark-mode', isDark);
        localStorage.setItem('darkMode', isDark);
        
        const toggle = document.getElementById('darkToggle');
        if (toggle) {
            toggle.textContent = isDark ? '☀️' : '🌙';
        }
        updateSidebarDarkLink(isDark);
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('darkModeChanged', { 
            detail: { isDark: isDark } 
        }));
    }
});

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.toggleDarkMode = toggleDarkMode;
window.initDarkMode = initDarkMode;
window.detectSystemDarkMode = detectSystemDarkMode;
window.updateSidebarDarkLink = updateSidebarDarkLink;