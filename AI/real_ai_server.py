#!/usr/bin/env python3
"""
Vietnamese Profanity Detection Server using Your Trained PhoBERT Model
Based on your vihos-phobert-kaggle-optimized.ipynb training code
"""

import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModel
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import time
import threading
import os
import requests
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Config:
    """Configuration matching your training setup"""
    MODEL_NAME = "vinai/phobert-base"
    MAX_LENGTH = 128
    LABELS = ['O', 'B-T', 'I-T']  # O: Clean, B-T: Begin Toxic, I-T: Inside Toxic
    LABEL2ID = {label: i for i, label in enumerate(LABELS)}
    ID2LABEL = {i: label for i, label in enumerate(LABELS)}
    NUM_LABELS = len(LABELS)
    CONFIDENCE_THRESHOLD = 0.7
    MODEL_PATH = os.getenv("MODEL_PATH", "/tmp/best_phobert_model.pth")  # Allow override via env var
    DROPOUT_RATE = 0.3
    # Hugging Face model URL
    HUGGINGFACE_MODEL_URL = "https://huggingface.co/ViBuck/best_phobert_model/resolve/main/best_phobert_model.pth"

class PhoBERTForTokenClassification(nn.Module):
    """Your trained PhoBERT model architecture"""
    
    def __init__(self, model_name, num_labels, dropout_rate=0.3):
        super().__init__()
        
        self.num_labels = num_labels
        self.phobert = AutoModel.from_pretrained(model_name)
        
        # Anti-overfitting layers (matching your training)
        self.dropout = nn.Dropout(dropout_rate)
        self.layer_norm = nn.LayerNorm(self.phobert.config.hidden_size)
        
        # Classification head
        self.classifier = nn.Linear(self.phobert.config.hidden_size, num_labels)
        
        # Initialize weights
        self._init_weights()
    
    def _init_weights(self):
        """Initialize classifier weights"""
        nn.init.normal_(self.classifier.weight, std=0.02)
        nn.init.zeros_(self.classifier.bias)
    
    def forward(self, input_ids, attention_mask=None):
        # Get PhoBERT outputs
        outputs = self.phobert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )
        
        # Apply anti-overfitting layers
        sequence_output = outputs.last_hidden_state
        sequence_output = self.layer_norm(sequence_output)
        sequence_output = self.dropout(sequence_output)
        
        # Classification
        logits = self.classifier(sequence_output)
        
        return {'logits': logits}

