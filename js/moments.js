/* ============================================
   MOMENTS.JS - Best Moments Slider (FULLY FIXED)
   ============================================ */

let currentMomentIndex = 0;
let momentInterval = null;
let moments = [];
let isMomentPaused = false;
let isMomentTransitioning = false;
let currentPlayingVideo = null;

async function loadMoments() {
    const container = document.getElementById('momentsGrid');
    if (!container) return;
    
    try {
        const response = await fetch('data/moments.json');
        if (!response.ok) throw new Error('Moments data not found');
        const data = await response.json();
        moments = data.items || [];
        
        const titleEl = document.getElementById('momentsTitle');
        const subtitleEl = document.getElementById('momentsSubtitle');
        if (titleEl) titleEl.textContent = data.title || '📸 Best Moments';
        if (subtitleEl) subtitleEl.textContent = data.subtitle || 'A glimpse of our institute\'s best moments';
        
        if (moments.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; color:var(--text-light); padding:40px;">
                    No moments available yet. Check back later!
                </p>
            `;
            return;
        }
        
        renderMomentsSlider(container);
        startMomentSlider();
        initMomentControls();
        initMomentTouchSupport();
        
    } catch (error) {
        console.error('Error loading moments:', error);
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); padding:40px;">
                No moments available yet. Check back later!
            </p>
        `;
    }
}

function renderMomentsSlider(container) {
    // Separate photos and videos
    const photos = moments.filter(item => item.type === 'photo');
    const videos = moments.filter(item => item.type === 'video');
    
    let slides = [];
    
    // Add photos as slides
    photos.forEach(item => {
        slides.push({
            type: 'photo',
            image: item.image,
            caption: item.caption,
            date: item.date
        });
    });
    
    // Add videos as slides
    videos.forEach(item => {
        slides.push({
            type: 'video',
            videoUrl: item.videoUrl,
            image: item.image,
            title: item.title,
            caption: item.caption
        });
    });
    
    // Render slider
    container.innerHTML = `
        <div class="moments-slider-wrapper">
            <div class="moments-slider" id="momentsSlider">
                ${slides.map((slide, index) => `
                    <div class="moments-slide ${index === 0 ? 'active' : ''}" data-index="${index}">
                        ${slide.type === 'photo' ? `
                            <img src="${slide.image || 'https://via.placeholder.com/800x450/1a3a5c/ffffff?text=Photo'}" 
                                 alt="${slide.caption || 'Moment'}"
                                 loading="lazy"
                                 onclick="openMomentLightbox('${slide.image}', '${slide.caption}')"
                                 onerror="this.src='https://via.placeholder.com/800x450/1a3a5c/ffffff?text=Photo'">
                            <div class="moments-slide-content">
                                <h3>${slide.caption || ''}</h3>
                                ${slide.date ? `<p>📅 ${slide.date}</p>` : ''}
                            </div>
                        ` : `
                            <div class="video-container">
                                <video id="momentVideo-${index}" 
                                       class="moment-video"
                                       src="${slide.videoUrl || ''}"
                                       poster="${slide.image || 'https://via.placeholder.com/800x450/1a3a5c/ffffff?text=Video'}"
                                       preload="metadata"
                                       playsinline>
                                    Your browser does not support the video tag.
                                </video>
                                
                                <!-- Video Controls - Always visible initially -->
                                <div class="video-controls-overlay" id="videoControls-${index}">
                                    <button class="video-play-btn" onclick="toggleVideoPlay(${index})">
                                        <span class="play-icon" id="playIcon-${index}">▶</span>
                                    </button>
                                    <div class="video-progress-container">
                                        <span class="video-current-time" id="currentTime-${index}">0:00</span>
                                        <input type="range" class="video-progress-bar" id="progressBar-${index}" 
                                               value="0" min="0" max="100" step="0.1"
                                               oninput="seekVideo(${index}, this.value)">
                                        <span class="video-total-time" id="totalTime-${index}">0:00</span>
                                    </div>
                                    <button class="video-fullscreen-btn" onclick="toggleVideoFullscreen(${index})">
                                        ⛶
                                    </button>
                                </div>
                            </div>
                            <div class="moments-slide-content">
                                <h3>${slide.title || slide.caption || 'Video'}</h3>
                                <p>${slide.caption || ''}</p>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
            
            <!-- Dots -->
            <div class="moments-dots" id="momentsDots">
                ${slides.map((_, index) => `
                    <button class="moment-dot ${index === 0 ? 'active' : ''}" 
                            onclick="goToMoment(${index})" 
                            aria-label="Go to slide ${index + 1}">
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Initialize video controls after render
    slides.forEach((slide, index) => {
        if (slide.type === 'video') {
            initVideoControls(index);
        }
    });
}

// ============================================
// INIT VIDEO CONTROLS
// ============================================

function initVideoControls(index) {
    const video = document.getElementById(`momentVideo-${index}`);
    const progressBar = document.getElementById(`progressBar-${index}`);
    const currentTimeEl = document.getElementById(`currentTime-${index}`);
    const totalTimeEl = document.getElementById(`totalTime-${index}`);
    const controls = document.getElementById(`videoControls-${index}`);
    
    if (!video) return;
    
    // Show controls always on video container
    const container = video.closest('.video-container');
    if (container) {
        // Always show controls on video container
        container.addEventListener('mouseenter', () => {
            if (controls) controls.style.opacity = '1';
        });
        container.addEventListener('mouseleave', () => {
            if (controls) controls.style.opacity = '0.6';
        });
    }
    
    // When video loads, show total duration
    video.addEventListener('loadedmetadata', function() {
        const duration = formatTime(this.duration);
        if (totalTimeEl) totalTimeEl.textContent = duration;
        // Show controls
        if (controls) controls.style.opacity = '1';
    });
    
    // When video is playing, update progress
    video.addEventListener('timeupdate', function() {
        const progress = (this.currentTime / this.duration) * 100;
        if (progressBar) progressBar.value = progress;
        if (currentTimeEl) currentTimeEl.textContent = formatTime(this.currentTime);
    });
    
    // When video ends, reset
    video.addEventListener('ended', function() {
        const playIcon = document.getElementById(`playIcon-${index}`);
        if (playIcon) playIcon.textContent = '▶';
        if (progressBar) progressBar.value = 0;
        if (currentTimeEl) currentTimeEl.textContent = '0:00';
        isMomentPaused = false;
        startMomentSlider();
        if (controls) controls.style.opacity = '1';
    });
    
    // Show controls initially
    if (controls) controls.style.opacity = '1';
}

// ============================================
// VIDEO PLAY/PAUSE
// ============================================

function toggleVideoPlay(index) {
    const video = document.getElementById(`momentVideo-${index}`);
    const playIcon = document.getElementById(`playIcon-${index}`);
    const controls = document.getElementById(`videoControls-${index}`);
    
    if (!video) return;
    
    if (video.paused) {
        // Pause all other videos
        pauseAllVideos(index);
        
        video.play();
        if (playIcon) playIcon.textContent = '⏸';
        if (controls) controls.style.opacity = '1';
        isMomentPaused = true;
        clearInterval(momentInterval);
    } else {
        video.pause();
        if (playIcon) playIcon.textContent = '▶';
        if (controls) controls.style.opacity = '1';
        isMomentPaused = false;
        startMomentSlider();
    }
}

function onVideoPlay(index) {
    const playIcon = document.getElementById(`playIcon-${index}`);
    if (playIcon) playIcon.textContent = '⏸';
    isMomentPaused = true;
    clearInterval(momentInterval);
    currentPlayingVideo = index;
}

function onVideoPause(index) {
    const playIcon = document.getElementById(`playIcon-${index}`);
    if (playIcon) playIcon.textContent = '▶';
    isMomentPaused = false;
    startMomentSlider();
}

function onVideoEnded(index) {
    const playIcon = document.getElementById(`playIcon-${index}`);
    if (playIcon) playIcon.textContent = '▶';
    isMomentPaused = false;
    startMomentSlider();
    currentPlayingVideo = null;
}

function pauseAllVideos(exceptIndex) {
    const videos = document.querySelectorAll('.moment-video');
    videos.forEach((video, index) => {
        if (index !== exceptIndex && !video.paused) {
            video.pause();
            const playIcon = document.getElementById(`playIcon-${index}`);
            if (playIcon) playIcon.textContent = '▶';
        }
    });
}

// ============================================
// SEEK VIDEO
// ============================================

function seekVideo(index, value) {
    const video = document.getElementById(`momentVideo-${index}`);
    if (!video) return;
    
    const seekTime = (value / 100) * video.duration;
    video.currentTime = seekTime;
    
    const currentTimeEl = document.getElementById(`currentTime-${index}`);
    if (currentTimeEl) currentTimeEl.textContent = formatTime(seekTime);
}

// ============================================
// FULLSCREEN
// ============================================

function toggleVideoFullscreen(index) {
    const video = document.getElementById(`momentVideo-${index}`);
    if (!video) return;
    
    if (!document.fullscreenElement) {
        video.requestFullscreen?.() || 
        video.webkitRequestFullscreen?.() || 
        video.msRequestFullscreen?.();
    } else {
        document.exitFullscreen?.() || 
        document.webkitExitFullscreen?.() || 
        document.msExitFullscreen?.();
    }
}

// ============================================
// FORMAT TIME
// ============================================

function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================
// SLIDER CONTROLS
// ============================================

function startMomentSlider() {
    if (momentInterval) clearInterval(momentInterval);
    if (moments.length <= 1) return;
    if (isMomentPaused) return;
    
    // Check if any video is playing
    const playingVideo = document.querySelector('.moment-video:not(.paused)');
    if (playingVideo && !playingVideo.paused) return;
    
    momentInterval = setInterval(() => {
        if (!isMomentPaused) {
            const nextIndex = (currentMomentIndex + 1) % moments.length;
            goToMoment(nextIndex);
        }
    }, 5000);
}

function goToMoment(index) {
    if (index === currentMomentIndex || isMomentTransitioning) return;
    if (index < 0 || index >= moments.length) return;
    
    // Pause any playing video when switching slides
    const videos = document.querySelectorAll('.moment-video');
    videos.forEach((video) => {
        if (!video.paused) {
            video.pause();
            const idx = video.id.replace('momentVideo-', '');
            const playIcon = document.getElementById(`playIcon-${idx}`);
            if (playIcon) playIcon.textContent = '▶';
        }
    });
    
    isMomentTransitioning = true;
    
    const slides = document.querySelectorAll('.moments-slide');
    const dots = document.querySelectorAll('.moment-dot');
    
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    
    currentMomentIndex = index;
    
    setTimeout(() => {
        isMomentTransitioning = false;
    }, 500);
}

function nextMoment() {
    if (isMomentTransitioning) return;
    const nextIndex = (currentMomentIndex + 1) % moments.length;
    goToMoment(nextIndex);
}

function prevMoment() {
    if (isMomentTransitioning) return;
    const prevIndex = (currentMomentIndex - 1 + moments.length) % moments.length;
    goToMoment(prevIndex);
}

// ============================================
// TOUCH SUPPORT
// ============================================

function initMomentTouchSupport() {
    const slider = document.querySelector('.moments-slider-wrapper');
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
                prevMoment();
            } else {
                nextMoment();
            }
        }
    }, { passive: true });
}

