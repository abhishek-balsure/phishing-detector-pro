/**
 * ShieldGuard Pro - Main JavaScript v2.0
 * Enhanced UI interactions, dark mode, animations, and utilities
 */

document.addEventListener('DOMContentLoaded', function () {

    // ====================================================
    // DARK MODE TOGGLE
    // ====================================================
    const darkModeToggle = document.getElementById('darkModeToggle');
    const html = document.documentElement;

    function setDarkMode(isDark) {
        html.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');
        localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
        if (darkModeToggle) {
            const icon = darkModeToggle.querySelector('i');
            if (icon) {
                icon.className = isDark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
            }
        }
    }

    // Initialize from saved preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        setDarkMode(true);
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
            const isDark = html.getAttribute('data-bs-theme') !== 'dark';
            setDarkMode(isDark);
        });
    }

    // ====================================================
    // AUTO-HIDE ALERTS
    // ====================================================
    document.querySelectorAll('.alert-dismissible').forEach(function (alert) {
        setTimeout(function () {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });

    // ====================================================
    // FADE-IN ON SCROLL (Intersection Observer)
    // ====================================================
    const fadeElements = document.querySelectorAll('.fade-in-up');
    if (fadeElements.length > 0) {
        const fadeObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        fadeObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
        );
        fadeElements.forEach((el) => fadeObserver.observe(el));
    }

    // ====================================================
    // BACK TO TOP BUTTON
    // ====================================================
    const backToTopBtn = document.createElement('div');
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
    backToTopBtn.setAttribute('title', 'Back to top');
    document.body.appendChild(backToTopBtn);

    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ====================================================
    // URL VALIDATION ON INPUT
    // ====================================================
    const urlInputs = document.querySelectorAll('input[type="url"], input[name="url"]');
    urlInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            const url = this.value.trim();
            if (url.length === 0) {
                this.classList.remove('is-valid', 'is-invalid');
                return;
            }
            const urlPattern = /^https?:\/\/.+/i;
            if (urlPattern.test(url)) {
                this.classList.add('is-valid');
                this.classList.remove('is-invalid');
            } else {
                this.classList.add('is-invalid');
                this.classList.remove('is-valid');
            }
        });
    });

    // ====================================================
    // FORM SUBMIT LOADING STATE
    // ====================================================
    document.querySelectorAll('form').forEach(function (form) {
        form.addEventListener('submit', function () {
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn && !submitBtn.classList.contains('loading')) {
                const originalHTML = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Analyzing...';
                submitBtn.classList.add('loading');
                // Reset after 15 seconds if page doesn't redirect
                setTimeout(function () {
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.classList.remove('loading');
                }, 15000);
            }
        });
    });

    // ====================================================
    // PASSWORD STRENGTH METER
    // ====================================================
    const passwordInput = document.getElementById('password');
    if (passwordInput && document.getElementById('signupForm')) {
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'mt-2';
        strengthContainer.id = 'passwordStrength';
        passwordInput.closest('.mb-3').appendChild(strengthContainer);

        passwordInput.addEventListener('input', function () {
            const password = this.value;
            let strength = 0;
            let label = '';
            let colorClass = '';

            if (password.length >= 6) strength++;
            if (password.length >= 10) strength++;
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;

            switch (strength) {
                case 0: case 1: label = 'Weak'; colorClass = 'bg-danger'; break;
                case 2: label = 'Fair'; colorClass = 'bg-warning'; break;
                case 3: label = 'Good'; colorClass = 'bg-info'; break;
                default: label = 'Strong'; colorClass = 'bg-success'; break;
            }

            const percent = Math.min(100, (strength / 5) * 100);
            strengthContainer.innerHTML = `
                <div class="progress" style="height: 6px;">
                    <div class="progress-bar ${colorClass}" style="width: ${percent}%"></div>
                </div>
                <small class="${colorClass.replace('bg-', 'text-')} mt-1 d-block">${label}</small>
            `;
        });
    }

    // ====================================================
    // TOAST NOTIFICATIONS
    // ====================================================
    window.showToast = function (message, type = 'info') {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const iconMap = {
            success: 'bi-check-circle-fill',
            error: 'bi-exclamation-triangle-fill',
            warning: 'bi-exclamation-circle-fill',
            info: 'bi-info-circle-fill',
        };

        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `<i class="bi ${iconMap[type] || iconMap.info}"></i> ${message}`;
        container.appendChild(toast);

        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    };

    // ====================================================
    // COPY TO CLIPBOARD
    // ====================================================
    window.copyToClipboard = function (text, btn) {
        navigator.clipboard.writeText(text).then(function () {
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="bi bi-check-lg"></i> Copied!';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-outline-primary');
                setTimeout(function () {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-outline-primary');
                }, 2000);
            }
            showToast('Copied to clipboard!', 'success');
        }).catch(function () {
            showToast('Failed to copy', 'error');
        });
    };

    // ====================================================
    // CONFETTI FOR SAFE RESULTS
    // ====================================================
    const safeResult = document.querySelector('.result-alert.success');
    if (safeResult) {
        createConfetti();
    }

    function createConfetti() {
        const colors = ['#51cf66', '#40c057', '#ffd700', '#4facfe', '#667eea'];
        const confettiCount = 60;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: ${Math.random() * 10 + 5}px;
                height: ${Math.random() * 10 + 5}px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -20px;
                border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
                pointer-events: none;
                z-index: 9999;
                animation: confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 0.5}s forwards;
            `;
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5500);
        }

        // Inject the animation if not already present
        if (!document.getElementById('confettiStyles')) {
            const style = document.createElement('style');
            style.id = 'confettiStyles';
            style.textContent = `
                @keyframes confettiFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    80% { opacity: 1; }
                    100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ====================================================
    // ANIMATED COUNTER
    // ====================================================
    document.querySelectorAll('[data-count]').forEach(function (el) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = parseInt(el.dataset.count);
                        if (isNaN(target)) return;
                        let current = 0;
                        const increment = Math.max(1, Math.floor(target / 50));
                        const timer = setInterval(function () {
                            current += increment;
                            if (current >= target) {
                                current = target;
                                clearInterval(timer);
                            }
                            el.textContent = current.toLocaleString();
                        }, 30);
                        observer.unobserve(el);
                    }
                });
            },
            { threshold: 0.5 }
        );
        observer.observe(el);
    });
});
