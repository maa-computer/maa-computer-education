/* ============================================
   ADMISSION-FORM.JS - FIXED ✅
   ============================================ */

// ============================================
// CONFIGURATION
// ============================================

const FORM_CONFIG = {
    whatsappNumber: '919777084142', // ✅ + HATAYA (91 ke sath)
    formSubmitEmail: 'mcekalimela@gmail.com',
    formSubmitEndpoint: 'https://formsubmit.co/ajax/mcekalimela@gmail.com'
};

// ============================================
// TOAST
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
    }, 4000);
}

// ============================================
// GET COURSE NAME
// ============================================

function getCourseName() {
    // Page title se le
    const pageTitle = document.title;
    if (pageTitle && !pageTitle.includes('Ma Computer')) {
        const cleaned = pageTitle.replace(' - Ma Computer Education', '').trim();
        if (cleaned && cleaned.length > 0) {
            console.log('✅ Course from title:', cleaned);
            return cleaned;
        }
    }
    
    // URL se le
    const urlParams = new URLSearchParams(window.location.search);
    let courseId = urlParams.get('id');
    if (courseId) {
        console.log('✅ Course from URL:', courseId.toUpperCase());
        return courseId.toUpperCase();
    }
    
    // Hidden field se le
    let course = document.getElementById('admissionCourse')?.value;
    if (course && course !== 'Not Specified' && course !== '') {
        console.log('✅ Course from hidden field:', course);
        return course;
    }
    
    // Course header se le
    const header = document.querySelector('.course-header h1');
    if (header && header.textContent) {
        console.log('✅ Course from header:', header.textContent);
        return header.textContent;
    }
    
    // Breadcrumb se le
    const breadcrumb = document.querySelector('.breadcrumb span:last-child');
    if (breadcrumb && breadcrumb.textContent && breadcrumb.textContent !== 'Course Details') {
        console.log('✅ Course from breadcrumb:', breadcrumb.textContent);
        return breadcrumb.textContent;
    }
    
    console.warn('⚠️ No course found, using default');
    return 'Computer Course';
}

// ============================================
// VALIDATION
// ============================================

function validateName(name) {
    return name && name.trim().length >= 2;
}

function validateMobile(mobile) {
    const cleaned = mobile.replace(/\s/g, '');
    return cleaned && cleaned.length >= 10 && /^[0-9]+$/.test(cleaned);
}

function validateEmail(email) {
    if (!email) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('error');
    field.classList.remove('success');
    
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    if (message) {
        const error = document.createElement('span');
        error.className = 'field-error';
        error.textContent = message;
        error.style.cssText = `
            display: block;
            font-size: 12px;
            color: #fc8181;
            margin-top: 4px;
        `;
        field.parentElement.appendChild(error);
    }
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('error');
    field.classList.add('success');
    
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
}

function clearFieldState(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('error', 'success');
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) existingError.remove();
}

// ============================================
// SUBMIT ADMISSION FORM - FIXED ✅
// ============================================

