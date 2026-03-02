/**
 * ShieldGuard Pro - Interactive JavaScript
 * Handles UI interactions and client-side functionality
 */

// ========================================
// DARK MODE TOGGLE
// ========================================
function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.querySelector('#darkModeToggle i');
    
    if (html.getAttribute('data-bs-theme') === 'dark') {
        html.setAttribute('data-bs-theme', 'light');
        icon.classList.remove('bi-sun');
        icon.classList.add('bi-moon');
        localStorage.setItem('darkMode', 'light');
    } else {
        html.setAttribute('data-bs-theme', 'dark');
        icon.classList.remove('bi-moon');
        icon.classList.add('bi-sun');
        localStorage.setItem('darkMode', 'dark');
    }
}

// Initialize dark mode on load
document.addEventListener('DOMContentLoaded', function() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (savedTheme === 'dark') {
                icon.classList.remove('bi-moon');
                icon.classList.add('bi-sun');
            }
        }
    }
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
});

// ========================================
// AUTO-HIDE ALERTS
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

// ========================================
// URL VALIDATION
// ========================================
function validateURL(url) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i'
    );
    return pattern.test(url);
}

// ========================================
// COPY TO CLIPBOARD
// ========================================
function copyToClipboard(text, btnElement) {
    navigator.clipboard.writeText(text).then(function() {
        const btn = btnElement || event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-outline-secondary');
        setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
    });
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="bi ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
// FORM SUBMISSION WITH LOADING
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.disabled) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.innerHTML;
                
                // Add spinner text
                const btnText = submitBtn.querySelector('span');
                if (btnText) {
                    btnText.textContent = 'Processing...';
                } else {
                    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Processing...';
                }
            }
        });
    });
});

// ========================================
// PASSWORD STRENGTH CHECKER
// ========================================
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[$@#&!]+/)) strength += 1;
    return strength;
}

function updatePasswordStrength(password, meterId, textId) {
    const meter = document.getElementById(meterId);
    const text = document.getElementById(textId);
    if (!meter) return;
    
    const strength = checkPasswordStrength(password);
    let strengthText = '';
    let strengthClass = '';
    let width = 0;
    
    switch(strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthClass = 'bg-danger';
            width = 20;
            break;
        case 2:
            strengthText = 'Weak';
            strengthClass = 'bg-warning';
            width = 40;
            break;
        case 3:
            strengthText = 'Fair';
            strengthClass = 'bg-info';
            width = 60;
            break;
        case 4:
            strengthText = 'Good';
            strengthClass = 'bg-primary';
            width = 80;
            break;
        case 5:
            strengthText = 'Strong';
            strengthClass = 'bg-success';
            width = 100;
            break;
    }
    
    meter.className = 'progress-bar ' + strengthClass;
    meter.style.width = width + '%';
    if (text) text.textContent = strengthText;
}

// ========================================
// BACK TO TOP BUTTON
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const backToTop = document.createElement('div');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="bi bi-arrow-up"></i>';
    document.body.appendChild(backToTop);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    });
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});

// ========================================
// FADE IN ON SCROLL
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const fadeElements = document.querySelectorAll('.fade-in-up');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    fadeElements.forEach(el => observer.observe(el));
});

// ========================================
// INPUT VALIDATION FEEDBACK
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-control');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.checkValidity()) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.checkValidity()) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            }
        });
    });
});

// ========================================
// URL INPUT REAL-TIME CHECK
// ========================================
function initURLChecker(inputId, resultId) {
    const input = document.getElementById(inputId);
    const result = document.getElementById(resultId);
    
    if (!input || !result) return;
    
    input.addEventListener('input', function() {
        const url = this.value.trim();
        
        if (url.length === 0) {
            result.innerHTML = '';
            return;
        }
        
        if (!validateURL(url)) {
            result.innerHTML = '<small class="text-danger"><i class="bi bi-exclamation-circle"></i> Please enter a valid URL</small>';
        } else {
            result.innerHTML = '<small class="text-success"><i class="bi bi-check-circle"></i> Valid URL format</small>';
        }
    });
}

// ========================================
// CONFETTI EFFECT FOR SAFE RESULTS
// ========================================
function triggerConfetti() {
    const colors = ['#667eea', '#764ba2', '#51cf66', '#4facfe', '#fa709a'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            top: -10px;
            left: ${Math.random() * 100}vw;
            z-index: 9999;
            border-radius: 50%;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 4000);
    }
    
    // Add confetti animation
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// ========================================
// SKELETON LOADING
// ========================================
function showSkeleton(elementId, lines = 3) {
    const container = document.getElementById(elementId);
    if (!container) return;
    
    container.innerHTML = '';
    for (let i = 0; i < lines; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton';
        skeleton.style.height = '20px';
        skeleton.style.marginBottom = '10px';
        skeleton.style.width = Math.random() * 40 + 60 + '%';
        container.appendChild(skeleton);
    }
}

// ========================================
// PROGRESS CIRCLE
// ========================================
function setProgressCircle(elementId, percentage) {
    const circle = document.getElementById(elementId);
    if (!circle) return;
    
    circle.style.background = `conic-gradient(var(--primary-color) ${percentage}%, var(--bg-secondary) ${percentage}%)`;
    const span = circle.querySelector('span');
    if (span) {
        span.textContent = percentage + '%';
    }
}

