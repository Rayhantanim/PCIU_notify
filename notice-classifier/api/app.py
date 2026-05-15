# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging
from datetime import datetime
import pickle
import numpy as np
from scipy.sparse import hstack

# Add parent directory to path to import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.predict import NoticePredictor

# Setup logging - reduced verbosity
logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global predictor instance
predictor = None

def get_predictor():
    """Lazy loading of predictor (loads only once)"""
    global predictor
    if predictor is None:
        try:
            logger.info("Loading model...")
            predictor = NoticePredictor()
            # Pre-load all encoders for faster access
            predictor.category_encoder.classes_
            predictor.audience_encoder.classes_
            predictor.priority_encoder.classes_
            logger.info("Model loaded successfully!")
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise
    return predictor

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        'name': 'Notice Classification API',
        'version': '2.0.0',
        'endpoints': {
            'GET /health': 'Health check',
            'POST /predict': 'Predict single notice'
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    try:
        get_predictor()
        return jsonify({'status': 'healthy'}), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Fast prediction endpoint"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '')
        description = data.get('description', '')
        department = data.get('department', '')
        
        if not title and not description:
            return jsonify({'error': 'Title or description required'}), 400
        
        # Quick prediction
        predictor_instance = get_predictor()
        
        # Combine text and vectorize
        combined_text = f"{title} {description} {department}".strip()
        text_vector = predictor_instance.vectorizer.transform([combined_text])
        
        # Add department feature if available
        if department and hasattr(predictor_instance, 'dept_mapping'):
            dept_feature = np.array([[predictor_instance.dept_mapping.get(department, 0)]])
            final_features = hstack([text_vector, dept_feature])
        else:
            final_features = text_vector
        
        # Predict
        pred_code = predictor_instance.model.predict(final_features)[0]
        
        # Decode using pre-loaded classes
        category = predictor_instance.category_encoder.classes_[pred_code[0]] if len(pred_code) > 0 else "General"
        audience = predictor_instance.audience_encoder.classes_[pred_code[1]] if len(pred_code) > 1 else "All"
        
        # Quick priority calculation
        priority_map = {
            'exam': 3, 'deadline': 3, 'urgent': 3, 'emergency': 3,
            'important': 2, 'mandatory': 2, 'required': 2,
            'reminder': 1, 'update': 1, 'information': 1
        }
        
        text_lower = combined_text.lower()
        priority_score = 0
        for keyword, score in priority_map.items():
            if keyword in text_lower:
                priority_score = max(priority_score, score)
        
        priority = {3: 'High', 2: 'Medium', 1: 'Low', 0: 'Medium'}.get(priority_score, 'Medium')
        
        response = {
            'category': category,
            'audience': audience,
            'priority': priority
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Remove batch and form endpoints for speed
# Keep only essential error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 NOTICE API (Optimized)")
    print("="*50)
    print("\n📍 Endpoints:")
    print("   POST http://localhost:5001/predict")
    print("   GET  http://localhost:5001/health")
    print("\n📝 Example:")
    print('   curl -X POST http://localhost:5001/predict \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"title":"Exam tomorrow","department":"CSE"}\'')
    print("\n" + "="*50 + "\n")
    
    # Changed port to 5001
    app.run(host='0.0.0.0', port=5001, debug=False, threaded=True)