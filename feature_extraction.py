"""
Feature extraction utilities for phishing detection.

The original model used 25 lexical URL features. Newer training runs can append
external reputation and page-content signals while keeping the first 25 feature
positions stable for backward compatibility with the checked-in model artifact.
"""

import datetime
import logging
import math
import os
import re
import socket
import ssl
from functools import lru_cache
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

DEFAULT_TIMEOUT = float(os.environ.get('URL_FEATURE_TIMEOUT_SECONDS', '3'))
ENABLE_EXTERNAL_URL_FEATURES = os.environ.get(
    'ENABLE_EXTERNAL_URL_FEATURES',
    'true'
).lower() in {'1', 'true', 'yes', 'on'}
FEATURE_USER_AGENT = os.environ.get(
    'URL_FEATURE_USER_AGENT',
    'ShieldGuard Pro Feature Extractor/1.0'
)
OPENPAGERANK_API_URL = os.environ.get(
    'OPENPAGERANK_API_URL',
    'https://openpagerank.com/api/v1.0/getPageRank'
)
OPENPAGERANK_API_KEY = os.environ.get('OPENPAGERANK_API_KEY', '')

BASE_FEATURES = [
    'url_length', 'hostname_length', 'has_https', 'has_ip', 'num_dots',
    'num_hyphens', 'num_underscores', 'num_slashes', 'num_questionmarks',
    'num_at', 'num_digits', 'num_subdomains', 'has_prefix_suffix',
    'suspicious_tld', 'num_suspicious_keywords', 'has_suspicious_keywords_in_hostname', 'is_shortened', 'url_entropy',
    'digit_ratio', 'special_char_ratio', 'path_length', 'query_length',
    'num_equals', 'num_ampersands', 'has_port', 'brand_in_subdomain',
    'has_double_slash_redirect', 'domain_token_count', 'tld_length',
    'has_encoded_chars', 'vowel_consonant_ratio'
]

EXTERNAL_FEATURES = [
    'page_rank',
    'page_rank_normalized', 
    'having_anchor_tag',
    'anchor_tag_count',
    'anchor_tag_ratio',
    'links_pointing_to_page',
    'has_ssl_certificate',
    'ssl_cert_age_days',
    'has_login_form',
    'num_external_links',
    'has_favicon_mismatch',
    'domain_age_days',
    'is_newly_registered',
]


def _extract_rank_value(payload):
    if isinstance(payload, dict):
        for key in ('rank', 'global_rank', 'alexa_rank', 'page_rank_decimal', 'page_rank_integer'):
            value = payload.get(key)
            if value not in (None, ''):
                try:
                    return float(value)
                except (TypeError, ValueError):
                    continue
        for value in payload.values():
            rank = _extract_rank_value(value)
            if rank is not None:
                return rank
    elif isinstance(payload, list):
        for item in payload:
            rank = _extract_rank_value(item)
            if rank is not None:
                return rank
    return None


def _clamp(value, lower=0.0, upper=1.0):
    return max(lower, min(upper, value))


def _normalize_rank(rank, ceiling):
    if rank is None or rank <= 0:
        return 0.0
    return round(_clamp(1.0 - min(rank, ceiling) / ceiling), 6)


def _safe_hostname(parsed):
    hostname = parsed.netloc.lower().strip()
    if '@' in hostname:
        hostname = hostname.split('@', 1)[-1]
    if ':' in hostname:
        hostname = hostname.split(':', 1)[0]
    return hostname


def get_registered_domain_name(hostname):
    if not hostname:
        return ""
    parts = hostname.split('.')
    if len(parts) >= 2:
        if len(parts) >= 3 and parts[-2] in ('co', 'com', 'org', 'net', 'gov', 'edu'):
            return parts[-3]
        return parts[-2]
    return hostname