// URL Validation
function validateURL(url) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i' // fragment locator
    );
    return pattern.test(url);
}

// Show Loading Spinner
function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.add('active');
    }
}

// Hide Loading Spinner
function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.remove('active');
    }
}

// Display Result with Animation
function displayResult(data) {
    const resultSection = document.getElementById('resultSection');
    if (resultSection) {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Copy to Clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        // Show success feedback
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check"></i> Copied!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-outline-secondary');
        
        setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        }, 2000);
    }).catch(function(err) {
        console.error('Failed to copy: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Confirmation Dialog
function confirmAction(message) {
    return confirm(message);
}

// Update Progress Bar
function updateProgressBar(confidence, elementId = 'confidenceBar') {
    const progressBar = document.getElementById(elementId);
    if (progressBar) {
        progressBar.style.width = confidence + '%';
        progressBar.textContent = confidence.toFixed(1) + '%';
        
        // Change color based on confidence
        progressBar.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        if (confidence >= 80) {
            progressBar.classList.add('bg-success');
        } else if (confidence >= 50) {
            progressBar.classList.add('bg-warning');
        } else {
            progressBar.classList.add('bg-danger');
        }
    }
}

// Search History
function searchHistory() {
    const searchInput = document.getElementById('searchInput');
    const filter = searchInput.value.toLowerCase();
    const table = document.getElementById('historyTable');
    const rows = table.getElementsByTagName('tr');
    
    for (let i = 1; i < rows.length; i++) {
        const urlCell = rows[i].getElementsByTagName('td')[0];
        if (urlCell) {
            const urlText = urlCell.textContent || urlCell.innerText;
            if (urlText.toLowerCase().indexOf(filter) > -1) {
                rows[i].style.display = '';
            } else {
                rows[i].style.display = 'none';
            }
        }
    }
}

// Sort Table
function sortTable(columnIndex) {
    const table = document.getElementById('historyTable');
    let switching = true;
    let dir = 'asc';
    let switchcount = 0;
    
    while (switching) {
        switching = false;
        const rows = table.rows;
        
        for (let i = 1; i < rows.length - 1; i++) {
            let shouldSwitch = false;
            const x = rows[i].getElementsByTagName('TD')[columnIndex];
            const y = rows[i + 1].getElementsByTagName('TD')[columnIndex];
            
            if (dir === 'asc') {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === 'desc') {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount === 0 && dir === 'asc') {
                dir = 'desc';
                switching = true;
            }
        }
    }
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        }
    });
    
    return isValid;
}

// Auto-hide alerts after 5 seconds
document.addEventListener('DOMContentLoaded', function() {
    const alerts = document.querySelectorAll('.alert:not(.alert-permanent)');
    alerts.forEach(alert => {
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
});

// Smooth scroll to anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Character counter for textareas
function initCharCounter(textareaId, counterId, maxChars) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    
    if (textarea && counter) {
        textarea.addEventListener('input', function() {
            const remaining = maxChars - this.value.length;
            counter.textContent = remaining + ' characters remaining';
            
            if (remaining < 0) {
                counter.classList.add('text-danger');
            } else {
                counter.classList.remove('text-danger');
            }
        });
    }
}

// Export to CSV
function exportTableToCSV(tableId, filename) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');
    let csv = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            let data = cols[j].innerText.replace(/(",)/g, '""');
            row.push('"' + data + '"');
        }
        
        csv.push(row.join(','));
    }
    
    downloadCSV(csv.join('\n'), filename);
}

function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], {type: 'text/csv'});
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Feature importance chart (if Chart.js is available)
function createFeatureChart(features, containerId) {
    const container = document.getElementById(containerId);
    if (!container || typeof Chart === 'undefined') return;
    
    const labels = Object.keys(features);
    const data = Object.values(features);
    
    new Chart(container, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Feature Values',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});

// Add loading state to buttons
function addLoadingState(button) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
}

function removeLoadingState(button) {
    button.disabled = false;
    if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText;
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    if (password.match(/[a-z]+/)) strength += 1;
    if (password.match(/[A-Z]+/)) strength += 1;
    if (password.match(/[0-9]+/)) strength += 1;
    if (password.match(/[$@#&!]+/)) strength += 1;
    
    return strength;
}

function updatePasswordStrength(password, meterId) {
    const meter = document.getElementById(meterId);
    if (!meter) return;
    
    const strength = checkPasswordStrength(password);
    let strengthText = '';
    let strengthClass = '';
    
    switch(strength) {
        case 0:
        case 1:
            strengthText = 'Very Weak';
            strengthClass = 'bg-danger';
            break;
        case 2:
            strengthText = 'Weak';
            strengthClass = 'bg-warning';
            break;
        case 3:
            strengthText = 'Fair';
            strengthClass = 'bg-info';
            break;
        case 4:
            strengthText = 'Good';
            strengthClass = 'bg-primary';
            break;
        case 5:
            strengthText = 'Strong';
            strengthClass = 'bg-success';
            break;
    }
    
    meter.className = 'progress-bar ' + strengthClass;
    meter.style.width = (strength * 20) + '%';
    meter.textContent = strengthText;
}
