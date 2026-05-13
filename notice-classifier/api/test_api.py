# api/test_api.py
import requests
import json

# API base URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("\n🏥 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")

def test_info():
    """Test info endpoint"""
    print("\n📊 Testing Model Info...")
    response = requests.get(f"{BASE_URL}/info")
    if response.status_code == 200:
        data = response.json()
        print(f"   Categories: {data['available_categories']}")
        print(f"   Audiences: {data['available_audiences']}")
        print(f"   Priorities: {data['available_priorities']}")
    else:
        print(f"   Error: {response.status_code}")

def test_single_prediction():
    """Test single prediction endpoint"""
    print("\n🔮 Testing Single Prediction...")
    
    test_cases = [
        {
            "title": "CSE 327 Final Exam on June 25",
            "description": "Final exam for Software Testing course will be held on June 25 from 9 AM to 12 PM. All students must bring ID cards.",
            "department": "CSE"
        },
        {
            "title": "University Closed for Eid-ul-Adha",
            "description": "University will remain closed from June 25 to July 5 on occasion of Eid-ul-Adha. All classes and offices suspended.",
            "department": ""
        },
        {
            "title": "Annual Internship Fair 2026",
            "description": "Internship fair on July 5 with 20+ companies. Bring updated CVs. Register by June 30.",
            "department": "BBA"
        },
        {
            "title": "Faculty Meeting on Curriculum Review",
            "description": "All faculty members must attend curriculum review meeting on June 28 at 3 PM.",
            "department": "CSE"
        }
    ]
    
    for i, notice in enumerate(test_cases, 1):
        print(f"\n   📝 Test {i}: {notice['title'][:40]}...")
        response = requests.post(
            f"{BASE_URL}/predict",
            json=notice,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                pred = data['prediction']
                print(f"      → Category: {pred['category']}")
                print(f"      → Audience: {pred['audience']}")
                print(f"      → Priority: {pred['priority']}")
                if 'suggestions' in data:
                    print(f"      → Suggestion: {data['suggestions']['notification_channel'][:50]}...")
            else:
                print(f"      ❌ Error: {data.get('error', 'Unknown error')}")
        else:
            print(f"      ❌ HTTP Error: {response.status_code}")

def test_batch_prediction():
    """Test batch prediction endpoint"""
    print("\n📦 Testing Batch Prediction...")
    
    batch_data = {
        "notices": [
            {
                "title": "Scholarship Application Deadline",
                "description": "Last date to apply for scholarship is July 15",
                "department": "BBA"
            },
            {
                "title": "Library Hours Extended",
                "description": "Library open until 10 PM during exams",
                "department": ""
            },
            {
                "title": "CSE Project Presentation",
                "description": "Final year project presentations on June 30",
                "department": "CSE"
            }
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/predict/batch",
        json=batch_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        data = response.json()
        if data['success']:
            print(f"   Total predictions: {data['total']}")
            for i, pred in enumerate(data['predictions'], 1):
                print(f"\n   Prediction {i}:")
                print(f"      Category: {pred['category']}")
                print(f"      Audience: {pred['audience']}")
                print(f"      Priority: {pred['priority']}")
        else:
            print(f"   ❌ Error: {data.get('error', 'Unknown error')}")
    else:
        print(f"   ❌ HTTP Error: {response.status_code}")

def run_all_tests():
    """Run all API tests"""
    print("\n" + "="*60)
    print("🧪 API TEST SUITE")
    print("="*60)
    
    # First check if API is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        print("\n✅ API server is running!")
    except requests.exceptions.ConnectionError:
        print("\n❌ Cannot connect to API server!")
        print("   Please start the API first: python api/app.py")
        return
    
    # Run tests
    test_health()
    test_info()
    test_single_prediction()
    test_batch_prediction()
    
    print("\n" + "="*60)
    print("✅ All tests completed!")
    print("="*60)

if __name__ == "__main__":
    run_all_tests()