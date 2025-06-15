#!/usr/bin/env python3
"""
Production startup script for Vietnamese Profanity Detection Server
Handles model downloading and prevents infinite loops
"""

import os
import sys
import subprocess
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_model_file():
    """Check if model file exists and is valid"""
    model_path = "./best_phobert_model.pth"
    
    if os.path.exists(model_path):
        file_size = os.path.getsize(model_path)
        if file_size > 100 * 1024 * 1024:  # At least 100MB
            logger.info(f"✅ Valid model file found: {model_path} ({file_size} bytes)")
            return True
        else:
            logger.warning(f"Model file exists but seems incomplete ({file_size} bytes). Removing...")
            try:
                os.remove(model_path)
            except:
                pass
    
    logger.info("No valid model file found")
    return False

def download_model():
    """Download model if not exists"""
    import requests
    
    if check_model_file():
        return True
    
    url = "https://huggingface.co/ViBuck/best_phobert_model/resolve/main/best_phobert_model.pth"
    target_path = "./best_phobert_model.pth"
    
    logger.info(f"Downloading model from: {url}")
    logger.info(f"Saving to: {target_path}")
    
    try:
        response = requests.get(url, stream=True, timeout=300)
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
        logger.info(f"✅ Model downloaded successfully: {final_size} bytes")
        
        return final_size > 100 * 1024 * 1024
        
    except Exception as e:
        logger.error(f"❌ Failed to download model: {e}")
        # Clean up partial download
        try:
            if os.path.exists(target_path):
                os.remove(target_path)
        except:
            pass
        return False

def main():
    """Main startup function"""
    logger.info("🚀 Starting Vietnamese Profanity Detection Server")
    logger.info("📱 Model: Your Trained PhoBERT Model")
    logger.info("� Mode: Production")
    
    # Ensure model is available before starting server
    if not check_model_file():
        logger.info("⏳ Downloading model... (this may take a few minutes)")
        if not download_model():
            logger.error("❌ Failed to download model. Exiting.")
            sys.exit(1)
    
    logger.info("✅ Model ready. Starting server...")
    logger.info("=" * 60)
    
    # Start the actual server
    try:
        subprocess.run([sys.executable, "real_ai_server.py"], check=True)
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
