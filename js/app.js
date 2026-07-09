/* ============================================
   APP.JS - Main Application Logic (FULLY FIXED + Testimonials Slider)
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

const App = {
    websiteData: null,
    currentPage: window.location.pathname.split('/').pop() || 'index.html',
    isDarkMode: localStorage.getItem('darkMode') === 'true',
    isSidebarOpen: false,
    isLoading: false
};

// ============================================
// TOAST NOTIFICATION
// ============================================

function showToast(message, type = 'info') {
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
// WEBSITE DATA LOADER
// ============================================

async function loadWebsiteData() {
    try {
        const response = await fetch('data/website.json');
        if (!response.ok) throw new Error('Website data not found');
        const data = await response.json();
        App.websiteData = data;
        applyWebsiteData(data);
        return data;
    } catch (error) {
        console.error('Error loading website data:', error);
        showToast('⚠️ Error loading website data');
        return null;
    }
}

// ============================================
// APPLY WEBSITE DATA TO DOM
// ============================================

function applyWebsiteData(data) {
    if (!data) return;
    
    // Update hero section
    const heroTitle = document.getElementById('heroTitle');
    const heroTagline = document.getElementById('heroTagline');
    const heroDescription = document.getElementById('heroDescription');
    if (heroTitle) heroTitle.textContent = data.name || 'Ma Computer Education';
    if (heroTagline) heroTagline.textContent = data.tagline || 'Best Computer Training Institute In Kalimela';
    if (heroDescription) heroDescription.textContent = data.description || 'Quality education with experienced trainers & 100% job assistance';
    
    // Update footer
    const footerText = document.getElementById('footerText');
    const footerPhone = document.getElementById('footerPhone');
    const footerEmail = document.getElementById('footerEmail');
    const footerAddress = document.getElementById('footerAddress');
    const developerCredit = document.getElementById('developerCredit');
    
    if (footerText) footerText.textContent = data.footerText || '© 2026 Ma Computer Education. All Rights Reserved.';
    if (footerPhone) footerPhone.textContent = `📞 ${data.phone || '+91-9777084142'}`;
    if (footerEmail) footerEmail.textContent = `✉️ ${data.email || 'mcekalimela@gmail.com'}`;
    if (footerAddress) footerAddress.textContent = `📍 ${data.address || 'Kalimela, Odisha'}`;
    if (developerCredit) {
        const name = data.developerCredit || 'Subhankar Bairagi';
        developerCredit.innerHTML = `Developed with ❤️ by <span onclick="window.open('developer.html','_self')" style="cursor:pointer; color:#f5a623; font-weight:700;">${name}</span>`;
    }
    
    // Update contact page
    const contactPhone = document.getElementById('contactPhone');
    const contactEmail = document.getElementById('contactEmail');
    const contactAddress = document.getElementById('contactAddress');
    if (contactPhone) contactPhone.textContent = data.phone || '+91-9777084142';
    if (contactEmail) contactEmail.textContent = data.email || 'mcekalimela@gmail.com';
    if (contactAddress) contactAddress.textContent = data.address || 'Kalimela, Odisha';
    
    // Update map address card
    updateMapAddressCard(data);
    
    // Update page title
    const pageTitle = document.querySelector('title');
    if (pageTitle && data.name) {
        const pageName = App.currentPage.replace('.html', '').replace(/-/g, ' ');
        const formattedPage = pageName.charAt(0).toUpperCase() + pageName.slice(1);
        if (App.currentPage !== 'index.html') {
            pageTitle.textContent = `${formattedPage} - ${data.name}`;
        } else {
            pageTitle.textContent = `${data.name} - Best Computer Training Institute`;
        }
    }
}

// ============================================
// UPDATE MAP ADDRESS CARD
// ============================================

function updateMapAddressCard(data) {
    if (!data) return;
    
    const address = document.getElementById('mapAddress');
    const phone = document.getElementById('mapPhone');
    const email = document.getElementById('mapEmail');
    
    if (address) address.textContent = data.address || 'Kalimela, Odisha - 764047';
    if (phone) phone.textContent = data.phone || '+91-9777084142';
    if (email) email.textContent = data.email || 'mcekalimela@gmail.com';
}

// ============================================
// LOAD TESTIMONIALS - SLIDER VERSION ✅
// ============================================

let testimonialInterval = null;
let currentTestimonialIndex = 0;
let totalTestimonials = 0;

async function loadTestimonials() {
    const container = document.getElementById('testimonialsGrid');
    if (!container) return;
    
    try {
        const response = await fetch('data/testimonials.json');
        if (!response.ok) throw new Error('Testimonials not found');
        const data = await response.json();
        renderTestimonialsSlider(container, data.testimonials || []);
    } catch (error) {
        console.error('Error loading testimonials:', error);
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); padding:20px;">
                No reviews available yet.
            </p>
        `;
    }
}

function renderTestimonialsSlider(container, testimonials) {
    if (!testimonials || testimonials.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); padding:20px;">
                No reviews available yet.
            </p>
        `;
        return;
    }
    
    // Generate stars function
    function getStars(rating) {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    }
    
    // Build slider HTML
    let html = `
        <div class="testimonials-slider-wrapper">
            <div class="testimonials-slider" id="testimonialsSlider">
    `;
    
    testimonials.forEach((t, index) => {
        html += `
            <div class="testimonial-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                <div class="testimonial-card">
                    <div class="rating">${getStars(t.rating || 5)}</div>
                    <p class="comment">"${t.comment || 'Great institute!'}"</p>
                    <p class="author">${t.name || 'Student'}</p>
                    <p class="course-name">${t.course || 'Course'}</p>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="testimonials-dots" id="testimonialsDots">
    `;
    
    testimonials.forEach((_, index) => {
        html += `
            <button class="testimonial-dot ${index === 0 ? 'active' : ''}" 
                    onclick="goToTestimonial(${index})" 
                    aria-label="Go to review ${index + 1}">
            </button>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Start auto-slide if more than 1 testimonial
    if (testimonials.length > 1) {
        startTestimonialSlider(testimonials.length);
    }
}

// ============================================
// TESTIMONIALS SLIDER CONTROLS
// ============================================

function startTestimonialSlider(count) {
    totalTestimonials = count;
    if (testimonialInterval) {
        clearInterval(testimonialInterval);
    }
    
    if (count <= 1) return;
    
    testimonialInterval = setInterval(() => {
        const nextIndex = (currentTestimonialIndex + 1) % count;
        goToTestimonial(nextIndex);
    }, 5000);
}

function goToTestimonial(index) {
    if (index === currentTestimonialIndex) return;
    if (index < 0 || index >= totalTestimonials) return;
    
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentTestimonialIndex = index;
}

// ============================================
// LOAD GALLERY
// ============================================

async function loadGallery() {
    const container = document.getElementById('galleryGrid');
    if (!container) return;
    
    try {
        const response = await fetch('data/gallery.json');
        if (!response.ok) throw new Error('Gallery not found');
        const data = await response.json();
        renderGallery(container, data.images || []);
    } catch (error) {
        console.error('Error loading gallery:', error);
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); grid-column:1/-1;">
                No gallery images available.
            </p>
        `;
    }
}

function renderGallery(container, images) {
    if (!images || images.length === 0) {
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); grid-column:1/-1;">
                No gallery images available.
            </p>
        `;
        return;
    }
    
    container.innerHTML = images.map((img, index) => `
        <div class="gallery-item" style="animation-delay: ${index * 0.03}s">
            <img src="${img.url || 'https://via.placeholder.com/200x200/1a3a5c/ffffff?text=Gallery'}" 
                 alt="${img.caption || 'Gallery image'}"
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/200x200/1a3a5c/ffffff?text=Image'">
        </div>
    `).join('');
}

// ============================================
// LOAD ABOUT DATA
// ============================================

async function loadAboutData() {
    const container = document.getElementById('aboutContent');
    if (!container) return;
    
    try {
        const response = await fetch('data/about.json');
        if (!response.ok) throw new Error('About data not found');
        const data = await response.json();
        renderAboutPage(data);
    } catch (error) {
        console.error('Error loading about data:', error);
        container.innerHTML = `
            <div class="error" style="text-align:center; padding:40px;">
                <p style="font-size:48px;">⚠️</p>
                <h3>Error loading about content</h3>
                <p style="color:var(--text-light);">Please try again later.</p>
            </div>
        `;
    }
}

// ============================================
// RENDER ABOUT PAGE
// ============================================

function renderAboutPage(data) {
    const container = document.getElementById('aboutContent');
    if (!container) return;
    
    container.innerHTML = `
        <div class="about-section">
            <div class="about-content">
                <div class="about-intro">
                    <h2>${data.introductionTitle || 'Welcome to Ma Computer Education'}</h2>
                    <p>${data.introduction || 'Ma Computer Education is a leading computer training institute in Kalimela.'}</p>
                </div>
                
                <div class="about-grid">
                    <div class="about-card">
                        <h3>📜 Our History</h3>
                        <p>${data.history || 'Established with a vision to provide quality computer education.'}</p>
                    </div>
                    <div class="about-card">
                        <h3>🎯 Our Mission</h3>
                        <p>${data.mission || 'To provide affordable and quality computer education to all.'}</p>
                    </div>
                    <div class="about-card">
                        <h3>👁️ Our Vision</h3>
                        <p>${data.vision || 'To become the best computer training institute in the region.'}</p>
                    </div>
                </div>
                
                <div class="about-achievements">
                    <h3>🏆 Achievements</h3>
                    <ul>
                        ${(data.achievements || ['1000+ Students Trained', '100% Job Assistance', 'Experienced Faculty']).map(a => `<li>✅ ${a}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// LOAD MAP
// ============================================

function loadMap() {
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) return;
    
    const mapUrl = App.websiteData?.mapUrl || 'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d4079.454775996411!2d81.7476719751809!3d18.071371582937225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTjCsDA0JzE2LjkiTiA4McKwNDUnMDAuOSJF!5e1!3m2!1sen!2sin!4v1782314690698!5m2!1sen!2sin';
    
    mapContainer.innerHTML = `
        <iframe 
            src="${mapUrl}" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="strict-origin-when-cross-origin"
            title="Ma Computer Education Location"
            style="border:0; width:100%; height:380px;"
        ></iframe>
    `;
    
    updateMapAddressCard(App.websiteData);
}

// ============================================
// TOGGLE SIDEBAR
// ============================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.querySelector('.menu-toggle');
    
    if (!sidebar || !overlay) return;
    
    App.isSidebarOpen = !App.isSidebarOpen;
    sidebar.classList.toggle('open', App.isSidebarOpen);
    overlay.classList.toggle('active', App.isSidebarOpen);
    document.body.style.overflow = App.isSidebarOpen ? 'hidden' : '';
    
    if (menuBtn) {
        menuBtn.classList.toggle('active', App.isSidebarOpen);
    }
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const menuBtn = document.querySelector('.menu-toggle');
    
    if (!sidebar || !overlay) return;
    
    App.isSidebarOpen = false;
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    
    if (menuBtn) {
        menuBtn.classList.remove('active');
    }
}

// ============================================
// BACK BUTTON
// ============================================

function initBackButton() {
    const backBtn = document.querySelector('.back-btn');
    if (!backBtn) return;
    
    const isHomepage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' ||
                       window.location.pathname === '';
    
    if (isHomepage) {
        backBtn.style.display = 'none';
        backBtn.classList.remove('visible');
    } else {
        backBtn.style.display = 'flex';
        backBtn.classList.add('visible');
    }
}

// ============================================
// HEADER SCROLL SHADOW
// ============================================

function initScrollShadow() {
    const header = document.querySelector('.main-header');
    if (!header) return;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY || window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ============================================
// SEARCH CLEAR ON ESCAPE
// ============================================

function initSearchClear() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.blur();
            const clearBtn = document.getElementById('searchClear');
            if (clearBtn) clearBtn.style.display = 'none';
        }
    });
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

document.addEventListener('keydown', function(e) {
    // Escape to close sidebar
    if (e.key === 'Escape' && App.isSidebarOpen) {
        closeSidebar();
    }
    
    // Ctrl + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
});

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Load website data
    loadWebsiteData().then(() => {
        loadMap();
    });
    
    // Initialize back button
    initBackButton();
    
    // Initialize scroll shadow
    initScrollShadow();
    
    // Initialize search clear
    initSearchClear();
    
    // Load testimonials on homepage (slider version)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        loadTestimonials();
        loadGallery();
    }
    
    // Load about data if on about page
    if (window.location.pathname.includes('about.html')) {
        loadAboutData();
    }
    
    // Load course details if on course page
    if (window.location.pathname.includes('course-details.html')) {
        // course-loader.js handles this
    }
    
    // Close sidebar on outside click
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuBtn = document.querySelector('.menu-toggle');
        
        if (App.isSidebarOpen && sidebar && overlay) {
            if (!sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
                closeSidebar();
            }
        }
    });
    
    console.log('🚀 Ma Computer Education App Loaded');
    console.log(`📄 Page: ${App.currentPage}`);
    console.log(`🌙 Dark Mode: ${App.isDarkMode ? 'On' : 'Off'}`);
    console.log('💡 Keyboard: Ctrl+K to focus search, Escape to close sidebar');
    console.log('✅ Testimonials Slider loaded');
});

// ============================================
// EXPOSE FUNCTIONS GLOBALLY
// ============================================

window.loadWebsiteData = loadWebsiteData;
window.loadAboutData = loadAboutData;
window.loadTestimonials = loadTestimonials;
window.loadGallery = loadGallery;
window.loadMap = loadMap;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.initBackButton = initBackButton;
window.showToast = showToast;
window.updateMapAddressCard = updateMapAddressCard;
window.goToTestimonial = goToTestimonial;
window.startTestimonialSlider = startTestimonialSlider;
window.App = App;

console.log('✅ App.js loaded successfully');