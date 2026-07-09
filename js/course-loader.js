/* ============================================
   COURSE-LOADER.JS - Load Course Data (FULLY FIXED)
   ============================================ */

// ============================================
// SHOW TOAST (Fallback - if not defined elsewhere)
// ============================================

function showToast(message, type = 'info') {
    // Try to use existing toast from app.js
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
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
    
    const colors = {
        success: '#48bb78',
        error: '#fc8181',
        warning: '#f6ad55',
        info: '#667eea'
    };
    
    toast.textContent = message;
    toast.style.opacity = '1';
    if (colors[type]) {
        toast.style.borderBottom = `3px solid ${colors[type]}`;
    }
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
    }, 3000);
}

// ============================================
// LOAD COURSES FOR HOMEPAGE
// ============================================

async function loadCourses() {
    const container = document.getElementById('coursesGrid');
    if (!container) return;
    
    // Show loading skeleton
    showCourseSkeleton(container);
    
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) throw new Error('Courses data not found');
        const data = await response.json();
        renderCourses(container, data.courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        container.innerHTML = `
            <div class="error" style="grid-column:1/-1; text-align:center; padding:40px;">
                <p style="font-size:48px;">📚</p>
                <h3>Unable to load courses</h3>
                <p style="color:var(--text-light);">Please try again later.</p>
                <button onclick="loadCourses()" style="margin-top:15px; padding:10px 30px; background:var(--secondary); color:var(--primary-dark); border:none; border-radius:25px; cursor:pointer; font-weight:600;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

// ============================================
// SHOW COURSE SKELETON
// ============================================

function showCourseSkeleton(container) {
    container.innerHTML = `
        ${Array(6).fill(0).map((_, i) => `
            <div class="course-card skeleton" style="animation-delay: ${i * 0.05}s; opacity:1;">
                <div style="width:100%; height:150px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px;"></div>
                <div style="height:20px; width:70%; margin:12px auto 8px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
                <div style="height:16px; width:40%; margin:0 auto; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
            </div>
        `).join('')}
        <style>
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            .course-card.skeleton {
                cursor: default !important;
                pointer-events: none !important;
            }
            .course-card.skeleton:hover {
                transform: none !important;
                box-shadow: var(--shadow) !important;
            }
        </style>
    `;
}

// ============================================
// RENDER COURSES - FIXED ✅ (Popular removed, Lessons added)
// ============================================

function renderCourses(container, courses) {
    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div style="grid-column:1/-1; text-align:center; padding:40px;">
                <p style="font-size:48px;">📚</p>
                <h3>No courses available</h3>
                <p style="color:var(--text-light);">Check back later for new courses.</p>
            </div>
        `;
        return;
    }
    
    // Update course count if element exists
    const countEl = document.getElementById('courseCount');
    if (countEl) {
        countEl.textContent = `${courses.length} Courses`;
    }
    
    container.innerHTML = courses.map((course, index) => `
        <div class="course-card" onclick="openCourse('${course.id}')" style="animation-delay: ${index * 0.05}s">
            <img src="${course.image || 'assets/images/courses/default.jpg'}" 
                 alt="${course.name}" 
                 loading="lazy"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22150%22 viewBox=%220 0 300 150%22%3E%3Crect width=%22300%22 height=%22150%22 fill=%22%231a3a5c%22/%3E%3Ctext x=%22150%22 y=%2275%22 text-anchor=%22middle%22 font-size=%2220%22 fill=%22%23e8a838%22 font-family=%22Arial%22%3E${course.name}%3C/text%3E%3C/svg%3E'">
            <h3>${course.name}</h3>
            <div class="course-fees">${course.fees || '₹---'}</div>
            <div class="course-duration">⏱️ ${course.duration || 'N/A'}</div>
            <!-- ✅ Popular tag removed, Lessons added -->
            <div class="course-lessons">📖 ${course.lessons || 0} Lessons</div>
            ${course.new ? '<span class="course-tag" style="background:#48bb78;">🆕 New</span>' : ''}
        </div>
    `).join('');
}

// ============================================
// OPEN COURSE DETAILS
// ============================================

function openCourse(courseId) {
    if (!courseId) {
        console.error('❌ No course ID provided');
        showToast('⚠️ Error opening course', 'error');
        return;
    }
    window.location.href = `course-details.html?id=${courseId}`;
}

