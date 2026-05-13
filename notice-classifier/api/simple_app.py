# api/simple_app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)

# Try to import predictor
try:
    from src.predict import NoticePredictor
    predictor = NoticePredictor()
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Model not loaded: {e}")
    predictor = None

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'status': 'running',
        'message': 'Notice Classification API is working!',
        'endpoints': {
            '/health': 'GET - Check API status',
            '/info': 'GET - Get model information',
            '/predict': 'POST - Make a prediction'
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'predictor_loaded': predictor is not None,
        'server': 'running'
    })

@app.route('/info', methods=['GET'])
def info():
    if predictor is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'categories': list(predictor.category_encoder.classes_),
        'audiences': list(predictor.audience_encoder.classes_),
        'priorities': list(predictor.priority_encoder.classes_)
    })

@app.route('/predict', methods=['POST', 'GET'])
def predict():
    # For GET requests in browser, show example
    if request.method == 'GET':
        return jsonify({
            'message': 'Please use POST method with JSON body',
            'example': {
                'title': 'CSE 327 Final Exam',
                'description': 'Exam on June 25',
                'department': 'CSE'
            }
        })
    
    # For POST requests
    if predictor is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '')
        description = data.get('description', '')
        department = data.get('department', '')
        
        result = predictor.predict_single(title, description, department)
        
        return jsonify({
            'success': True,
            'prediction': result
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 NOTICE CLASSIFICATION API")
    print("="*50)
    print("\n✅ Server starting...")
    print("📍 Test these URLs in your browser:")
    print("   http://localhost:5000/")
    print("   http://localhost:5000/health")
    print("   http://localhost:5000/info")
    print("\n🔴 Press Ctrl+C to stop\n")
    print("="*50 + "\n")
    
    app.run(host='127.0.0.1', port=5000, debug=False)