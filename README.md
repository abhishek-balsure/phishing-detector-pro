<!-- PROJECT_NAME_START -->
# 🔒 Phishing Detector Pro

[![Python](https://img.shields.io/badge/Python-3.11+-blue?style=flat&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-black?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3+-orange?style=flat)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat)](https://opensource.org/licenses/MIT)
[![Stars](https://img.shields.io/github/stars/abhishek-balsure/phishing-detector-pro?style=flat)](https://github.com/abhishek-balsure/phishing-detector-pro/stargazers)

A comprehensive ML-powered web application for detecting phishing URLs, emails, and QR codes in real-time with 95%+ accuracy.

---

## ✨ Features

### 🔍 Scanning Modes
- **URL Scanner** - Analyze any URL for phishing indicators using Machine Learning
- **Batch Checker** - Scan multiple URLs at once (CSV/text file upload)
- **Email Scanner** - Extract and analyze URLs from email content
- **QR Code Scanner** - Decode QR codes and verify embedded URLs

### 🎯 Core Capabilities
- **25+ URL Features** - Comprehensive feature extraction including domain analysis, URL structure, and content patterns
- **Real-time Detection** - Instant phishing detection with confidence scores
- **Threat Intelligence** - Cross-validation with known malware databases (URLhaus, PhishTank)
- **Severity Levels** - Low/Medium/High risk classification with explainable AI

### 👤 User Features
- **User Authentication** - Secure registration and login system
- **Dashboard** - Personal statistics and scan history
- **Bookmarks** - Save suspicious URLs for later analysis
- **PDF Reports** - Export scan results as professional PDF documents
- **Achievement Badges** - Gamification with badges for active users

### 🛠 Admin Features
- **Admin Panel** - System-wide statistics and user management
- **User Analytics** - Track usage patterns and threat trends

---

## 📊 Model Performance

| Metric | Score |
|--------|-------|
| **Accuracy** | 95%+ |
| **Precision** | 94%+ |
| **Recall** | 96%+ |
| **F1-Score** | 95%+ |
| **AUC-ROC** | 98%+ |

### Technical Details
- **Algorithm**: Random Forest Classifier (100 decision trees)
- **Features**: 25+ URL-based features extracted
- **Training Data**: 50,000+ URLs (legitimate + phishing)
- **Cross-Validation**: 5-fold CV accuracy: 94.8% (±0.3%)

---

## 🖥️ Screenshots

![Dashboard](screenshots/dashboard.png)
*The user dashboard with statistics and quick actions*

![URL Scanner](screenshots/url-scanner.png)
*URL analysis with confidence score and feature importance*

![QR Scanner](screenshots/qr-scanner.png)
*QR code scanner with glassmorphism UI*

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Backend** | Python 3.11+, Flask 3.0+ |
| **ML/AI** | scikit-learn (Random Forest) |
| **Database** | SQLite |
| **Frontend** | HTML5, CSS3, Bootstrap 5, JavaScript |
| **Visualizations** | Chart.js |
| **PDF Generation** | ReportLab |

---

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Steps

1. **Clone the repository**
```bash
git clone https://github.com/abhishek-balsure/phishing-detector-pro.git
cd phishing-detector-pro
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Generate training dataset**
```bash
python combine_datasets.py
```

6. **Train the model**
```bash
python train_model.py
```

7. **Run the application**
```bash
python app.py
```

8. **Open browser**
```
http://localhost:5000
```

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

> ⚠️ **Security Note**: Change the admin password after first login!

---

## 🔄 How It Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   User      │────▶│  URL Feature     │────▶│     ML Model    │
│   Input     │     │  Extraction      │     │   (Random       │
│  (URL/QR)   │     │  (25+ features)  │     │   Forest)       │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                       ┌──────────────────┐             │
                       │  Threat Intel   │◀────────────┘
                       │  (URLhaus,      │
                       │   PhishTank)    │
                       └────────┬────────┘
                                │
                       ┌────────▼────────┐
                       │   Result:        │
                       │   Phishing/Safe  │
                       │   + Confidence   │
                       └──────────────────┘
```

### Detection Process

1. **Input** - User provides URL, email, or QR code
2. **Feature Extraction** - 25+ features extracted (URL length, domain entropy, TLD analysis, etc.)
3. **ML Prediction** - Random Forest classifier analyzes features
4. **Threat Intel** - Cross-references with malware databases
5. **Result** - Displays prediction with confidence score and explanation

---

## 📁 Project Structure

```
phishing-detector-pro/
├── app.py                      # Main Flask application
├── feature_extraction.py       # URL feature extraction module
├── train_model.py            # Model training script
├── combine_datasets.py       # Dataset generation
├── requirements.txt          # Python dependencies
├── phishing_model.pkl        # Trained ML model
├── phishing_data.csv        # Training dataset
├── phishing_detector.db     # SQLite database
│
├── templates/                # HTML templates
│   ├── base.html
│   ├── index.html
│   ├── dashboard.html
│   ├── check_url.html
│   ├── email_scanner.html
│   ├── qr_scanner.html
│   ├── batch_check.html
│   ├── history.html
│   ├── profile.html
│   ├── admin.html
│   ├── login.html
│   ├── signup.html
│   └── ...
│
├── static/                  # Static assets
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── main.js
│
└── screenshots/             # README images
    ├── dashboard.png
    ├── url-scanner.png
    └── qr-scanner.png
```

---

## 🔐 Security Features

- Password hashing with Werkzeug
- Session-based authentication
- CSRF protection
- SQL injection prevention
- Secure file uploads
- Input validation and sanitization

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [scikit-learn](https://scikit-learn.org/) - Machine learning library
- [URLhaus](https://urlhaus.abuse.ch/) - Malware URL database
- [PhishTank](https://www.phishtank.com/) - Phishing verification database
- [Bootstrap](https://getbootstrap.com/) - CSS framework

---

<div align="center">

**Made with ❤️ for a safer internet**

⭐ Star this repo if you found it useful!

</div>

<!-- PROJECT_NAME_END -->
