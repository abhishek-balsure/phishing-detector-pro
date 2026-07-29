import pickle
import numpy as np
from feature_extraction import extract_features, get_feature_names

urls_to_test = [
    'https://claude.ai/',
    'https://claude.ai/new',
    'https://shieldguard-pro.onrender.com/check_url',
    'https://dash.cloudflare.com/d1ed5c3eb3cded2d6ac4f5135ba05dc2/pages/view/portfolio',
    'https://signin.aws.amazon.com/signin?redirect_uri=xxx',
    'https://youtu.be/2RerixrgSrw'
]

# Load model
try:
    with open('phishing_model.pkl', 'rb') as f:
        model_data = pickle.load(f)
        model = model_data['model']
        feature_names = model_data.get('features', get_feature_names())
        if not feature_names:
            feature_names = model_data.get('feature_names', get_feature_names())
except Exception as e:
    print("Error loading model:", e)
    exit(1)

for url in urls_to_test:
    features_dict = extract_features(url)
    
    feature_list = []
    for f in feature_names:
        feature_list.append(features_dict.get(f, 0))
    feature_array = np.array(feature_list).reshape(1, -1)
    
    proba = model.predict_proba(feature_array)[0]
    prob_phishing = float(proba[1])
    
    print(f"\nURL: {url}")
    print(f"RAW ML Phishing Prob: {prob_phishing:.4f}")
