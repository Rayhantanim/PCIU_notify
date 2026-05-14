# api/portable_app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return jsonify({'message': 'API is working!', 'status': 'ok'})

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'port': 5001})

@app.route('/info')
def info():
    return jsonify({
        'categories': ['academic', 'event', 'exam', 'general'],
        'audiences': ['students', 'faculty', 'all', 'alumni', 'prospective'],
        'priorities': ['low', 'medium', 'high', 'urgent']
    })

@app.route('/predict', methods=['POST'])
def predict():
    return jsonify({
        'success': True,
        'prediction': {
            'category': 'academic',
            'audience': 'students',
            'priority': 'high'
        }
    })

if __name__ == '__main__':
    print("\n🚀 Testing API on port 5001")
    print("📍 http://localhost:5001/health")
    app.run(host='127.0.0.1', port=5001, debug=False)