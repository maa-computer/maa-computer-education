/* ============================================
   DEVELOPER.JS - Load Developer Profile (FIXED)
   ============================================ */

// ============================================
// LOAD DEVELOPER PROFILE
// ============================================

async function loadDeveloperProfile() {
    // Try multiple container IDs
    let container = document.getElementById('developerContent');
    if (!container) {
        container = document.getElementById('developerCard');
    }
    if (!container) {
        console.error('❌ Developer container not found');
        return;
    }
    
    try {
        console.log('📂 Loading developer profile...');
        const response = await fetch('data/developer.json');
        
        if (!response.ok) {
            throw new Error('Developer data not found');
        }
        
        const data = await response.json();
        console.log('✅ Developer data loaded:', data);
        renderDeveloper(container, data.developer);
        
        // Hide loader if exists
        const loader = document.getElementById('developerLoader');
        if (loader) loader.style.display = 'none';
        container.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Error loading developer:', error);
        showFallbackDeveloper(container);
    }
}

// ============================================
// RENDER DEVELOPER
// ============================================

function renderDeveloper(container, dev) {
    // Profile Photo
    const photoHtml = dev.photo 
        ? `<img src="${dev.photo}" alt="${dev.name}" class="dev-photo" onerror="this.style.display='none'">`
        : `<div class="dev-photo-placeholder">👨‍💻</div>`;
    
    // Skills
    const skillsHtml = dev.skills && dev.skills.length ? dev.skills.map(skill => `
        <span class="skill-tag">
            <i class="${skill.icon}" style="color:${skill.color}"></i> ${skill.name}
        </span>
    `).join('') : '';
    
    // Projects
    const projectsHtml = dev.projects && dev.projects.length ? dev.projects.map(project => `
        <div class="project-card">
            <div class="project-name">
                ${project.link && project.link !== '#' 
                    ? `<a href="${project.link}" target="_blank">${project.name}</a>`
                    : project.name
                }
                ${project.link && project.link !== '#' ? ' 🔗' : ''}
            </div>
            <div class="project-desc">${project.description}</div>
            <span class="project-status ${project.status}">
                ${project.status === 'completed' ? '✅ Completed' : '⏳ Upcoming'}
            </span>
        </div>
    `).join('') : '<p style="color:var(--text-light);">No projects yet.</p>';
    
    // Qualifications
    const qualHtml = dev.qualifications && dev.qualifications.length ? 
        dev.qualifications.map(q => `<li>${q}</li>`).join('') : 
        '<li>No qualifications listed</li>';
    
    // Social Links
    const socialHtml = `
        ${dev.social?.whatsapp ? `<a href="${dev.social.whatsapp}" class="whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>` : ''}
        ${dev.social?.telegram ? `<a href="${dev.social.telegram}" class="telegram" target="_blank"><i class="fab fa-telegram-plane"></i> Telegram</a>` : ''}
        ${dev.social?.linkedin ? `<a href="${dev.social.linkedin}" class="linkedin" target="_blank"><i class="fab fa-linkedin-in"></i> LinkedIn</a>` : ''}
        ${dev.social?.github ? `<a href="${dev.social.github}" class="github" target="_blank"><i class="fab fa-github"></i> GitHub</a>` : ''}
        ${dev.social?.instagram ? `<a href="${dev.social.instagram}" class="instagram" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ''}
        ${dev.social?.youtube ? `<a href="${dev.social.youtube}" class="youtube" target="_blank"><i class="fab fa-youtube"></i> YouTube</a>` : ''}
        ${dev.contact?.email ? `<a href="mailto:${dev.contact.email}" class="email"><i class="fas fa-envelope"></i> Email</a>` : ''}
    `;
    
    container.innerHTML = `
        <div class="developer-card">
            <!-- Profile -->
            <div class="dev-profile">
                ${photoHtml}
                <div class="dev-info">
                    <h1>${dev.name || 'Developer'}</h1>
                    <div class="dev-title">${dev.title || 'Web Developer'}</div>
                    <div class="dev-tagline">${dev.tagline || 'Building beautiful websites'}</div>
                </div>
            </div>
            
            <!-- Stats -->
            ${dev.experience ? `
            <div class="dev-stats">
                <div class="dev-stat">
                    <div class="stat-number">${dev.experience.years || 0}+</div>
                    <div class="stat-label">Years</div>
                </div>
                <div class="dev-stat">
                    <div class="stat-number">${dev.experience.projects || 0}</div>
                    <div class="stat-label">Projects</div>
                </div>
                <div class="dev-stat">
                    <div class="stat-number">${dev.experience.clients || 0}</div>
                    <div class="stat-label">Clients</div>
                </div>
                <div class="dev-stat">
                    <div class="stat-number">${dev.experience.satisfaction || '100%'}</div>
                    <div class="stat-label">Satisfaction</div>
                </div>
            </div>
            ` : ''}
            
            <!-- Bio -->
            ${dev.bio ? `
            <div class="dev-bio">
                <p>${dev.bio}</p>
            </div>
            ` : ''}
            
            <!-- Skills -->
            ${dev.skills && dev.skills.length ? `
            <div class="dev-skills">
                <h3>💻 Skills</h3>
                <div class="skills-grid">${skillsHtml}</div>
            </div>
            ` : ''}
            
            <!-- Projects -->
            <div class="dev-projects">
                <h3>📊 Projects</h3>
                <div class="projects-grid">${projectsHtml}</div>
            </div>
            
            <!-- Qualifications -->
            <div class="dev-qualifications">
                <h3>🎓 Qualifications</h3>
                <ul class="qualifications-list">${qualHtml}</ul>
            </div>
            
            <!-- Contact -->
            ${dev.contact ? `
            <div class="dev-contact">
                <p><i class="fas fa-phone"></i> ${dev.contact.phone || 'N/A'}</p>
                <p><i class="fas fa-envelope"></i> ${dev.contact.email || 'N/A'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${dev.contact.location || 'N/A'}</p>
            </div>
            ` : ''}
            
            <!-- Social Links -->
            ${socialHtml ? `
            <div class="dev-social">
                <h3>📱 Connect With Me</h3>
                <div class="social-links">${socialHtml}</div>
            </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// SHOW FALLBACK DEVELOPER (When JSON fails)
// ============================================

function showFallbackDeveloper(container) {
    container.innerHTML = `
        <div class="developer-card">
            <!-- Profile -->
            <div class="dev-profile">
                <div class="dev-photo-placeholder">👨‍💻</div>
                <div class="dev-info">
                    <h1>Subhankar Bairagi</h1>
                    <div class="dev-title">Web Developer &amp; Designer</div>
                    <div class="dev-tagline">Building beautiful &amp; functional websites</div>
                </div>
            </div>
            
            <!-- Stats -->
            <div class="dev-stats">
                <div class="dev-stat"><div class="stat-number">3+</div><div class="stat-label">Years</div></div>
                <div class="dev-stat"><div class="stat-number">25</div><div class="stat-label">Projects</div></div>
                <div class="dev-stat"><div class="stat-number">15</div><div class="stat-label">Clients</div></div>
                <div class="dev-stat"><div class="stat-number">100%</div><div class="stat-label">Satisfaction</div></div>
            </div>
            
            <!-- Bio -->
            <div class="dev-bio">
                <p>I am a passionate web developer with 3+ years of experience in creating responsive, user-friendly websites. I specialize in HTML, CSS, JavaScript, and modern frameworks.</p>
            </div>
            
            <!-- Skills -->
            <div class="dev-skills">
                <h3>💻 Skills</h3>
                <div class="skills-grid">
                    <span class="skill-tag"><i class="fab fa-html5" style="color:#E34F26;"></i> HTML5</span>
                    <span class="skill-tag"><i class="fab fa-css3-alt" style="color:#1572B6;"></i> CSS3</span>
                    <span class="skill-tag"><i class="fab fa-js" style="color:#F7DF1E;"></i> JavaScript</span>
                    <span class="skill-tag"><i class="fab fa-react" style="color:#61DAFB;"></i> React</span>
                </div>
            </div>
            
            <!-- Projects -->
            <div class="dev-projects">
                <h3>📊 Projects</h3>
                <div class="projects-grid">
                    <div class="project-card">
                        <div class="project-name">📚 Study Notes</div>
                        <div class="project-desc">Study notes platform</div>
                        <span class="project-status completed">✅ Completed</span>
                    </div>
                    <div class="project-card">
                        <div class="project-name">💻 Ma Computer</div>
                        <div class="project-desc">Training institute website</div>
                        <span class="project-status completed">✅ Completed</span>
                    </div>
                </div>
            </div>
            
            <!-- Qualifications -->
            <div class="dev-qualifications">
                <h3>🎓 Qualifications</h3>
                <ul class="qualifications-list">
                    <li>B.Sc in Computer Science</li>
                    <li>Full Stack Web Development Certified</li>
                </ul>
            </div>
            
            <!-- Contact -->
            <div class="dev-contact">
                <p><i class="fas fa-phone"></i> +91-9777084142</p>
                <p><i class="fas fa-envelope"></i> subhankarbairagi@gmail.com</p>
                <p><i class="fas fa-map-marker-alt"></i> Kalimela, Odisha</p>
            </div>
            
            <!-- Social -->
            <div class="dev-social">
                <h3>📱 Connect With Me</h3>
                <div class="social-links">
                    <a href="https://wa.me/919777084142" class="whatsapp" target="_blank"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                    <a href="https://t.me/subhankarb" class="telegram" target="_blank"><i class="fab fa-telegram-plane"></i> Telegram</a>
                    <a href="https://linkedin.com/in/subhankarb" class="linkedin" target="_blank"><i class="fab fa-linkedin-in"></i> LinkedIn</a>
                    <a href="mailto:subhankarbairagi@gmail.com" class="email"><i class="fas fa-envelope"></i> Email</a>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('👨‍💻 Developer page loaded');
    
    // Check if we are on developer page
    if (window.location.pathname.includes('developer.html')) {
        console.log('📍 On developer page, loading profile...');
        // Small delay to ensure DOM is ready
        setTimeout(loadDeveloperProfile, 100);
    }
});

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.loadDeveloperProfile = loadDeveloperProfile;
window.renderDeveloper = renderDeveloper;
window.showFallbackDeveloper = showFallbackDeveloper;

console.log('✅ developer.js loaded successfully');