@lru_cache(maxsize=2048)
def _get_http_response(url):
    if not ENABLE_EXTERNAL_URL_FEATURES:
        return None
    try:
        response = requests.get(
            url,
            headers={'User-Agent': FEATURE_USER_AGENT},
            timeout=DEFAULT_TIMEOUT,
            allow_redirects=True,
        )
        response.raise_for_status()
        return response.text
    except Exception as exc:
        logger.debug("Page fetch failed for %s: %s", url, exc)
        return None


@lru_cache(maxsize=1024)
def _check_ssl_certificate(hostname):
    if not ENABLE_EXTERNAL_URL_FEATURES or not hostname:
        return 0, 0
    try:
        context = ssl.create_default_context()
        with socket.create_connection((hostname, 443), timeout=3) as sock:
            with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                cert = ssock.getpeercert()
                if not cert:
                    return 0, 0
                not_before_str = cert.get('notBefore')
                if not_before_str:
                    not_before_date = datetime.datetime.strptime(not_before_str, '%b %d %H:%M:%S %Y %Z')
                    age_days = (datetime.datetime.utcnow() - not_before_date).days
                    return 1, max(0, age_days)
                return 1, 0
    except Exception as exc:
        logger.debug("SSL check failed for %s: %s", hostname, exc)
        return 0, 0


@lru_cache(maxsize=1024)
def _get_domain_age(hostname):
    if not ENABLE_EXTERNAL_URL_FEATURES or not hostname:
        return 0, 0
    try:
        import whois
        w = whois.whois(hostname)
        creation_date = w.creation_date
        if not creation_date:
            return 0, 0
        if isinstance(creation_date, list):
            creation_date = creation_date[0]
        if isinstance(creation_date, datetime.datetime):
            age_days = (datetime.datetime.now() - creation_date).days
            return max(0, age_days), 1 if age_days < 30 else 0
        return 0, 0
    except Exception as exc:
        logger.debug("WHOIS check failed for %s: %s", hostname, exc)
        return 0, 0