function initMomentControls() {
    const slider = document.querySelector('.moments-slider-wrapper');
    if (!slider) return;
    
    slider.addEventListener('mouseenter', function() {
        isMomentPaused = true;
    });
    
    slider.addEventListener('mouseleave', function() {
        // Check if video is playing
        const playingVideo = document.querySelector('.moment-video:not(.paused)');
        if (playingVideo && !playingVideo.paused) {
            isMomentPaused = true;
        } else {
            isMomentPaused = false;
        }
        startMomentSlider();
    });
}

// ============================================
// LIGHTBOX FOR PHOTOS
// ============================================

function openMomentLightbox(imageUrl, caption) {
    const existing = document.querySelector('.moment-lightbox');
    if (existing) existing.remove();
    
    const lightbox = document.createElement('div');
    lightbox.className = 'moment-lightbox';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        cursor: pointer;
        animation: fadeIn 0.3s ease;
    `;
    
    lightbox.innerHTML = `
        <button onclick="this.parentElement.remove()" style="position:absolute; top:20px; right:30px; background:none; border:none; color:white; font-size:36px; cursor:pointer; z-index:1;">✕</button>
        <img src="${imageUrl}" alt="${caption || 'Photo'}" style="max-width:90%; max-height:80%; object-fit:contain; border-radius:8px;">
        ${caption ? `<p style="color:white; margin-top:20px; font-size:1.1rem;">${caption}</p>` : ''}
    `;
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === this) this.remove();
    });
    
    document.body.appendChild(lightbox);
    
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            lightbox.remove();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.loadMoments = loadMoments;
window.goToMoment = goToMoment;
window.nextMoment = nextMoment;
window.prevMoment = prevMoment;
window.toggleVideoPlay = toggleVideoPlay;
window.seekVideo = seekVideo;
window.toggleVideoFullscreen = toggleVideoFullscreen;
window.onVideoPlay = onVideoPlay;
window.onVideoPause = onVideoPause;
window.onVideoEnded = onVideoEnded;
window.openMomentLightbox = openMomentLightbox;
window.pauseAllVideos = pauseAllVideos;
window.formatTime = formatTime;