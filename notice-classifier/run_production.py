# run_production.py
from waitress import serve
import sys
import os

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import your Flask app
from api.app import app

print("="*60)
print("🚀 NOTICE CLASSIFICATION API - PRODUCTION MODE")
print("="*60)
print("\n📡 Server running on: http://0.0.0.0:5000")
print("📍 Health check: http://localhost:5000/health")
print("📍 Press Ctrl+C to stop\n")

# Run with Waitress (production server)
serve(app, host='0.0.0.0', port=5000, threads=4)