@lru_cache(maxsize=2048)
def _lookup_page_rank(hostname):
    if not ENABLE_EXTERNAL_URL_FEATURES or not hostname or not OPENPAGERANK_API_KEY:
        return 0.0, 0.0

    try:
        response = requests.get(
            OPENPAGERANK_API_URL,
            params={'domains[]': hostname},
            headers={
                'User-Agent': FEATURE_USER_AGENT,
                'API-OPR': OPENPAGERANK_API_KEY,
            },
            timeout=DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        rank = _extract_rank_value(data)
        if rank is None:
            return 0.0, 0.0
        return float(rank), round(float(rank) / 10.0, 6)
    except Exception as exc:
        logger.debug("Page rank lookup failed for %s: %s", hostname, exc)
        return 0.0, 0.0


@lru_cache(maxsize=1024)
def _extract_page_content_features(url):
    default_features = {
        'having_anchor_tag': 0,
        'anchor_tag_count': 0,
        'anchor_tag_ratio': 0.0,
        'links_pointing_to_page': 0,
        'has_login_form': 0,
        'num_external_links': 0,
        'has_favicon_mismatch': 0,
    }
    
    if not ENABLE_EXTERNAL_URL_FEATURES:
        return default_features

    html = _get_http_response(url)
    if not html:
        return default_features

    try:
        soup = BeautifulSoup(html, 'html.parser')
        anchors = soup.find_all('a', href=True)
        anchor_count = len(anchors)
        parsed = urlparse(url)
        hostname = _safe_hostname(parsed)
        external_links = 0

        for anchor in anchors:
            target = anchor.get('href', '').strip()
            if not target or target.startswith('#') or target.lower().startswith('javascript:'):
                continue
            target_host = _safe_hostname(urlparse(urljoin(url, target)))
            if target_host and target_host != hostname:
                external_links += 1

        has_login_form = 0
        if soup.find('input', type=lambda t: t and t.lower() == 'password'):
            has_login_form = 1
        elif soup.find('form', action=lambda a: a and any(kw in a.lower() for kw in ['login', 'signin', 'auth'])):
            has_login_form = 1

        has_favicon_mismatch = 0
        favicon_link = soup.find('link', rel=lambda r: r and 'icon' in r.lower())
        if favicon_link:
            favicon_href = favicon_link.get('href', '').strip()
            if favicon_href and not favicon_href.startswith('data:'):
                favicon_host = _safe_hostname(urlparse(urljoin(url, favicon_href)))
                if favicon_host and favicon_host != hostname:
                    has_favicon_mismatch = 1

        text_length = len(soup.get_text(" ", strip=True))
        anchor_ratio = anchor_count / max(text_length, 1)
        
        return {
            'having_anchor_tag': 1 if anchor_count > 0 else 0,
            'anchor_tag_count': anchor_count,
            'anchor_tag_ratio': round(anchor_ratio, 6),
            'links_pointing_to_page': external_links,
            'has_login_form': has_login_form,
            'num_external_links': external_links,
            'has_favicon_mismatch': has_favicon_mismatch,
        }
    except Exception as exc:
        logger.debug("Page parsing failed for %s: %s", url, exc)
        return default_features


def extract_features(url, include_external=None):
    """
    Extract lexical and optional external features from a URL.
    """
    if not url or not isinstance(url, str):
        url = ""

    url = url.lower().strip()
    parsed = urlparse(url)
    hostname = _safe_hostname(parsed)
    path = parsed.path
    features = {}

    features['url_length'] = len(url)
    features['hostname_length'] = len(hostname)
    features['has_https'] = 1 if parsed.scheme == 'https' else 0

    ip_pattern = r'^(\d{1,3}\.){3}\d{1,3}$|(\d{1,3}\.){3}\d{1,3}(/|:)'
    features['has_ip'] = 1 if re.search(ip_pattern, hostname) else 0
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_underscores'] = url.count('_')
    features['num_slashes'] = url.count('/')
    features['num_questionmarks'] = url.count('?')
    features['num_at'] = url.count('@')
    features['num_digits'] = sum(char.isdigit() for char in url)

    if hostname:
        domain_parts = hostname.split('.')
        features['num_subdomains'] = len(domain_parts) - 2 if len(domain_parts) > 2 else 0
    else:
        features['num_subdomains'] = 0

    features['has_prefix_suffix'] = 1 if '-' in hostname else 0
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.buzz']
    features['suspicious_tld'] = 1 if any(hostname.endswith(tld) for tld in suspicious_tlds) else 0

    suspicious_keywords = [
        'verify', 'account', 'login', 'secure', 'update', 'confirm',
        'banking', 'password', 'credential', 'wallet', 'payment'
    ]
    brands = [
        'paypal', 'apple', 'microsoft', 'google', 'facebook', 'amazon', 'netflix',
        'bank', 'chase', 'wellsfargo', 'citi', 'amex', 'visa', 'mastercard'
    ]
    reg_domain = get_registered_domain_name(hostname)
    is_brand_domain = reg_domain in brands

    # 1. Count of suspicious keywords in path/query (excluding literal registered domain and brand domain paths)
    num_suspicious = 0
    if not is_brand_domain:
        path_query = (path + '?' + parsed.query).lower()
        for keyword in suspicious_keywords:
            if reg_domain and keyword == reg_domain:
                continue
            num_suspicious += path_query.count(keyword)
    features['num_suspicious_keywords'] = num_suspicious

    # 2. Hostname check for suspicious keywords (excluding literal registered domain itself)
    has_suspicious_in_hostname = 0
    for keyword in suspicious_keywords:
        if reg_domain and keyword == reg_domain:
            continue
        if keyword in hostname:
            has_suspicious_in_hostname = 1
            break
    features['has_suspicious_keywords_in_hostname'] = has_suspicious_in_hostname

    shorteners = [
        'bit.ly', 'tinyurl', 't.co', 'goo.gl', 'ow.ly', 'short.link',
        'is.gd', 'buff.ly', 'adf.ly', 'bitly.com'
    ]
    features['is_shortened'] = 1 if any(shortener in hostname for shortener in shorteners) else 0
    features['url_entropy'] = calculate_entropy(url)
    features['digit_ratio'] = features['num_digits'] / len(url) if url else 0

    special_chars = sum(1 for char in url if not char.isalnum())
    features['special_char_ratio'] = special_chars / len(url) if url else 0
    features['path_length'] = len(path)
    features['query_length'] = len(parsed.query)
    features['num_equals'] = url.count('=')
    features['num_ampersands'] = url.count('&')
    features['has_port'] = 1 if ':' in parsed.netloc and not parsed.netloc.endswith(':') else 0

    subdomain = '.'.join(hostname.split('.')[:-2]) if len(hostname.split('.')) > 2 else ""
    features['brand_in_subdomain'] = 1 if any(brand in subdomain for brand in brands) else 0

    # New Feature: Double slash redirect in path
    features['has_double_slash_redirect'] = 1 if '//' in path[1:] else 0  # skip the leading //

    # New Feature: Domain token count (split by . and -)
    domain_tokens = re.split(r'[.\-]', hostname)
    features['domain_token_count'] = len(domain_tokens)

    # New Feature: TLD length
    tld = hostname.split('.')[-1] if '.' in hostname else ''
    features['tld_length'] = len(tld)

    # New Feature: URL-encoded characters
    features['has_encoded_chars'] = 1 if '%' in url else 0

    # New Feature: Vowel to consonant ratio in hostname
    vowels = sum(1 for c in hostname if c in 'aeiou')
    consonants = sum(1 for c in hostname if c.isalpha() and c not in 'aeiou')
    features['vowel_consonant_ratio'] = round(vowels / max(consonants, 1), 4)

    use_external = ENABLE_EXTERNAL_URL_FEATURES if include_external is None else include_external
    if use_external:
        page_rank, page_rank_normalized = _lookup_page_rank(hostname)
        content_features = _extract_page_content_features(url)
        has_ssl, ssl_age = _check_ssl_certificate(hostname)
        domain_age, is_new = _get_domain_age(hostname)
    else:
        page_rank = 0.0
        page_rank_normalized = 0.0
        has_ssl = 0
        ssl_age = 0
        domain_age = 0
        is_new = 0
        content_features = {
            'having_anchor_tag': 0,
            'anchor_tag_count': 0,
            'anchor_tag_ratio': 0.0,
            'links_pointing_to_page': 0,
            'has_login_form': 0,
            'num_external_links': 0,
            'has_favicon_mismatch': 0,
        }

    features['page_rank'] = page_rank
    features['page_rank_normalized'] = page_rank_normalized
    features['has_ssl_certificate'] = has_ssl
    features['ssl_cert_age_days'] = ssl_age
    features['domain_age_days'] = domain_age
    features['is_newly_registered'] = is_new
    features.update(content_features)

    return features


def calculate_entropy(string):
    if not string:
        return 0.0

    probabilities = [float(string.count(char)) / len(string) for char in dict.fromkeys(list(string))]
    return -sum(probability * math.log(probability) / math.log(2.0) for probability in probabilities)


def get_feature_names():
    return BASE_FEATURES + EXTERNAL_FEATURES


def features_to_array(features_dict, feature_names=None):
    ordered_feature_names = feature_names or get_feature_names()
    return [features_dict.get(name, 0) for name in ordered_feature_names]


if __name__ == "__main__":
    test_urls = [
        "https://www.google.com/search?q=test",
        "http://192.168.1.1/login",
        "https://bit.ly/abc123",
        "http://verify-paypal-account.tk/login",
        "https://www.bankofamerica.com/secure/login"
    ]

    for test_url in test_urls:
        extracted = extract_features(test_url, include_external=False)
        print(f"\nURL: {test_url}")
        print(f"Feature count: {len(extracted)}")
        print(f"Features: {extracted}")
        print("-" * 80)
