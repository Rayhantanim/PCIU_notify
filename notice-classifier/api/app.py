# api/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import logging
from datetime import datetime

# Add parent directory to path to import from src
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.predict import NoticePredictor

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global predictor instance
predictor = None

def get_predictor():
    """Lazy loading of predictor (loads only once)"""
    global predictor
    if predictor is None:
        try:
            logger.info("Loading model and encoders...")
            predictor = NoticePredictor()
            logger.info("✅ Model loaded successfully!")
        except Exception as e:
            logger.error(f"❌ Failed to load model: {str(e)}")
            raise
    return predictor

@app.route('/', methods=['GET'])
def home():
    """API home page"""
    return jsonify({
        'name': 'Notice Classification API',
        'version': '1.0.0',
        'description': 'Predict category, audience, and priority for university notices',
        'endpoints': {
            'GET /': 'API information',
            'GET /health': 'Health check',
            'GET /info': 'Model information',
            'POST /predict': 'Predict single notice',
            'POST /predict/batch': 'Predict multiple notices'
        },
        'examples': {
            'POST /predict': {
                'title': 'CSE 327 Final Exam',
                'description': 'Final exam will be held on June 25',
                'department': 'CSE'
            }
        }
    }), 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        predictor = get_predictor()
        return jsonify({
            'status': 'healthy',
            'model_loaded': True,
            'timestamp': datetime.now().isoformat(),
            'message': 'Notice Prediction API is running'
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'model_loaded': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/info', methods=['GET'])
def get_model_info():
    """Get model information and available classes"""
    try:
        predictor = get_predictor()
        
        response = {
            'model_loaded': True,
            'available_categories': list(predictor.category_encoder.classes_),
            'available_audiences': list(predictor.audience_encoder.classes_),
            'available_priorities': list(predictor.priority_encoder.classes_),
            'vectorizer_features': len(predictor.vectorizer.vocabulary_),
            'model_type': type(predictor.model).__name__,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Error getting model info: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict category, audience, priority for a single notice"""
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        title = data.get('title', '')
        description = data.get('description', '')
        department = data.get('department', '')
        
        if not title and not description:
            return jsonify({'error': 'Either title or description is required'}), 400
        
        # Get prediction
        predictor_instance = get_predictor()
        result = predictor_instance.predict_single(title, description, department)
        
        # Get suggestions
        suggestions = predictor_instance.get_suggestions(title, description, department)
        
        # Prepare response
        response = {
            'success': True,
            'prediction': {
                'category': result['category'],
                'audience': result['audience'],
                'priority': result['priority'],
                'codes': {
                    'category_code': result.get('category_code', -1),
                    'audience_code': result.get('audience_code', -1),
                    'priority_code': result.get('priority_code', -1)
                }
            },
            'suggestions': {
                'priority_meaning': suggestions.get('priority_meaning', ''),
                'notification_channel': suggestions.get('notification_channel', '')
            },
            'input': {
                'title': title[:100] + '...' if len(title) > 100 else title,
                'description': description[:200] + '...' if len(description) > 200 else description,
                'department': department if department else 'Not specified'
            },
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Prediction made - Category: {result['category']}, Audience: {result['audience']}, Priority: {result['priority']}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/batch', methods=['POST'])
def predict_batch():
    """Predict for multiple notices"""
    try:
        data = request.get_json()
        
        if not data or 'notices' not in data:
            return jsonify({'error': 'Please provide a list of notices. Format: {"notices": [...]}'}), 400
        
        notices = data['notices']
        if not isinstance(notices, list):
            return jsonify({'error': 'notices must be an array'}), 400
        
        if len(notices) > 100:
            return jsonify({'error': 'Maximum 100 notices per batch request'}), 400
        
        predictor_instance = get_predictor()
        results = predictor_instance.predict_batch(notices)
        
        # Add suggestions to each result
        for i, notice in enumerate(notices):
            suggestions = predictor_instance.get_suggestions(
                notice.get('title', ''),
                notice.get('description', ''),
                notice.get('department', '')
            )
            results[i]['suggestions'] = {
                'priority_meaning': suggestions.get('priority_meaning', ''),
                'notification_channel': suggestions.get('notification_channel', '')
            }
        
        response = {
            'success': True,
            'total': len(results),
            'predictions': results,
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"Batch prediction completed for {len(results)} notices")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/predict/form', methods=['POST'])
def predict_form():
    """Handle form data submission (for web forms)"""
    try:
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        department = request.form.get('department', '')
        
        if not title and not description:
            return jsonify({'error': 'Either title or description is required'}), 400
        
        predictor_instance = get_predictor()
        result = predictor_instance.predict_single(title, description, department)
        
        return jsonify({
            'success': True,
            'prediction': result,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        logger.error(f"Form prediction error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 NOTICE CLASSIFICATION API")
    print("="*60)
    print("\n📡 Starting API server...")
    print("\n📍 Available endpoints:")
    print("   GET  http://localhost:5000/          - API information")
    print("   GET  http://localhost:5000/health    - Health check")
    print("   GET  http://localhost:5000/info      - Model information")
    print("   POST http://localhost:5000/predict   - Single prediction")
    print("   POST http://localhost:5000/predict/batch - Batch prediction")
    print("\n📝 Example POST request:")
    print('   curl -X POST http://localhost:5000/predict \\')
    print('     -H "Content-Type: application/json" \\')
    print('     -d \'{"title":"Exam tomorrow","description":"Final exam at 9 AM","department":"CSE"}\'')
    print("\n" + "="*60)
    print("✅ API is ready! Press Ctrl+C to stop")
    print("="*60 + "\n")
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)