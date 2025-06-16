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
    
    # Model path priority for deployment:
    # 1. Environment variable (set in Dockerfile)
    # 2. Pre-baked model path (Docker build time)
    # 3. Local fallback for development (current directory)
    MODEL_PATH = os.getenv("MODEL_PATH", "./best_phobert_model.pth")
    
    DROPOUT_RATE = 0.3
    # Hugging Face model URL (only for local development)
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
    """Vietnamese Profanity Detection using your trained PhoBERT model - Persistent model"""
    
    def __init__(self):
        self.config = Config()
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.loading_error = None
        self.model_loaded = False
        self.loading_in_progress = False
        self.model = None
        self.tokenizer = None
        
        logger.info(f"Using device: {self.device}")
        logger.info("🧠 Persistent mode: Model will stay loaded in memory")
        
        # Start loading model in background
        threading.Thread(target=self._load_model_async, daemon=True).start()
        
    def _find_model_file(self):
        """Find the model file in order of preference for Render deployment"""
        
        # 1. Check the pre-built model path (Docker build time download)
        if os.path.exists(self.config.MODEL_PATH):
            file_size = os.path.getsize(self.config.MODEL_PATH)
            if file_size > 100 * 1024 * 1024:  # At least 100MB
                logger.info(f"✅ Found pre-built model: {self.config.MODEL_PATH} ({file_size} bytes)")
                return self.config.MODEL_PATH
            else:
                logger.warning(f"Pre-built model file seems incomplete ({file_size} bytes)")
        else:
            logger.warning(f"Pre-built model not found at: {self.config.MODEL_PATH}")
        
        # 2. For local development, check current directory only if MODEL_PATH is the default
        default_path = "/app/models/best_phobert_model.pth"
        if self.config.MODEL_PATH == default_path:
            local_path = "./best_phobert_model.pth"
            if os.path.exists(local_path):
                file_size = os.path.getsize(local_path)
                if file_size > 100 * 1024 * 1024:  # At least 100MB
                    logger.info(f"✅ Found local model: {local_path} ({file_size} bytes)")
                    return local_path
                else:
                    logger.warning(f"Local model file seems incomplete ({file_size} bytes)")
        
        logger.error("❌ No valid model file found! Check Docker build logs.")
        return None
    
    def _download_model_from_huggingface(self, target_path):
        """Download model from Hugging Face if not exists locally"""
        # Check if file already exists and is valid
        if os.path.exists(target_path):
            file_size = os.path.getsize(target_path)
            if file_size > 100 * 1024 * 1024:  # At least 100MB
                logger.info(f"Model file already exists: {target_path} ({file_size} bytes)")
                return True

        # Create a lock file to prevent multiple downloads
        lock_file = target_path + ".downloading"
        if os.path.exists(lock_file):
            logger.info("Another download process is in progress, waiting...")
            # Wait for up to 10 minutes for download to complete
            for _ in range(600):  # 600 seconds = 10 minutes
                time.sleep(1)
                if os.path.exists(target_path) and os.path.getsize(target_path) > 100 * 1024 * 1024:
                    logger.info("Download completed by another process")
                    return True
                if not os.path.exists(lock_file):
                    break
            
        # Ensure directory exists
        os.makedirs(os.path.dirname(target_path) if os.path.dirname(target_path) else ".", exist_ok=True)

        try:
            # Create lock file
            with open(lock_file, 'w') as f:
                f.write("downloading")
            
            logger.info(f"Downloading model from Hugging Face...")
            logger.info(f"URL: {self.config.HUGGINGFACE_MODEL_URL}")
            logger.info(f"Saving to: {target_path}")

            response = requests.get(self.config.HUGGINGFACE_MODEL_URL, stream=True, timeout=300)
            response.raise_for_status()

            total_size = int(response.headers.get('content-length', 0))
            downloaded_size = 0

            with open(target_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
                        downloaded_size += len(chunk)

                        # Log progress every 100MB
                        if total_size > 0 and downloaded_size % (100 * 1024 * 1024) < 8192:
                            progress = (downloaded_size / total_size * 100)
                            logger.info(f"Download progress: {progress:.1f}% ({downloaded_size // (1024*1024)}MB/{total_size // (1024*1024)}MB)")

            final_size = os.path.getsize(target_path)
            logger.info(f"✅ Model downloaded successfully: {target_path}")
            logger.info(f"  Final size: {final_size} bytes")
            
            # Remove lock file
            try:
                os.remove(lock_file)
            except:
                pass
            
            if final_size < 100 * 1024 * 1024:
                logger.error(f"❌ Downloaded file seems too small ({final_size} bytes)")
                return False
                
            return True

        except Exception as e:
            logger.error(f"❌ Failed to download model: {e}")
            # Clean up partial download and lock file
            try:
                if os.path.exists(target_path):
                    os.remove(target_path)
                if os.path.exists(lock_file):
                    os.remove(lock_file)
            except:
                pass
            return False

    def _load_model_async(self):
        """Load your trained model asynchronously"""
        try:
            # Step 1: Find the model file
            model_path = self._find_model_file()
            
            if not model_path:
                # In production (Render), the model should be pre-built in Docker
                # If it's not found, this is a serious deployment issue
                if os.getenv("MODEL_PATH"):
                    error_msg = "Pre-built model not found! Check Docker build process."
                    logger.error(f"❌ {error_msg}")
                    logger.error("This suggests the model download failed during Docker build.")
                    self.loading_error = error_msg
                    self.model_loaded = False
                    self.loading_in_progress = False
                    return
                else:
                    # Local development - try to download to the configured path
                    logger.info("Local development: downloading model...")
                    if self._download_model_from_huggingface(self.config.MODEL_PATH):
                        model_path = self.config.MODEL_PATH
                    else:
                        error_msg = "Failed to download model for local development"
                        logger.error(f"❌ {error_msg}")
                        self.loading_error = error_msg
                        self.model_loaded = False
                        self.loading_in_progress = False
                        return

            logger.info(f"📂 Using model file: {model_path}")

            # Step 2: Load tokenizer
            logger.info("Loading PhoBERT tokenizer...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.config.MODEL_NAME)

            # Step 3: Load model
            logger.info("Loading your trained PhoBERT model...")

            # Initialize model with same architecture as training
            self.model = PhoBERTForTokenClassification(
                model_name=self.config.MODEL_NAME,
                num_labels=self.config.NUM_LABELS,
                dropout_rate=self.config.DROPOUT_RATE
            )

            # Load your trained weights
            logger.info("⚖️ Loading trained weights...")
            checkpoint = torch.load(model_path, map_location=self.device, weights_only=False)
            self.model.load_state_dict(checkpoint['model_state_dict'])

            # Clear checkpoint from memory immediately
            del checkpoint
            
            self.model.to(self.device)
            self.model.eval()
            
            # Force garbage collection to free memory
            import gc
            gc.collect()

            # Success!
            logger.info(f"✅ Model loaded successfully and ready for requests!")
            logger.info(f"   🖥️ Device: {self.device}")

            self.model_loaded = True
            self.loading_error = None
            self.loading_in_progress = False

        except Exception as e:
            error_msg = f"Failed to load model: {str(e)}"
            logger.error(f"❌ {error_msg}")
            self.loading_error = error_msg
            self.model_loaded = False
            self.loading_in_progress = False
    
    def is_ready(self):
        """Check if model is loaded and ready"""
        return self.model_loaded and self.model is not None and self.tokenizer is not None
    
    def detect_profanity(self, text):
        """Fast profanity detection using persistent model"""
        
        # Check if model is ready
        if not self.is_ready():
            if self.loading_in_progress:
                return {
                    'error': 'Model is still loading, please wait...',
                    'is_profane': False,
                    'confidence': 0.0,
                    'toxic_spans': [],
                    'processed_text': text
                }
            elif self.loading_error:
                return {
                    'error': f'Model loading failed: {self.loading_error}',
                    'is_profane': False,
                    'confidence': 0.0,
                    'toxic_spans': [],
                    'processed_text': text
                }
            else:
                return {
                    'error': 'Model not available',
                    'is_profane': False,
                    'confidence': 0.0,
                    'toxic_spans': [],
                    'processed_text': text
                }
        
        try:
            # Process the request with the loaded model
            result = self._process_text_with_model(text, self.tokenizer, self.model)
            logger.info(f"✅ Fast detection completed for: '{text[:30]}...'")
            return result
            
        except Exception as e:
            error_msg = f"Error during processing: {str(e)}"
            logger.error(error_msg)
            return {
                'error': error_msg,
                'is_profane': False,
                'confidence': 0.0,
                'toxic_spans': [],
                'processed_text': text
            }
    
    def _process_text_with_model(self, text, tokenizer, model):
        """Process text with loaded model"""
        
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
            encoding = tokenizer(
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
                outputs = model(input_ids=input_ids, attention_mask=attention_mask)
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

# Configure CORS to allow all origins (temporary fix)
CORS(app, 
     origins="*",
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Accept"],
     supports_credentials=False)

# Initialize detector ONLY ONCE - this is critical!
detector = None

def get_detector():
    """Singleton pattern to ensure detector is initialized only once"""
    global detector
    if detector is None:
        detector = ProfanityDetector()
    return detector

@app.route('/health', methods=['GET'])
def health_check():
    """Enhanced health check endpoint"""
    detector = get_detector()
    
    response = {
        'status': 'healthy',
        'model_loaded': detector.is_ready(),
        'model_status': 'ready' if detector.is_ready() else ('loading' if detector.loading_in_progress else 'error'),
        'model_type': 'phobert_trained',
        'device': str(detector.device),
        'memory_mode': 'persistent',
        'loading_error': detector.loading_error,
        'timestamp': time.time()
    }
    
    return jsonify(response), 200

@app.route('/detect', methods=['POST'])
def detect_profanity():
    """Main profanity detection endpoint"""
    try:
        detector = get_detector()
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
    detector = get_detector()
    return jsonify({
        'model_name': 'PhoBERT Vietnamese Profanity Detection',
        'model_type': 'phobert_trained',
        'base_model': 'vinai/phobert-base',
        'max_length': detector.config.MAX_LENGTH,
        'labels': detector.config.LABELS,
        'confidence_threshold': detector.config.CONFIDENCE_THRESHOLD,
        'model_loaded': detector.is_ready(),
        'memory_mode': 'persistent',
        'device': str(detector.device)
    })

if __name__ == '__main__':
    print("🚀 Starting Vietnamese Profanity Detection Server")
    print("📱 Model: Your Trained PhoBERT Model")
    print("🔧 Mode: Production")
    print("⚡ Persistent model for fast responses")
    print("=" * 60)
    
    logger.info("Server starting in persistent mode - model will stay loaded")
    logger.info("Model loading will begin in background thread")
    
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True)
