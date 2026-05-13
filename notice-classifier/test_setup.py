# test_setup.py
import pandas as pd
import numpy as np
import sklearn
import nltk
import joblib
import flask

print("✅ All libraries imported successfully!")

# Test NLTK download
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
print("✅ NLTK data downloaded!")

# Test data loading
try:
    df = pd.read_csv('data/raw/notices.csv')
    print(f"✅ Data loaded: {len(df)} records")
except Exception as e:
    print(f"❌ Error loading data: {e}")

print("\n🎉 Setup complete! Ready for Step 2.")