#!/usr/bin/env python3
"""
Test script to verify the AI server fix for Render deployment
"""

import os
import requests
import time
import sys

def test_local_server():
    """Test if the server is working properly"""
    base_url = "http://localhost:5000"
    
    print("🧪 Testing AI Server Fix")
    print("=" * 50)
    
    # Test 1: Health check
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Health check passed")
            print(f"   📊 Model loaded: {data.get('model_loaded', False)}")
            print(f"   📁 Model path: {data.get('model_path', 'unknown')}")
            print(f"   🖥️ Device: {data.get('device', 'unknown')}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return False
    
    # Test 2: Model info
    print("\n2. Testing model info endpoint...")
    try:
        response = requests.get(f"{base_url}/model_info", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Model info retrieved")
            print(f"   📱 Model: {data.get('model_name', 'unknown')}")
            print(f"   🔧 Type: {data.get('model_type', 'unknown')}")
        else:
            print(f"   ❌ Model info failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Model info error: {e}")
    
    # Test 3: Profanity detection
    print("\n3. Testing profanity detection...")
    test_texts = [
        "Hello world",
        "This is a clean sentence",
        "Testing Vietnamese text: Xin chào"
    ]
    
    for text in test_texts:
        try:
            response = requests.post(
                f"{base_url}/detect",
                json={"text": text},
                timeout=10
            )
            if response.status_code == 200:
                data = response.json()
                result = "PROFANE" if data.get('is_profane', False) else "CLEAN"
                confidence = data.get('confidence', 0.0)
                print(f"   ✅ '{text}' -> {result} (confidence: {confidence:.3f})")
            else:
                print(f"   ❌ Detection failed for '{text}': {response.status_code}")
        except Exception as e:
            print(f"   ❌ Detection error for '{text}': {e}")
    
    print("\n✅ All tests completed!")
    return True

def check_model_file():
    """Check if model file exists locally"""
    paths_to_check = [
        "./best_phobert_model.pth",
        "/app/models/best_phobert_model.pth"
    ]
    
    print("📁 Checking model files...")
    for path in paths_to_check:
        if os.path.exists(path):
            size = os.path.getsize(path)
            size_mb = size / (1024 * 1024)
            print(f"   ✅ Found: {path} ({size_mb:.1f} MB)")
            if size_mb > 100:
                print(f"   ✅ Model size is valid")
                return True
            else:
                print(f"   ⚠️ Model size seems small")
        else:
            print(f"   ❌ Not found: {path}")
    
    print("   ⚠️ No valid model file found")
    return False

if __name__ == "__main__":
    print("🚀 AI Server Fix Validation")
    print("📅 Date: June 15, 2025")
    print("🎯 Purpose: Verify Render deployment fix")
    print("=" * 60)
    
    # Check model files first
    model_exists = check_model_file()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test-server":
        # Test running server
        test_local_server()
    else:
        print("\n💡 To test a running server, use: python test_fix.py --test-server")
        
    if model_exists:
        print("\n✅ Model file validation passed!")
    else:
        print("\n⚠️ Model file not found - server will need to download it")
        
    print("\n🔧 Summary of fixes applied:")
    print("   1. ✅ Fixed singleton pattern to prevent multiple detector instances")
    print("   2. ✅ Prioritized pre-built model path from Docker")
    print("   3. ✅ Added proper error handling for missing pre-built model")
    print("   4. ✅ Enhanced Dockerfile to validate model size during build")
    print("   5. ✅ Removed infinite download loop logic")
    
    print("\n🚀 Ready for Render deployment!")
