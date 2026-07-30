/* Scanner Form Validator - Loaded only on pages with scan forms */

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

window.FormValidator = FormValidator;
