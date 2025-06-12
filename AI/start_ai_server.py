#!/usr/bin/env python3
"""
Startup script for Vietnamese Profanity Detection AI Server
This script loads the trained PhoBERT model and starts the Flask server
"""

import os
import sys
import torch
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_requirements():
    """Check if all required dependencies are installed"""
    required_packages = [
        'torch',
        'transformers', 
        'flask',
        'flask_cors',
        'numpy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {missing_packages}")
        logger.error("Please install them using: pip install " + " ".join(missing_packages))
        return False
    
    return True

def check_model_file():
    """Check if the trained model file exists"""
    model_path = Path(__file__).parent / "best_phobert_model.pth"
    
    if not model_path.exists():
        logger.error(f"Model file not found: {model_path}")
        logger.error("Please ensure the trained model file 'best_phobert_model.pth' is in the AI directory")
        return False
    
    logger.info(f"Model file found: {model_path}")
    return True

def check_gpu():
    """Check GPU availability"""
    if torch.cuda.is_available():
        gpu_name = torch.cuda.get_device_name(0)
        gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
        logger.info(f"GPU available: {gpu_name} ({gpu_memory:.1f} GB)")
        return True
    else:
        logger.info("GPU not available, using CPU")
        return False

def main():
    """Main startup function"""
    logger.info("=" * 60)
    logger.info("Vietnamese Profanity Detection AI Server - Startup")
    logger.info("=" * 60)
    
    # Check requirements
    logger.info("1. Checking requirements...")
    if not check_requirements():
        sys.exit(1)
    
    # Check model file
    logger.info("2. Checking model file...")
    if not check_model_file():
        sys.exit(1)
    
    # Check GPU
    logger.info("3. Checking GPU availability...")
    check_gpu()
    
    # Start the server
    logger.info("4. Starting AI server...")
    try:
        # Import and start the profanity server
        from profanity_server import app, detector
        
        # Wait for model to load
        logger.info("5. Loading AI model...")
        while not detector.is_ready():
            import time
            time.sleep(1)
            logger.info("   Model loading...")
        
        logger.info("6. Model loaded successfully!")
        logger.info("=" * 60)
        logger.info("AI Server starting on http://localhost:5000")
        logger.info("Health check: http://localhost:5000/health")
        logger.info("Model info: http://localhost:5000/model_info")
        logger.info("=" * 60)
        
        # Start Flask app
        app.run(host='0.0.0.0', port=5000, debug=False)
        
    except ImportError as e:
        logger.error(f"Failed to import profanity_server: {e}")
        logger.error("Falling back to mock server...")
        
        try:
            from profanity_server_mock import app
            logger.info("Starting mock AI server on http://localhost:5000")
            app.run(host='0.0.0.0', port=5000, debug=False)
        except ImportError:
            logger.error("Failed to import mock server as well!")
            sys.exit(1)
    
    except Exception as e:
        logger.error(f"Failed to start AI server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
