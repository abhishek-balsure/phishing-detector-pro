/* Main JavaScript - Interactive Features */

// NOTE: Theme toggle is handled in base.html via darkModeToggle
// This file contains other interactive features

// Form Handling and Validation
class FormValidator {
  constructor(formElement) {
    this.form = formElement;
    this.inputs = formElement.querySelectorAll('input, select, textarea');
    this.submitBtn = formElement.querySelector('button[type="submit"]');
    this.isValid = false;
    this.init();
  }

  init() {
    this.inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateInput(input));
      input.addEventListener('input', () => this.validateInput(input));
    });

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  validateInput(input) {
    const isValid = input.checkValidity();
    const inputGroup = input.closest('.input-group') || input.parentElement;

    if (inputGroup) {
      const feedback = inputGroup.querySelector('.form-feedback');
      if (feedback) feedback.remove();
    }

    if (!isValid) {
      input.classList.remove('success');
      input.classList.add('error');
      this.showError(input, input.validationMessage);
    } else {
      input.classList.remove('error');
      input.classList.add('success');
      this.showSuccess(input);
    }

    this.checkFormValidity();
  }

  showError(input, message) {
    const inputGroup = input.closest('.input-group') || input.parentElement;
    const feedback = document.createElement('div');
    feedback.className = 'form-feedback text-danger small mt-1';
    feedback.innerHTML = `<i class="bi bi-exclamation-circle"></i> ${message}`;
    inputGroup.appendChild(feedback);
  }

  showSuccess(input) {
    const inputGroup = input.closest('.input-group') || input.parentElement;
    const feedback = inputGroup.querySelector('.form-feedback');
    if (feedback) feedback.remove();
  }

  checkFormValidity() {
    this.isValid = Array.from(this.inputs).every(input => input.checkValidity());
    if (this.submitBtn) {
      this.submitBtn.disabled = !this.isValid;
    }
  }

  showLoadingState() {
    if (this.submitBtn) {
      const originalText = this.submitBtn.textContent;
      this.submitBtn.disabled = true;
      this.submitBtn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Loading...
      `;
      this.submitBtn.setAttribute('data-original-text', originalText);
    }
  }

  hideLoadingState() {
    if (this.submitBtn) {
      const originalText = this.submitBtn.getAttribute('data-original-text');
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = originalText;
      this.submitBtn.removeAttribute('data-original-text');
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.isValid) return;

    this.showLoadingState();
    
    const urlValue = this.form.url.value;
    
    fetch('/api/quick_check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: urlValue })
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.error || 'Server error'); });
      }
      return response.json();
    })
    .then(data => {
      this.hideLoadingState();
      this.showResults(data);
    })
    .catch(error => {
      this.hideLoadingState();
      this.showErrorResults(error.message || 'An error occurred during scan');
    });
  }

  showResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    if (!resultsSection || !resultsContent) return;

    const isPhishing = data.is_phishing;
    const resultClass = isPhishing ? 'text-danger' : 'text-success';
    const badgeClass = isPhishing ? 'badge-danger' : 'badge-success';
    const badgeText = isPhishing ? 'Phishing Detected' : 'No Phishing Detected';
    const resultText = isPhishing ? 'Phishing' : 'Safe';
    const descriptionText = isPhishing 
      ? 'This URL shows high probability of being malicious. Do NOT trust it.' 
      : 'This URL appears to be safe and legitimate.';

    const resultCard = document.createElement('div');
    resultCard.className = 'col-lg-6 mx-auto glass-card card-entrance';
    resultCard.innerHTML = `
      <div class="text-center mb-4">
        <h3>Scan Results for: <span class="gradient-text">${data.url}</span></h3>
      </div>
      <div class="row g-3">
        <div class="col-6">
          <div class="text-center">
            <div class="h1 ${resultClass} mb-2" id="resultStatus">${resultText}</div>
            <small class="text-muted">Status</small>
          </div>
        </div>
        <div class="col-6">
          <div class="text-center">
            <div class="h1 text-primary mb-2" id="resultScore">${data.confidence}%</div>
            <small class="text-muted">Confidence</small>
          </div>
        </div>
        <div class="col-12">
          <div class="badge ${badgeClass} mb-3">${badgeText}</div>
          <p class="text-muted">${descriptionText}</p>
        </div>
      </div>
    `;

    resultsContent.innerHTML = '';
    resultsContent.appendChild(resultCard);
    resultsSection.style.display = 'block';

    setTimeout(() => {
      resultCard.classList.add('card-entrance');
    }, 100);
  }

  showErrorResults(message) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    if (!resultsSection || !resultsContent) return;

    const resultCard = document.createElement('div');
    resultCard.className = 'col-lg-6 mx-auto glass-card card-entrance';
    resultCard.innerHTML = `
      <div class="text-center mb-4">
        <h3 class="text-danger">Scan Error</h3>
      </div>
      <div class="text-center">
        <p class="text-muted">${message}</p>
      </div>
    `;

    resultsContent.innerHTML = '';
    resultsContent.appendChild(resultCard);
    resultsSection.style.display = 'block';
  }
}

// Initialize form validator for quick check form
const quickCheckForm = document.getElementById('quickCheckForm');
if (quickCheckForm) {
  new FormValidator(quickCheckForm);
}

// Animation Controller
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
            element.classList.add(animationClass);
            this.animations.add(element);
          }
        }
      });
    }, observerOptions);

    // Observe elements with data-animation attribute
    document.querySelectorAll('[data-animation]').forEach(el => {
      observer.observe(el);
    });
  }

  setupScrollAnimations() {
    let ticking = false;

    const updateAnimations = () => {
      ticking = false;
      // Add scroll-based animations here if needed
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
      }
    };

    window.addEventListener('scroll', requestTick, { passive: true });
  }

  // Trigger animation on element
  triggerAnimation(element, animationClass) {
    if (!this.animations.has(element)) {
      element.classList.add(animationClass);
      this.animations.add(element);
    }
  }

  // Remove animation from element
  removeAnimation(element, animationClass) {
    element.classList.remove(animationClass);
    this.animations.delete(element);
  }
}

// Initialize animation controller
const animationController = new AnimationController();

// Utility Functions
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
      background: rgba(255, 255, 255, 0.5);
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

  // Debounce function
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

  // Throttle function
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

// Add ripple effect to buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', (e) => {
      if (!button.classList.contains('btn-loading')) {
        utils.createRipple(e, button);
      }
    });
  });
});

// Add CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);


// Error handling
window.addEventListener('error', (e) => {
  console.error('JavaScript error:', e.error);
  // You could send this to an error tracking service
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
    // Trap focus within modals (if you add modals later)
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
    // Create a live region for screen reader announcements
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
    // Add focus indicators
    const style = document.createElement('style');
    style.textContent = `
      :focus:not(:focus-visible) {
        outline: none;
      }

      button:focus-visible,
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize accessibility enhancer
const accessibilityEnhancer = new AccessibilityEnhancer();

// Export for potential use in other scripts
window.ShieldGuard = {
  utils,
  animationController,
  accessibilityEnhancer,
  FormValidator
};