async function submitAdmission(event) {
    event.preventDefault();
    
    console.log('📝 Form submitted!');
    
    const name = document.getElementById('admissionName')?.value.trim();
    const mobile = document.getElementById('admissionMobile')?.value.trim();
    const email = document.getElementById('admissionEmail')?.value.trim();
    const address = document.getElementById('admissionAddress')?.value.trim();
    const course = getCourseName();
    
    console.log('📝 Final Course Name:', course);
    
    ['admissionName', 'admissionMobile', 'admissionEmail', 'admissionAddress'].forEach(clearFieldState);
    
    let isValid = true;
    
    if (!validateName(name)) {
        showFieldError('admissionName', 'Please enter your full name');
        isValid = false;
    } else {
        showFieldSuccess('admissionName');
    }
    
    if (!validateMobile(mobile)) {
        showFieldError('admissionMobile', 'Please enter valid 10-digit mobile number');
        isValid = false;
    } else {
        showFieldSuccess('admissionMobile');
    }
    
    if (email && !validateEmail(email)) {
        showFieldError('admissionEmail', 'Please enter valid email address');
        isValid = false;
    } else if (email) {
        showFieldSuccess('admissionEmail');
    }
    
    if (!address || address.length < 2) {
        showFieldError('admissionAddress', 'Please enter your address');
        isValid = false;
    } else {
        showFieldSuccess('admissionAddress');
    }
    
    if (!isValid) {
        showToast('⚠️ Please fix the errors above', 'warning');
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '⏳ Submitting...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    
    try {
        sendToWhatsApp(name, mobile, email, address, course);
        const emailSent = await sendToEmailFormSubmit(name, mobile, email, address, course);
        
        if (emailSent) {
            showToast('✅ Form submitted successfully! We will contact you soon.', 'success');
            event.target.reset();
            ['admissionName', 'admissionMobile', 'admissionEmail', 'admissionAddress'].forEach(clearFieldState);
        } else {
            showToast('✅ Form submitted! We will contact you soon.', 'success');
            event.target.reset();
            ['admissionName', 'admissionMobile', 'admissionEmail', 'admissionAddress'].forEach(clearFieldState);
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showToast('⚠️ Error submitting form. Please try again.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

// ============================================
// SEND TO WHATSAPP - ✅ FIXED
// ============================================

function sendToWhatsApp(name, mobile, email, address, course) {
    // ✅ URL encode karo
    const encodedMessage = encodeURIComponent(
        `📝 *New Admission Enquiry*\n\n` +
        `*Name:* ${name}\n` +
        `*Mobile:* ${mobile}\n` +
        `*Email:* ${email || 'N/A'}\n` +
        `*Address:* ${address || 'N/A'}\n` +
        `*Course:* ${course}\n\n` +
        `📅 Enquiry Date: ${new Date().toLocaleDateString('en-IN')}`
    );
    
    let phone = FORM_CONFIG.whatsappNumber;
    
    // Agar website.json me number hai toh wo use karo
    if (window.App?.websiteData?.phone) {
        phone = window.App.websiteData.phone.replace(/\s/g, '').replace('+', '').replace('91', '');
        phone = '91' + phone;
    }
    
    // ✅ SAHI URL - without + sign
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    
    console.log('📱 WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    
    return true;
}

// ============================================
// SEND TO EMAIL via FormSubmit
// ============================================

async function sendToEmailFormSubmit(name, mobile, email, address, course) {
    try {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('mobile', mobile);
        formData.append('email', email || 'N/A');
        formData.append('address', address || 'N/A');
        formData.append('course', course);
        formData.append('_subject', 'New Admission Enquiry from Website');
        formData.append('_captcha', 'false');
        formData.append('_template', 'table');
        
        const response = await fetch(FORM_CONFIG.formSubmitEndpoint, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            console.log('✅ Email sent via FormSubmit');
            return true;
        } else {
            console.warn('⚠️ FormSubmit response:', response.status);
            return false;
        }
    } catch (error) {
        console.error('❌ FormSubmit error:', error);
        return false;
    }
}

// ============================================
// REAL-TIME VALIDATION
// ============================================

function initFormValidation() {
    const fields = [
        { id: 'admissionName', validate: validateName, errorMsg: 'Enter your full name' },
        { id: 'admissionMobile', validate: validateMobile, errorMsg: 'Enter valid 10-digit mobile number' },
        { id: 'admissionEmail', validate: validateEmail, errorMsg: 'Enter valid email address' },
        { id: 'admissionAddress', validate: (v) => v && v.length >= 2, errorMsg: 'Enter your address' }
    ];
    
    fields.forEach(({ id, validate, errorMsg }) => {
        const field = document.getElementById(id);
        if (!field) return;
        
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            if (value && !validate(value)) {
                showFieldError(id, errorMsg);
            } else if (value && validate(value)) {
                showFieldSuccess(id);
            } else {
                clearFieldState(id);
            }
        });
        
        field.addEventListener('input', function() {
            const value = this.value.trim();
            if (value && validate(value)) {
                showFieldSuccess(id);
            } else if (value) {
                showFieldError(id, errorMsg);
            } else {
                clearFieldState(id);
            }
        });
    });
}

// ============================================
// EXPOSE FUNCTIONS
// ============================================

window.submitAdmission = submitAdmission;
window.getCourseName = getCourseName;
window.sendToWhatsApp = sendToWhatsApp;
window.sendToEmailFormSubmit = sendToEmailFormSubmit;
window.initFormValidation = initFormValidation;
window.showToast = showToast;

document.addEventListener('DOMContentLoaded', function() {
    initFormValidation();
    console.log('📝 Admission Form Loaded');
    console.log('📱 WhatsApp: ' + FORM_CONFIG.whatsappNumber);
});