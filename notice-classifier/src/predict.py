# src/predict.py
import numpy as np
import joblib
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import nltk
import os

class NoticePredictor:
    def __init__(self, 
                 model_path='models/notice_classifier.pkl',
                 vectorizer_path='data/encoders/tfidf_vectorizer.pkl',
                 category_encoder_path='data/encoders/category_encoder.pkl',
                 audience_encoder_path='data/encoders/audience_encoder.pkl',
                 priority_encoder_path='data/encoders/priority_encoder.pkl'):
        
        # Check if files exist
        for path in [model_path, vectorizer_path, category_encoder_path, audience_encoder_path, priority_encoder_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"Required file not found: {path}. Please run training first.")
        
        # Load model and encoders
        self.model = joblib.load(model_path)
        self.vectorizer = joblib.load(vectorizer_path)
        self.category_encoder = joblib.load(category_encoder_path)
        self.audience_encoder = joblib.load(audience_encoder_path)
        self.priority_encoder = joblib.load(priority_encoder_path)
        
        # Initialize preprocessing tools
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
        
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
    def clean_text(self, text):
        """Clean and preprocess text (same as training)"""
        if not isinstance(text, str):
            text = str(text)
        
        text = text.lower()
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        words = text.split()
        words = [self.lemmatizer.lemmatize(word) for word in words 
                 if word not in self.stop_words and len(word) > 2]
        
        return ' '.join(words)
    
    def combine_features(self, title, description, department=''):
        """Combine features for prediction"""
        title = str(title) if title else ''
        description = str(description) if description else ''
        department = str(department) if department else ''
        
        # Weight title more by repeating it
        combined = title + ' ' + title + ' ' + description + ' ' + department
        return combined
    
    def predict_single(self, title, description, department=''):
        """Predict category, audience, priority for a single notice"""
        
        # Combine and clean text
        combined = self.combine_features(title, description, department)
        cleaned = self.clean_text(combined)
        
        if not cleaned:
            # Return default predictions if text is empty
            return {
                'category': 'general',
                'audience': 'all',
                'priority': 'medium',
                'category_code': 0,
                'audience_code': 0,
                'priority_code': 0,
                'warning': 'Empty text after preprocessing'
            }
        
        # Transform using TF-IDF
        features = self.vectorizer.transform([cleaned])
        
        # Make prediction (multi-output)
        predictions = self.model.predict(features)
        
        # Decode predictions
        category = self.category_encoder.inverse_transform([predictions[0][0]])[0]
        audience = self.audience_encoder.inverse_transform([predictions[0][1]])[0]
        priority = self.priority_encoder.inverse_transform([predictions[0][2]])[0]
        
        return {
            'category': category,
            'audience': audience,
            'priority': priority,
            'category_code': int(predictions[0][0]),
            'audience_code': int(predictions[0][1]),
            'priority_code': int(predictions[0][2])
        }
    
    def predict_batch(self, notices):
        """Predict for multiple notices
        
        notices: list of dict with keys: title, description, department (optional)
        """
        results = []
        for notice in notices:
            pred = self.predict_single(
                notice.get('title', ''),
                notice.get('description', ''),
                notice.get('department', '')
            )
            results.append(pred)
        return results
    
    def get_suggestions(self, title, description, department=''):
        """Get prediction with additional suggestions"""
        
        pred = self.predict_single(title, description, department)
        
        # Priority explanation
        priority_meanings = {
            'low': 'Not urgent, can be scheduled for later notification',
            'medium': 'Important, but not critical. Regular notification priority',
            'high': 'Important, should be highlighted and sent promptly',
            'urgent': 'Critical! Immediate notification required'
        }
        
        # Audience suggestions
        audience_suggestions = {
            'students': 'Notify via student portal, SMS, and WhatsApp groups',
            'faculty': 'Send email and post on faculty dashboard',
            'all': 'Notify everyone via all channels (email, SMS, portal, notice board)',
            'alumni': 'Send newsletter and post on alumni portal',
            'prospective': 'Post on admission portal and social media'
        }
        
        pred['priority_meaning'] = priority_meanings.get(pred['priority'], '')
        pred['notification_channel'] = audience_suggestions.get(pred['audience'], '')
        
        return pred

if __name__ == "__main__":
    # Test the predictor
    predictor = NoticePredictor()
    
    test_notices = [
        {
            'title': 'CSE 327 Final Exam on June 25',
            'description': 'Final exam for Software Testing course will be held on June 25 from 9 AM to 12 PM.',
            'department': 'CSE'
        },
        {
            'title': 'University Closed for Eid-ul-Adha',
            'description': 'University will remain closed from June 25 to July 5.',
            'department': ''
        },
        {
            'title': 'Annual Internship Fair 2026',
            'description': 'Internship fair on July 5 with 20+ companies.',
            'department': 'BBA'
        }
    ]
    
    print("\n" + "="*60)
    print("🎯 TESTING THE TRAINED MODEL")
    print("="*60)
    
    for i, notice in enumerate(test_notices, 1):
        result = predictor.predict_single(
            notice['title'], 
            notice['description'], 
            notice['department']
        )
        
        print(f"\n📝 Test Notice {i}:")
        print(f"   Title: {notice['title'][:50]}...")
        print(f"\n   🤖 PREDICTIONS:")
        print(f"   → Category: {result['category']}")
        print(f"   → Audience: {result['audience']}")
        print(f"   → Priority: {result['priority']}")
        print("-"*50)