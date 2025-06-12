#!/usr/bin/env python3
"""
Test script for Vietnamese Profanity Detection Integration
Tests the AI server endpoints and integration with the backend
"""

import requests
import json
import time
import sys

# Test configuration
AI_SERVER_URL = "http://localhost:5000"
BACKEND_URL = "http://localhost:8080"

# Test texts (Vietnamese)
TEST_TEXTS = [
    "Xin chào, tôi rất vui được ở đây!",  # Clean text
    "Đây là một bình luận bình thường",    # Clean text
    "Thằng ngu này không biết gì cả",      # Potentially offensive
    "Đm, tao ghét mày",                    # Offensive
    "Cảnh đẹp quá, tôi thích lắm!"        # Clean text
]

def test_ai_server_health():
    """Test AI server health endpoint"""
    print("Testing AI Server Health...")
    try:
        response = requests.get(f"{AI_SERVER_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ AI Server is healthy")
            print(f"  Status: {data.get('status')}")
            print(f"  Model loaded: {data.get('model_loaded')}")
            return True
        else:
            print(f"✗ AI Server health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ AI Server not reachable: {e}")
        return False

def test_ai_model_info():
    """Test AI model info endpoint"""
    print("\nTesting AI Model Info...")
    try:
        response = requests.get(f"{AI_SERVER_URL}/model_info", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print(f"✓ Model info retrieved")
            print(f"  Model: {data.get('model_name')}")
            print(f"  Max length: {data.get('max_length')}")
            print(f"  Device: {data.get('device')}")
            return True
        else:
            print(f"✗ Model info failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Model info error: {e}")
        return False

def test_profanity_detection():
    """Test profanity detection with sample texts"""
    print("\nTesting Profanity Detection...")
    
    for i, text in enumerate(TEST_TEXTS, 1):
        print(f"\nTest {i}: '{text}'")
        try:
            response = requests.post(
                f"{AI_SERVER_URL}/detect",
                json={"text": text},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                is_profane = data.get('is_profane', False)
                confidence = data.get('confidence', 0)
                
                status = "🔴 PROFANE" if is_profane else "🟢 CLEAN"
                print(f"  Result: {status} (confidence: {confidence:.2f})")
                
                if data.get('toxic_spans'):
                    print(f"  Toxic spans: {data['toxic_spans']}")
                
            else:
                print(f"  ✗ Detection failed: {response.status_code}")
                
        except Exception as e:
            print(f"  ✗ Detection error: {e}")

def test_backend_integration():
    """Test backend integration (if backend is running)"""
    print("\nTesting Backend Integration...")
    try:
        response = requests.get(f"{BACKEND_URL}/actuator/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend is running")
            return True
        else:
            print(f"✗ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Backend not reachable: {e}")
        print("  (This is OK if you haven't started the backend yet)")
        return False

def main():
    """Main test function"""
    print("=" * 60)
    print("Vietnamese Profanity Detection - Integration Test")
    print("=" * 60)
    
    # Test AI server
    ai_healthy = test_ai_server_health()
    if not ai_healthy:
        print("\n❌ AI Server is not running or not healthy")
        print("Please start the AI server first using:")
        print("  python start_ai_server.py")
        sys.exit(1)
    
    # Test model info
    test_ai_model_info()
    
    # Test profanity detection
    test_profanity_detection()
    
    # Test backend integration
    test_backend_integration()
    
    print("\n" + "=" * 60)
    print("Integration Test Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Start the backend server: mvn spring-boot:run")
    print("2. Start the frontend: npm run dev")
    print("3. Test the full integration in the web app")

if __name__ == "__main__":
    main()
