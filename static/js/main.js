/* Main JavaScript - Global Utilities & Premium Interactions */

// Animation Controller with optimized layout-safe IntersectionObserver
class AnimationController {
  constructor() {
    this.animations = new Set();
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupScrollAnimations();
  }

  setupIntersectionObserver() {
    const animatedElements = document.querySelectorAll('[data-animation]');
    if (animatedElements.length === 0) return; // Skip setup entirely if no elements need animating

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const animationClass = element.getAttribute('data-animation');
          if (animationClass && !this.animations.has(element)) {
            // Write class directly. This is layout-thrash safe as no DOM properties are read afterwards.
            element.classList.add(animationClass);
            this.animations.add(element);
            
            // Stop observing once animated to free up browser layout calculation cycles.
            // Highly critical for preventing lag on pages with large tables (dashboard, history).
            observer.unobserve(element);
          }
        }
      });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));
  }

  setupScrollAnimations() {
    let ticking = false;

    const updateAnimations = () => {
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
      }
    };

    // Use passive listener to avoid blocking thread on scroll events
    window.addEventListener('scroll', requestTick, { passive: true });
  }

  triggerAnimation(element, animationClass) {
    if (!this.animations.has(element)) {
      element.classList.add(animationClass);
      this.animations.add(element);
    }
  }

  removeAnimation(element, animationClass) {
    element.classList.remove(animationClass);
    this.animations.delete(element);
  }
}

// Initialize animation controller globally
const animationController = new AnimationController();

// Global utility configurations
const utils = {
  // Create a ripple effect on click
  createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
    `;

    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Add ripple effect to buttons after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn, button').forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.classList.contains('btn-loading') && !button.disabled) {
        utils.createRipple(e, button);
      }
    });
  });
});

// Inject ripple utility style rules
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// Error logging
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// Accessibility enhancements
class AccessibilityEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupKeyboardNavigation();
    this.setupScreenReaderAnnouncements();
    this.setupFocusManagement();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && e.shiftKey) {
        const focusableElements = document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const lastFocusable = focusableElements[focusableElements.length - 1];
        if (document.activeElement === focusableElements[0]) {
          e.preventDefault();
          lastFocusable.focus();
        }
      }
    });
  }

  setupScreenReaderAnnouncements() {
    if (!document.getElementById('screenReaderAnnouncements')) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'screenReaderAnnouncements';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
      document.body.appendChild(liveRegion);
    }
  }

  announce(message) {
    const liveRegion = document.getElementById('screenReaderAnnouncements');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  }

  setupFocusManagement() {
    const style = document.createElement('style');
    style.textContent = `
      :focus:not(:focus-visible) {
        outline: none;
      }

      button:focus-visible,
      .btn:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 2px solid var(--accent, #6366F1);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize accessibility features
const accessibilityEnhancer = new AccessibilityEnhancer();

// ===== Global Form Submission Loading States =====
// Auto-disables submit buttons and shows a spinner when POST forms are submitted
document.addEventListener('submit', function(e) {
  const form = e.target;
  if (form.tagName !== 'FORM') return;
  
  // Only handle standard POST forms, skip AJAX-handled forms
  if (form.dataset.noLoadingState) return;
  
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  if (!submitBtn || submitBtn.disabled) return;
  
  // Save original content and disable
  submitBtn.dataset.originalHtml = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Processing...';
  
  // Re-enable after 15s as a safety net (in case of network issues)
  setTimeout(() => {
    if (submitBtn.disabled) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = submitBtn.dataset.originalHtml;
    }
  }, 15000);
});

// Export ShieldGuard namespaces
window.ShieldGuard = {
  utils,
  animationController,
  accessibilityEnhancer
};