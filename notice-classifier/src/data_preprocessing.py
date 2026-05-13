# src/data_preprocessing.py
import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

# Download NLTK data (run once)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('omw-1.4', quiet=True)

class NoticePreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        
    def clean_text(self, text):
        """Clean and preprocess text"""
        if pd.isna(text) or not isinstance(text, str):
            text = str(text) if pd.notna(text) else ''
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters and digits (keep letters and spaces)
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        
        # Remove extra spaces
        text = re.sub(r'\s+', ' ', text).strip()
        
        if not text:
            return ''
        
        # Tokenize, remove stopwords, lemmatize
        words = text.split()
        words = [self.lemmatizer.lemmatize(word) for word in words 
                 if word not in self.stop_words and len(word) > 2]
        
        return ' '.join(words)
    
    def combine_features(self, row):
        """Combine title and description for better context"""
        title = str(row['title']) if pd.notna(row['title']) else ''
        description = str(row['description']) if pd.notna(row['description']) else ''
        department = str(row['department']) if pd.notna(row['department']) else ''
        
        # Weight title more by repeating it
        combined = title + ' ' + title + ' ' + description + ' ' + department
        return combined

def load_and_preprocess_data(csv_path='data/raw/notices.csv'):
    """Load and preprocess the notice data"""
    print("="*60)
    print("STEP 2: DATA PREPROCESSING")
    print("="*60)
    
    print("\n📂 Loading data from:", csv_path)
    df = pd.read_csv(csv_path)
    print(f"   ✅ Loaded {len(df)} records")
    
    # Check for missing values
    print(f"\n   Checking for missing values...")
    for col in df.columns:
        missing = df[col].isna().sum()
        if missing > 0:
            print(f"      ⚠️ {col}: {missing} missing (filling with empty string)")
    
    # Fill missing values
    df['title'] = df['title'].fillna('')
    df['description'] = df['description'].fillna('')
    df['department'] = df['department'].fillna('')
    df['section'] = df['section'].fillna('')
    
    # Initialize preprocessor
    preprocessor = NoticePreprocessor()
    
    # Create combined text feature
    print("\n   Creating combined text features...")
    df['combined_text'] = df.apply(preprocessor.combine_features, axis=1)
    
    # Clean the combined text
    print("   Cleaning text data (this may take a moment)...")
    df['cleaned_text'] = df['combined_text'].apply(preprocessor.clean_text)
    
    # Remove empty texts
    before_count = len(df)
    df = df[df['cleaned_text'].str.len() > 0]
    after_count = len(df)
    if before_count > after_count:
        print(f"   ⚠️ Removed {before_count - after_count} records with empty text")
    
    print(f"   ✅ After cleaning: {len(df)} records")
    
    # Extract target columns
    X = df['cleaned_text'].values
    y_category = df['category'].values
    y_audience = df['audience'].values
    y_priority = df['priority'].values
    
    # Print distribution
    print("\n📊 Target distributions:")
    print(f"   Categories:")
    for cat, count in pd.Series(y_category).value_counts().items():
        print(f"      {cat}: {count} ({count/len(y_category)*100:.1f}%)")
    
    print(f"   Audiences:")
    for aud, count in pd.Series(y_audience).value_counts().items():
        print(f"      {aud}: {count} ({count/len(y_audience)*100:.1f}%)")
    
    print(f"   Priorities:")
    for pri, count in pd.Series(y_priority).value_counts().items():
        print(f"      {pri}: {count} ({count/len(y_priority)*100:.1f}%)")
    
    return X, y_category, y_audience, y_priority, df

def create_vectorizer_and_encoders(X_train, y_category_train, y_audience_train, y_priority_train, save_dir='data/encoders'):
    """Create TF-IDF vectorizer and label encoders"""
    
    print("\n🔧 Creating TF-IDF vectorizer...")
    # Create TF-IDF vectorizer
    tfidf = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 3),
        min_df=2,
        max_df=0.95
    )
    X_train_tfidf = tfidf.fit_transform(X_train)
    print(f"   ✅ TF-IDF shape: {X_train_tfidf.shape}")
    print(f"   Vocabulary size: {len(tfidf.vocabulary_)}")
    
    # Create label encoders for each target
    print("\n🏷️ Creating label encoders...")
    category_encoder = LabelEncoder()
    audience_encoder = LabelEncoder()
    priority_encoder = LabelEncoder()
    
    y_category_encoded = category_encoder.fit_transform(y_category_train)
    y_audience_encoded = audience_encoder.fit_transform(y_audience_train)
    y_priority_encoded = priority_encoder.fit_transform(y_priority_train)
    
    print(f"   Category classes: {list(category_encoder.classes_)}")
    print(f"   Audience classes: {list(audience_encoder.classes_)}")
    print(f"   Priority classes: {list(priority_encoder.classes_)}")
    
    # Save encoders and vectorizer
    os.makedirs(save_dir, exist_ok=True)
    joblib.dump(tfidf, f'{save_dir}/tfidf_vectorizer.pkl')
    joblib.dump(category_encoder, f'{save_dir}/category_encoder.pkl')
    joblib.dump(audience_encoder, f'{save_dir}/audience_encoder.pkl')
    joblib.dump(priority_encoder, f'{save_dir}/priority_encoder.pkl')
    
    print(f"\n💾 Saved encoders to {save_dir}/")
    
    return X_train_tfidf, y_category_encoded, y_audience_encoded, y_priority_encoded, tfidf

