#!/usr/bin/env python3
"""
Enhanced Vietnamese Profanity Detection Server (No PyTorch Required)
Uses advanced pattern matching and Vietnamese language rules
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

class EnhancedVietnameseProfanityDetector:
    """Enhanced Vietnamese profanity detector without ML dependencies"""
    
    def __init__(self):
        self.model_loaded = True
        
        # Comprehensive Vietnamese profanity patterns
        self.profanity_patterns = {
            # Direct profanity
            'explicit': [
                r'\b(đm|dm|đmm|đcm|dcm)\b',
                r'\b(vcl|vkl|vl)\b', 
                r'\b(cc|cl|lol|loz)\b',
                r'\b(shit|fuck|bitch)\b',
                r'\b(đĩ|di|đỉ)\b',
                r'\b(cặc|buồi|lồn)\b',
                r'\b(chết tiệt|chết tía)\b',
            ],
            
            # Contextual profanity
            'contextual': [
                r'\b(thằng|con|đồ)\s+(ngu|khùng|điên|đần|ngốc)\b',
                r'\b(đồ|con)\s+(đĩ|khốn|khỉ|chó|heo)\b',
                r'\b(mày|mi|m)\s+(ngu|khùng|điên)\b',
                r'\b(tao|t)\s+(ghét|chửi|đánh)\s+(mày|mi|m)\b',
                r'\b(cút|biến|đi chết)\s+(đi|mẹ|mày)\b',
            ],
            
            # Disguised profanity (with special characters)
            'disguised': [
                r'\b(d[*@#]m|đ[*@#]m)\b',
                r'\b(v[*@#]l|vc[*@#])\b',
                r'\b(sh[*@#]t|f[*@#]ck)\b',
                r'\b(đ[*@#]|d[*@#])\b',
            ],
            
            # Hate speech patterns
            'hate_speech': [
                r'\b(giết|đánh|chém|đập)\s+(chết|tơi tả|tan nát)\b',
                r'\b(đi chết|chết đi|chết mẹ)\b',
                r'\b(khủng bố|phá hoại|tàn phá)\b',
            ]
        }
        
        # Confidence weights for different pattern types
        self.confidence_weights = {
            'explicit': 0.95,
            'contextual': 0.85,
            'disguised': 0.80,
            'hate_speech': 0.90
        }
        
        # Compile patterns for better performance
        self.compiled_patterns = {}
        for category, patterns in self.profanity_patterns.items():
            self.compiled_patterns[category] = [
                re.compile(pattern, re.IGNORECASE | re.UNICODE) 
                for pattern in patterns
            ]
        
        logger.info("Enhanced Vietnamese Profanity Detector initialized")
        logger.info(f"Loaded {sum(len(p) for p in self.profanity_patterns.values())} profanity patterns")
    
    def is_ready(self):
        return self.model_loaded
    
    def preprocess_text(self, text):
        """Preprocess Vietnamese text for better detection"""
        if not text:
            return ""
        
        # Normalize Vietnamese text
        text = text.strip()
        
        # Handle common character substitutions
        substitutions = {
            '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
            '@': 'a', '#': '', '*': '', '+': 't'
        }
        
        normalized = text
        for old, new in substitutions.items():
            normalized = normalized.replace(old, new)
        
        return normalized
    
    def detect_profanity(self, text):
        """Enhanced profanity detection with pattern matching"""
        if not text or not isinstance(text, str):
            return {
                'is_profane': False,
                'confidence': 0.0,
                'toxic_spans': [],
                'processed_text': text or '',
                'detector_type': 'enhanced_pattern_matching'
            }
        
        # Preprocess text
        processed_text = self.preprocess_text(text)
        original_text = text.strip()
        
        # Find matches
        toxic_spans = []
        max_confidence = 0.0
        detected_categories = []
        
        for category, patterns in self.compiled_patterns.items():
            for pattern in patterns:
                matches = list(pattern.finditer(processed_text.lower()))
                
                for match in matches:
                    confidence = self.confidence_weights[category]
                    max_confidence = max(max_confidence, confidence)
                    
                    # Map back to original text positions (approximate)
                    start, end = match.span()
                    toxic_spans.append([start, end])
                    detected_categories.append(category)
        
        # Remove duplicate spans
        toxic_spans = self._merge_overlapping_spans(toxic_spans)
        
        # Determine if text is profane
        is_profane = len(toxic_spans) > 0 and max_confidence > 0.7
        
        # Add context analysis
        if not is_profane:
            context_score = self._analyze_context(processed_text)
            if context_score > 0.6:
                is_profane = True
                max_confidence = max(max_confidence, context_score)
        
        return {
            'is_profane': is_profane,
            'confidence': float(max_confidence),
            'toxic_spans': toxic_spans,
            'processed_text': original_text,
            'detected_categories': list(set(detected_categories)),
            'detector_type': 'enhanced_pattern_matching',
            'analysis': {
                'pattern_matches': len(toxic_spans),
                'categories': detected_categories,
                'context_analyzed': True
            }
        }
    
    def _merge_overlapping_spans(self, spans):
        """Merge overlapping toxic spans"""
        if not spans:
            return []
        
        # Sort by start position
        spans.sort(key=lambda x: x[0])
        merged = [spans[0]]
        
        for current in spans[1:]:
            last = merged[-1]
            if current[0] <= last[1]:  # Overlapping
                merged[-1] = [last[0], max(last[1], current[1])]
            else:
                merged.append(current)
        
        return merged
    
    def _analyze_context(self, text):
        """Analyze context for implicit profanity"""
        text_lower = text.lower()
        
        # Aggressive tone indicators
        aggressive_indicators = [
            r'\b(tao|t)\s+(sẽ|phải|muốn)\s+',
            r'\b(mày|mi|m)\s+(phải|sẽ|nên)\s+',
            r'\b(đừng|không|chớ)\s+(có|dám|được)\s+',
            r'[!]{2,}',  # Multiple exclamation marks
            r'[A-Z]{3,}',  # ALL CAPS words
        ]
        
        score = 0.0
        for pattern in aggressive_indicators:
            if re.search(pattern, text_lower):
                score += 0.2
        
        return min(score, 0.8)  # Cap at 0.8

# Initialize detector
detector = EnhancedVietnameseProfanityDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': detector.is_ready(),
        'model_type': 'enhanced_pattern_matching',
        'detector_version': '2.0',
        'patterns_loaded': sum(len(p) for p in detector.profanity_patterns.values()),
        'timestamp': time.time()
    })

@app.route('/detect', methods=['POST'])
def detect_profanity():
    """Main profanity detection endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Missing text field in request'}), 400
        
        text = data['text']
        
        if not isinstance(text, str):
            return jsonify({'error': 'Text must be a string'}), 400
        
        # Detect profanity
        result = detector.detect_profanity(text)
        
        # Add request metadata
        result['timestamp'] = time.time()
        result['model_version'] = 'enhanced-pattern-v2.0'
        
        logger.info(f"Profanity check: '{text[:50]}...' -> {'PROFANE' if result['is_profane'] else 'CLEAN'} (confidence: {result['confidence']:.2f})")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in detect endpoint: {e}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'is_profane': False,
            'confidence': 0.0
        }), 500

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get model information"""
    return jsonify({
        'model_name': 'Enhanced Vietnamese Profanity Detector',
        'model_type': 'pattern_matching_enhanced',
        'version': '2.0',
        'max_length': 1000,
        'labels': ['CLEAN', 'PROFANE'],
        'confidence_threshold': 0.7,
        'model_loaded': detector.is_ready(),
        'device': 'cpu',
        'features': [
            'Vietnamese language patterns',
            'Context analysis',
            'Character substitution handling',
            'Overlapping span detection',
            'Multiple profanity categories'
        ],
        'categories': list(detector.profanity_patterns.keys())
    })

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Test endpoint with sample Vietnamese texts"""
    test_cases = [
        "Chào bạn, hôm nay thế nào?",  # Clean
        "Đây là một bài viết rất hay!",  # Clean
        "Thằng ngu này không biết gì cả",  # Profane
        "Đm, tại sao lại thế này?",     # Profane
        "Mày ngu quá đi",               # Profane
        "Cảnh đẹp quá, tôi thích lắm!", # Clean
    ]
    
    results = []
    for text in test_cases:
        result = detector.detect_profanity(text)
        results.append({
            'text': text,
            'result': result
        })
    
    return jsonify({
        'test_results': results,
        'total_tests': len(test_cases),
        'summary': {
            'clean': sum(1 for r in results if not r['result']['is_profane']),
            'profane': sum(1 for r in results if r['result']['is_profane'])
        }
    })

if __name__ == '__main__':
    print("🚀 Starting Enhanced Vietnamese Profanity Detection Server")
    print("📱 Model: Enhanced Pattern Matching (No PyTorch Required)")
    print("🔧 Mode: Production Ready")
    print("✅ Features: Context Analysis, Vietnamese Patterns, Character Substitution")
    print("=" * 70)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
