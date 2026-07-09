/* ============================================
   BANNER-SLIDER.JS - Banner Slider (FULLY FIXED + 16:9)
   ============================================ */

// ============================================
// GLOBAL STATE
// ============================================

let currentBannerIndex = 0;
let bannerInterval = null;
let banners = [];
let isPaused = false;
let isTransitioning = false;

// ============================================
// LOAD BANNERS
// ============================================

async function loadBanners() {
    const slider = document.getElementById('bannerSlider');
    const dots = document.getElementById('bannerDots');
    
    if (!slider) return;
    
    try {
        const response = await fetch('data/banners.json');
        if (!response.ok) throw new Error('Banners not found');
        const data = await response.json();
        banners = data.banners || [];
        
        if (banners.length === 0) {
            slider.innerHTML = `
                <div class="banner-slide active" style="aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; background:var(--primary);">
                    <div class="banner-content" style="text-align:center; padding:20px;">
                        <h2>Maa Computer Education</h2>
                        <p>Best Computer Training Institute In Kalimela</p>
                    </div>
                </div>
            `;
            return;
        }
        
        renderBanners(slider, dots);
        startBannerSlider();
        initBannerControls();
        initTouchSupport();
        initVisibilityChange();
        
    } catch (error) {
        console.error('Error loading banners:', error);
        slider.innerHTML = `
            <div class="banner-slide active" style="aspect-ratio: 16/9; display:flex; align-items:center; justify-content:center; background:var(--primary);">
                <div class="banner-content" style="text-align:center; padding:20px;">
                    <h2>Maa Computer Education</h2>
                    <p>Best Computer Training Institute In Kalimela</p>
                </div>
            </div>
        `;
    }
}

// ============================================
// RENDER BANNERS (16:9 Fixed)
// ============================================

function renderBanners(slider, dotsContainer) {
    // Render slides with 16:9 aspect ratio
    slider.innerHTML = banners.map((banner, index) => `
        <div class="banner-slide ${index === 0 ? 'active' : ''}" 
             data-index="${index}"
             style="aspect-ratio: 16/9; position:relative; overflow:hidden; background:var(--primary);">
            <img src="${banner.image || 'https://via.placeholder.com/900x506/1a3a5c/ffffff?text=' + (banner.title || 'Banner')}" 
                 alt="${banner.title || 'Banner'}"
                 loading="lazy"
                 style="width:100%; height:100%; object-fit:cover; object-position:center; display:block;"
                 onerror="this.style.display='none'">
            <div class="banner-content" style="position:absolute; bottom:30px; left:30px; color:white; text-shadow:0 2px 10px rgba(0,0,0,0.3); background:linear-gradient(90deg, rgba(0,0,0,0.4) 0%, transparent 100%); padding:16px 24px; border-radius:8px;">
                <h2 style="font-size:1.8rem; font-weight:700; margin-bottom:4px;">${banner.title || ''}</h2>
                <p style="font-size:1rem; opacity:0.9;">${banner.subtitle || ''}</p>
            </div>
        </div>
    `).join('');
    
    // Render dots
    if (dotsContainer) {
        dotsContainer.innerHTML = banners.map((_, index) => `
            <button class="dot ${index === 0 ? 'active' : ''}" 
                    onclick="goToBanner(${index})" 
                    aria-label="Go to banner ${index + 1}"
                    data-index="${index}"
                    style="width:12px; height:12px; border-radius:50%; border:none; cursor:pointer; transition:all 0.3s; background:var(--border-color);">
            </button>
        `).join('');
    }
}

// ============================================
// START BANNER SLIDER
// ============================================

function startBannerSlider() {
    if (bannerInterval) {
        clearInterval(bannerInterval);
    }
    
    if (banners.length <= 1) return;
    
    bannerInterval = setInterval(() => {
        if (!isPaused) {
            const nextIndex = (currentBannerIndex + 1) % banners.length;
            goToBanner(nextIndex);
        }
    }, 5000);
}

// ============================================
// GO TO BANNER (with transition)
// ============================================

function goToBanner(index) {
    if (index === currentBannerIndex || isTransitioning) return;
    if (index < 0 || index >= banners.length) return;
    
    isTransitioning = true;
    
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.dot');
    
    // Remove active from current
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Add active to new
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentBannerIndex = index;
    
    // Reset transition lock after animation
    setTimeout(() => {
        isTransitioning = false;
    }, 500);
}

// ============================================
// NEXT BANNER
// ============================================

function nextBanner() {
    if (isTransitioning) return;
    const nextIndex = (currentBannerIndex + 1) % banners.length;
    goToBanner(nextIndex);
}

// ============================================
// PREV BANNER
// ============================================

function prevBanner() {
    if (isTransitioning) return;
    const prevIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
    goToBanner(prevIndex);
}

// ============================================
// INIT BANNER CONTROLS
// ============================================

function initBannerControls() {
    const slider = document.getElementById('bannerSlider');
    if (!slider) return;
    
    // Pause on hover
    slider.addEventListener('mouseenter', function() {
        isPaused = true;
    });
    
    slider.addEventListener('mouseleave', function() {
        isPaused = false;
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        const isBannerVisible = document.getElementById('bannerSlider')?.offsetParent !== null;
        if (!isBannerVisible) return;
        
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            nextBanner();
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            prevBanner();
        }
    });
}

// ============================================
// INIT TOUCH SUPPORT
// ============================================

function initTouchSupport() {
    const slider = document.getElementById('bannerSlider');
    if (!slider) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    slider.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    slider.addEventListener('touchmove', function(e) {
        const deltaX = e.changedTouches[0].screenX - touchStartX;
        const deltaY = e.changedTouches[0].screenY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    slider.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
                prevBanner();
            } else {
                nextBanner();
            }
        }
    }, { passive: true });
}

// ============================================
// INIT VISIBILITY CHANGE
// ============================================

function initVisibilityChange() {
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            isPaused = true;
        } else {
            isPaused = false;
        }
    });
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.loadBanners = loadBanners;
window.goToBanner = goToBanner;
window.nextBanner = nextBanner;
window.prevBanner = prevBanner;
window.startBannerSlider = startBannerSlider;