class ProfanityDetector:
    """Vietnamese Profanity Detection using your trained PhoBERT model"""
    
    def __init__(self):
        self.config = Config()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.tokenizer = None
        self.model = None
        self.model_loaded = False
        
        logger.info(f"Using device: {self.device}")
        
        # Load model in background
        self.load_model_thread = threading.Thread(target=self._load_model_async)
        self.load_model_thread.start()
    
    def _download_model_from_huggingface(self):
        """Download model from Hugging Face if not exists locally"""
        if os.path.exists(self.config.MODEL_PATH):
            # Check if file is complete (not corrupted)
            try:
                file_size = os.path.getsize(self.config.MODEL_PATH)
                if file_size > 100 * 1024 * 1024:  # At least 100MB
                    logger.info(f"Model file already exists and appears complete: {self.config.MODEL_PATH} ({file_size} bytes)")
                    return True
                else:
                    logger.warning(f"Model file exists but seems incomplete ({file_size} bytes), re-downloading...")
                    os.remove(self.config.MODEL_PATH)
            except Exception as e:
                logger.warning(f"Error checking existing model file: {e}")
                try:
                    os.remove(self.config.MODEL_PATH)
                except:
                    pass

        # Ensure directory exists
        os.makedirs(os.path.dirname(self.config.MODEL_PATH), exist_ok=True)

        try:
            logger.info(f"Downloading model from Hugging Face...")
            logger.info(f"URL: {self.config.HUGGINGFACE_MODEL_URL}")
            logger.info(f"Saving to: {self.config.MODEL_PATH}")

            response = requests.get(self.config.HUGGINGFACE_MODEL_URL, stream=True)
            response.raise_for_status()

            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0

            with open(self.config.MODEL_PATH, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)

                        # Log progress every 100MB
                        if total_size > 0 and downloaded_size % (100 * 1024 * 1024) < 8192:
                            progress = (downloaded_size / total_size * 100)
                            logger.info(f"Download progress: {progress:.1f}% ({downloaded_size // (1024*1024)}MB/{total_size // (1024*1024)}MB)")

            logger.info(f"✅ Model downloaded successfully: {self.config.MODEL_PATH}")
            logger.info(f"   Final size: {os.path.getsize(self.config.MODEL_PATH)} bytes")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to download model: {e}")
            # Clean up partial download
            try:
                if os.path.exists(self.config.MODEL_PATH):
                    os.remove(self.config.MODEL_PATH)
            except:
                pass
            return False

    def _load_model_async(self):
        """Load your trained model asynchronously"""
        try:
            # Check if model exists locally first
            if not os.path.exists(self.config.MODEL_PATH):
                logger.info(f"Local model not found at {self.config.MODEL_PATH}")
                # Download model from Hugging Face if needed
                if not self._download_model_from_huggingface():
                    logger.error("Failed to download model from Hugging Face")
                    self.model_loaded = False
                    return
            else:
                logger.info(f"✅ Using local model file: {self.config.MODEL_PATH}")

            logger.info("Loading PhoBERT tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.config.MODEL_NAME)

            logger.info("Loading your trained PhoBERT model...")

            # Initialize model with same architecture as training
            self.model = PhoBERTForTokenClassification(
                model_name=self.config.MODEL_NAME,
                num_labels=self.config.NUM_LABELS,
                dropout_rate=self.config.DROPOUT_RATE
            )

            # Load your trained weights
            checkpoint = torch.load(self.config.MODEL_PATH, map_location=self.device, weights_only=False)
            self.model.load_state_dict(checkpoint['model_state_dict'])

            self.model.to(self.device)
            self.model.eval()

            logger.info(f"✅ Model loaded successfully!")
            logger.info(f"   Epoch: {checkpoint.get('epoch', 'Unknown')}")
            logger.info(f"   Best F1: {checkpoint.get('best_f1', 'Unknown')}")

            self.model_loaded = True

        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            self.model_loaded = False
    
    def is_ready(self):
        return self.model_loaded
    
    def detect_profanity(self, text):
        """Detect profanity using your trained PhoBERT model"""
        if not self.is_ready():
            return {
                'error': 'Model is still loading. Please try again in a moment.',
                'is_profane': False,
                'confidence': 0.0,
                'toxic_spans': [],
                'processed_text': text
            }
        
        try:
            # Preprocess text
            processed_text = text.strip()
            
            if not processed_text:
                return {
                    'is_profane': False,
                    'confidence': 0.0,
                    'toxic_spans': [],
                    'processed_text': ''
                }
            
            # Tokenize
            encoding = self.tokenizer(
                processed_text,
                truncation=True,
                padding='max_length',
                max_length=self.config.MAX_LENGTH,
                return_tensors='pt'
            )
            
            # Move to device
            input_ids = encoding['input_ids'].to(self.device)
            attention_mask = encoding['attention_mask'].to(self.device)
            
            # Inference
            with torch.no_grad():
                outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
                logits = outputs['logits']
                
                # Get probabilities
                probabilities = torch.softmax(logits, dim=-1)
                predictions = torch.argmax(logits, dim=-1)
                
                # Convert to numpy
                probs = probabilities.cpu().numpy()[0]
                preds = predictions.cpu().numpy()[0]
                
                # Find toxic spans and confidence
                toxic_spans = []
                max_confidence = 0.0
                
                for i, (pred, prob_dist) in enumerate(zip(preds, probs)):
                    if pred != 0:  # Not 'O' (clean)
                        confidence = float(prob_dist[pred])  # Convert to Python float
                        max_confidence = max(max_confidence, confidence)

                        # Simple character span approximation
                        char_start = int(max(0, i * 2))  # Convert to Python int
                        char_end = int(min(len(processed_text), char_start + 4))  # Convert to Python int
                        toxic_spans.append([char_start, char_end])

            # Determine if text is profane
            is_profane = bool(len(toxic_spans) > 0 and max_confidence > self.config.CONFIDENCE_THRESHOLD)  # Convert to Python bool

            return {
                'is_profane': is_profane,
                'confidence': float(max_confidence),
                'toxic_spans': toxic_spans,
                'processed_text': processed_text,
                'model_type': 'phobert_trained'
            }
            
        except Exception as e:
            logger.error(f"Error during profanity detection: {e}")
            return {
                'error': f'Detection failed: {str(e)}',
                'is_profane': False,
                'confidence': 0.0,
                'toxic_spans': [],
                'processed_text': text
            }

# Initialize Flask app and detector
app = Flask(__name__)
CORS(app)

detector = ProfanityDetector()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': detector.is_ready(),
        'model_type': 'phobert_trained',
        'device': str(detector.device),
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
        
        # Detect profanity using your trained model
        result = detector.detect_profanity(text)
        
        # Add request metadata
        result['timestamp'] = time.time()
        result['model_version'] = 'phobert-trained-1.0'
        
        logger.info(f"Profanity check: '{text[:50]}...' -> {'PROFANE' if result['is_profane'] else 'CLEAN'}")
        
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
        'model_name': 'PhoBERT Vietnamese Profanity Detection',
        'model_type': 'phobert_trained',
        'base_model': 'vinai/phobert-base',
        'max_length': detector.config.MAX_LENGTH,
        'labels': detector.config.LABELS,
        'confidence_threshold': detector.config.CONFIDENCE_THRESHOLD,
        'model_loaded': detector.is_ready(),
        'device': str(detector.device)
    })

if __name__ == '__main__':
    print("🚀 Starting Vietnamese Profanity Detection Server")
    print("📱 Model: Your Trained PhoBERT Model")
    print("🔧 Mode: Production")
    print("⏳ Loading model... (this may take a minute)")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