// ============================================
// LOAD COURSE DETAILS
// ============================================

async function loadCourseDetails() {
    const container = document.getElementById('courseContent');
    if (!container) return;
    
    // Get course ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');
    
    console.log('🔍 Course ID from URL:', courseId);
    
    if (!courseId) {
        container.innerHTML = `
            <div class="error" style="text-align:center; padding:60px 20px;">
                <p style="font-size:64px;">❌</p>
                <h3>No course selected</h3>
                <p style="color:var(--text-light);">Please select a course from the homepage.</p>
                <a href="index.html#courses" class="btn-primary" style="margin-top:20px; display:inline-block;">View Courses</a>
            </div>
        `;
        return;
    }
    
    // Show skeleton
    showDetailsSkeleton(container);
    
    try {
        // Load course data
        const response = await fetch(`data/courses/${courseId}.json`);
        if (!response.ok) throw new Error('Course not found');
        const data = await response.json();
        renderCourseDetails(container, data, courseId);
        
        // Load related courses
        loadRelatedCourses(courseId);
    } catch (error) {
        console.error('Error loading course:', error);
        container.innerHTML = `
            <div class="error" style="text-align:center; padding:60px 20px;">
                <p style="font-size:64px;">📚</p>
                <h3>Course not found: "${courseId}"</h3>
                <p style="color:var(--text-light);">The course you're looking for doesn't exist.</p>
                <a href="index.html#courses" class="btn-primary" style="margin-top:20px; display:inline-block;">View All Courses</a>
                <button onclick="loadCourseDetails()" style="margin-top:15px; padding:10px 30px; background:var(--secondary); color:var(--primary-dark); border:none; border-radius:25px; cursor:pointer; font-weight:600; margin-left:10px;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

// ============================================
// SHOW DETAILS SKELETON
// ============================================

function showDetailsSkeleton(container) {
    container.innerHTML = `
        <div style="background:var(--bg-white); border-radius:var(--radius); padding:30px 35px; box-shadow:var(--shadow); margin-bottom:25px;">
            <div style="height:36px; width:60%; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:6px;"></div>
            <div style="height:20px; width:40%; margin-top:8px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:25px;">
            ${Array(6).fill(0).map(() => `
                <div style="background:var(--bg-light); padding:16px; border-radius:8px; text-align:center;">
                    <div style="height:24px; width:40%; margin:0 auto 8px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
                    <div style="height:16px; width:60%; margin:0 auto; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
                </div>
            `).join('')}
        </div>
        <div style="background:var(--bg-white); border-radius:var(--radius); padding:25px 30px; box-shadow:var(--shadow); margin-bottom:25px;">
            <div style="height:24px; width:30%; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px; margin-bottom:12px;"></div>
            <div style="height:16px; width:90%; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
            <div style="height:16px; width:80%; margin-top:8px; background:linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:4px;"></div>
        </div>
        <style>
            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        </style>
    `;
}

// ============================================
// RENDER COURSE DETAILS
// ============================================

function renderCourseDetails(container, data, courseId) {
    // Update breadcrumb
    const breadcrumbSpan = document.getElementById('courseBreadcrumb');
    if (breadcrumbSpan) breadcrumbSpan.textContent = data.name || courseId.toUpperCase();
    
    // Update page title
    document.title = `${data.name || courseId.toUpperCase()} - Ma Computer Education`;
    
    // Build HTML
    let html = `
        <!-- Course Header -->
        <div class="course-header">
            <h1>${data.name || courseId.toUpperCase()}</h1>
            <p class="course-subtitle">${data.tagline || 'Complete computer training course'}</p>
        </div>
        
        <!-- Course Info Grid -->
        <div class="course-info-grid">
            <div class="course-info-item">
                <span class="info-icon">💰</span>
                <div class="info-label">Fees</div>
                <div class="info-value">${data.fees || '₹---'}</div>
            </div>
            <div class="course-info-item">
                <span class="info-icon">⏱️</span>
                <div class="info-label">Duration</div>
                <div class="info-value">${data.duration || 'N/A'}</div>
            </div>
            <div class="course-info-item">
                <span class="info-icon">🎯</span>
                <div class="info-label">Eligibility</div>
                <div class="info-value">${data.eligibility || '10th Pass'}</div>
            </div>
            <div class="course-info-item">
                <span class="info-icon">📜</span>
                <div class="info-label">Certificate</div>
                <div class="info-value">${data.certificate || 'Yes'}</div>
            </div>
            <div class="course-info-item">
                <span class="info-icon">💻</span>
                <div class="info-label">Practical Classes</div>
                <div class="info-value">${data.practicalClasses || 'Yes'}</div>
            </div>
            <div class="course-info-item">
                <span class="info-icon">💼</span>
                <div class="info-label">Job Assistance</div>
                <div class="info-value">${data.jobAssistance || 'Yes'}</div>
            </div>
            <!-- ✅ Lessons added in course details -->
            ${data.lessons ? `
            <div class="course-info-item">
                <span class="info-icon">📖</span>
                <div class="info-label">Total Lessons</div>
                <div class="info-value">${data.lessons}</div>
            </div>
            ` : ''}
        </div>
    `;
    
    // Course Description
    if (data.description) {
        html += `
            <div class="course-description">
                <h2>📖 About This Course</h2>
                <p>${data.description}</p>
            </div>
        `;
    }
    
    // Syllabus
    if (data.syllabus && data.syllabus.length > 0) {
        html += `
            <div class="course-syllabus">
                <h2>📋 Syllabus</h2>
                <ul class="syllabus-list">
                    ${data.syllabus.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Documents Required
    if (data.documentsRequired && data.documentsRequired.length > 0) {
        html += `
            <div class="documents-section">
                <h2>📄 Documents Required</h2>
                <ul class="documents-grid">
                    ${data.documentsRequired.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Benefits
    if (data.benefits && data.benefits.length > 0) {
        html += `
            <div class="benefits-section">
                <h2>✅ Why Join This Course</h2>
                <ul class="benefits-grid">
                    ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Admission Section
    html += `
        <div class="admission-section" id="admissionSection">
            <h2>📝 Register For Admission</h2>
            <p class="admission-subtitle">We will contact you within 24 hours.</p>
            <form class="admission-form" id="admissionForm" onsubmit="submitAdmission(event)">
                <input type="hidden" id="admissionCourse" value="${data.name || courseId.toUpperCase()}">
                <div class="form-group">
                    <label for="admissionName">Full Name *</label>
                    <input type="text" id="admissionName" placeholder="Enter your full name" required>
                </div>
                <div class="form-group">
                    <label for="admissionMobile">Mobile Number *</label>
                    <input type="tel" id="admissionMobile" placeholder="Enter your mobile number" required>
                </div>
                <div class="form-group">
                    <label for="admissionEmail">Email Address</label>
                    <input type="email" id="admissionEmail" placeholder="Enter your email address">
                </div>
                <div class="form-group">
                    <label for="admissionAddress">Address</label>
                    <textarea id="admissionAddress" rows="3" placeholder="Enter your address"></textarea>
                </div>
                <button type="submit" class="btn-primary">Submit Admission Form</button>
            </form>
        </div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// LOAD RELATED COURSES
// ============================================

async function loadRelatedCourses(currentCourseId) {
    const container = document.getElementById('relatedGrid');
    if (!container) return;
    
    try {
        const response = await fetch('data/courses.json');
        if (!response.ok) throw new Error('Courses not found');
        const data = await response.json();
        
        // Filter out current course and get first 3
        let related = data.courses.filter(c => c.id !== currentCourseId);
        
        // Shuffle and take first 3
        if (related.length > 3) {
            const shuffled = related.sort(() => 0.5 - Math.random());
            related = shuffled.slice(0, 3);
        }
        
        if (related.length === 0) {
            container.innerHTML = `
                <p style="text-align:center; color:var(--text-light); padding:20px;">
                    No related courses found
                </p>
            `;
            return;
        }
        
        container.innerHTML = related.map(course => `
            <div class="related-card" onclick="openCourse('${course.id}')">
                <div class="related-icon">📘</div>
                <h3>${course.name}</h3>
                <p>${course.duration || ''} • ${course.fees || ''}</p>
                <span class="related-arrow">→</span>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading related courses:', error);
        container.innerHTML = `
            <p style="text-align:center; color:var(--text-light); padding:20px;">
                No related courses available
            </p>
        `;
    }
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.loadCourses = loadCourses;
window.loadCourseDetails = loadCourseDetails;
window.openCourse = openCourse;
window.loadRelatedCourses = loadRelatedCourses;
window.showToast = showToast;