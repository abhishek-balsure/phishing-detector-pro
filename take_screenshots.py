"""
Take screenshots of all pages in the Flask phishing detection app.
Usage: python take_screenshots.py
"""

import os
import time
import subprocess
import signal
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

# Configuration
BASE_URL = "http://127.0.0.1:5000"
PAGES = [
    ("/", "homepage.png"),
    ("/login", "login.png"),
    ("/dashboard", "dashboard.png"),
    ("/check_url", "check_url.png"),
    ("/batch", "batch.png"),
    ("/qr_scanner", "qr_scanner.png"),
    ("/email_scanner", "email_scanner.png"),
    ("/admin", "admin.png"),
]
SCREENSHOTS_FOLDER = "screenshots"

def setup_driver():
    """Setup Chrome driver with headless options."""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--start-maximized")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def create_screenshots_folder():
    """Create screenshots folder if it doesn't exist."""
    if not os.path.exists(SCREENSHOTS_FOLDER):
        os.makedirs(SCREENSHOTS_FOLDER)
        print(f"Created folder: {SCREENSHOTS_FOLDER}")

def take_screenshots(driver):
    """Take screenshots of all pages."""
    for route, filename in PAGES:
        url = BASE_URL + route
        print(f"Taking screenshot of: {url}")
        
        try:
            driver.get(url)
            time.sleep(2)  # Wait for page to fully load
            
            filepath = os.path.join(SCREENSHOTS_FOLDER, filename)
            driver.save_screenshot(filepath)
            print(f"  ✓ Saved: {filepath}")
            
        except Exception as e:
            print(f"  ✗ Error taking screenshot of {url}: {e}")

def main():
    """Main function to take screenshots."""
    print("=" * 60)
    print("Flask App Screenshot Generator")
    print("=" * 60)
    
    # Create screenshots folder
    create_screenshots_folder()
    
    # Start Flask server
    print("\nStarting Flask server...")
    flask_process = subprocess.Popen(
        ["python", "app.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid if os.name != 'nt' else None
    )
    
    # Wait for server to start
    print("Waiting for server to start...")
    time.sleep(5)
    
    # Check if server is running
    try:
        import requests
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code == 200:
            print("Server is running!")
    except Exception as e:
        print(f"Warning: Could not verify server is running: {e}")
    
    # Setup Selenium
    print("\nSetting up Chrome driver...")
    driver = None
    try:
        driver = setup_driver()
        
        # Take screenshots
        print("\nTaking screenshots...")
        take_screenshots(driver)
        
    except Exception as e:
        print(f"Error: {e}")
        
    finally:
        # Close driver
        if driver:
            driver.quit()
            print("\nClosed Chrome driver")
    
    # Stop Flask server
    print("\nStopping Flask server...")
    try:
        if os.name == 'nt':
            flask_process.terminate()
        else:
            os.killpg(os.getpgid(flask_process.pid), signal.SIGTERM)
        flask_process.wait(timeout=5)
    except:
        flask_process.kill()
    
    print("\n" + "=" * 60)
    print("Screenshot capture complete!")
    print(f"Screenshots saved to: {SCREENSHOTS_FOLDER}/")
    print("=" * 60)

if __name__ == "__main__":
    main()