def split_and_save_data(X_tfidf, y_category, y_audience, y_priority, test_size=0.2, save_dir='data/processed'):
    """Split data and save as numpy arrays"""
    
    print("\n📊 Splitting data into train and test sets...")
    X_train, X_test, y_cat_train, y_cat_test, y_aud_train, y_aud_test, y_pri_train, y_pri_test = train_test_split(
        X_tfidf, y_category, y_audience, y_priority,
        test_size=test_size,
        random_state=42,
        stratify=y_category  # Stratify by category for balanced split
    )
    
    print(f"   Train size: {X_train.shape[0]} records")
    print(f"   Test size: {X_test.shape[0]} records")
    
    # Save processed data
    os.makedirs(save_dir, exist_ok=True)
    
    # Convert sparse matrix to dense if needed
    X_train_dense = X_train.toarray() if hasattr(X_train, 'toarray') else X_train
    X_test_dense = X_test.toarray() if hasattr(X_test, 'toarray') else X_test
    
    np.save(f'{save_dir}/X_train.npy', X_train_dense)
    np.save(f'{save_dir}/X_test.npy', X_test_dense)
    np.save(f'{save_dir}/y_train_category.npy', y_cat_train)
    np.save(f'{save_dir}/y_test_category.npy', y_cat_test)
    np.save(f'{save_dir}/y_train_audience.npy', y_aud_train)
    np.save(f'{save_dir}/y_test_audience.npy', y_aud_test)
    np.save(f'{save_dir}/y_train_priority.npy', y_pri_train)
    np.save(f'{save_dir}/y_test_priority.npy', y_pri_test)
    
    print(f"💾 Saved processed data to {save_dir}/")
    
    return X_train, X_test, y_cat_train, y_cat_test, y_aud_train, y_aud_test, y_pri_train, y_pri_test

def run_preprocessing():
    """Run the complete preprocessing pipeline"""
    
    # Load and preprocess data
    X, y_cat, y_aud, y_pri, df = load_and_preprocess_data('data/raw/notices.csv')
    
    # Create vectorizer and encoders (using full dataset first to fit)
    print("\n" + "="*60)
    print("CREATING VECTORIZER AND ENCODERS")
    print("="*60)
    X_tfidf, y_cat_enc, y_aud_enc, y_pri_enc, tfidf = create_vectorizer_and_encoders(
        X, y_cat, y_aud, y_pri
    )
    
    # Split and save data
    print("\n" + "="*60)
    print("SPLITTING AND SAVING DATA")
    print("="*60)
    X_train, X_test, y_cat_train, y_cat_test, y_aud_train, y_aud_test, y_pri_train, y_pri_test = split_and_save_data(
        X_tfidf, y_cat_enc, y_aud_enc, y_pri_enc
    )
    
    print("\n" + "="*60)
    print("✅ PREPROCESSING COMPLETED SUCCESSFULLY!")
    print("="*60)
    print("\n📁 Files created:")
    print("   data/encoders/tfidf_vectorizer.pkl")
    print("   data/encoders/category_encoder.pkl")
    print("   data/encoders/audience_encoder.pkl")
    print("   data/encoders/priority_encoder.pkl")
    print("   data/processed/X_train.npy")
    print("   data/processed/X_test.npy")
    print("   data/processed/y_train_category.npy")
    print("   data/processed/y_test_category.npy")
    print("   data/processed/y_train_audience.npy")
    print("   data/processed/y_test_audience.npy")
    print("   data/processed/y_train_priority.npy")
    print("   data/processed/y_test_priority.npy")
    
    return X_train, X_test, y_cat_train, y_cat_test, y_aud_train, y_aud_test, y_pri_train, y_pri_test

if __name__ == "__main__":
    run_preprocessing()