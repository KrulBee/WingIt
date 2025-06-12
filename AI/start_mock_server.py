#!/usr/bin/env python3
"""
Quick Mock Server for Vietnamese Profanity Detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import re

app = Flask(__name__)
CORS(app)

# Vietnamese profanity words for testing
PROFANITY_WORDS = [
    'đm', 'dm', 'đmm', 'vcl', 'đcm', 'cc', 'cl', 'loz',
    'shit', 'fuck', 'bitch', 'đĩ', 'đồ đĩ', 'con đĩ', 
    'thằng ngu', 'đồ ngu', 'ngu', 'khùng', 'điên', 'chết tiệt'
]

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'detector_type': 'mock',
        'timestamp': time.time()
    })

@app.route('/detect', methods=['POST'])
def detect():
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Simple profanity detection
        text_lower = text.lower()
        is_profane = any(word in text_lower for word in PROFANITY_WORDS)
        
        # Find toxic spans
        toxic_spans = []
        for word in PROFANITY_WORDS:
            for match in re.finditer(re.escape(word), text_lower):
                toxic_spans.append([match.start(), match.end()])
        
        result = {
            'is_profane': is_profane,
            'confidence': 0.85 if is_profane else 0.0,
            'toxic_spans': toxic_spans,
            'processed_text': text.strip(),
            'timestamp': time.time()
        }
        
        print(f"Checked: '{text[:50]}...' -> {'PROFANE' if is_profane else 'CLEAN'}")
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'is_profane': False,
            'confidence': 0.0
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    return jsonify({
        'model_name': 'mock-vietnamese-profanity-detector',
        'model_type': 'keyword-based',
        'max_length': 1000,
        'labels': ['CLEAN', 'PROFANE'],
        'confidence_threshold': 0.7,
        'model_loaded': True,
        'device': 'cpu'
    })

if __name__ == '__main__':
    print("🚀 Starting Mock Profanity Detection Server...")
    print("📍 Server: http://localhost:5000")
    print("🔍 Health: http://localhost:5000/health")
    print("📊 Info: http://localhost:5000/model_info")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=False)
