import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import HistGradientBoostingClassifier

df = pd.read_csv(r'C:\Users\user\Downloads\LostFound\LostFound\dataset\lost_found_dataset.csv')

# ---------------- FEATURES (item_id removed) ----------------
feature_cols = ['item_name', 'description', 'category', 'location']
target_col = 'status'

# Remove rare classes
min_samples = 5
valid = df[target_col].value_counts()
valid = valid[valid >= min_samples].index
df = df[df[target_col].isin(valid)]

X = df[feature_cols].copy()
y = df[target_col].copy()

# Encode target
le = LabelEncoder()
y = le.fit_transform(y)

# All are categorical/text
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OrdinalEncoder(handle_unknown='use_encoded_value', unknown_value=-1), feature_cols)
    ]
)

model = HistGradientBoostingClassifier(random_state=42, max_depth=8)

pipeline = Pipeline([
    ('prep', preprocessor),
    ('model', model)
])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

pipeline.fit(X_train, y_train)
print("Accuracy:", pipeline.score(X_test, y_test))

# ✅ SAVE CORRECTLY


os.makedirs(r'C:\Users\user\Downloads\LostFound\LostFound\ml', exist_ok=True)

# joblib.dump(pipeline, r'F:\house-rent-ml-project\LostFound\ml\model.pkl')
# joblib.dump(le, r'F:\house-rent-ml-project\LostFound\ml\label_encoder.pkl')
# joblib.dump(feature_cols, r'F:\house-rent-ml-project\LostFound\ml\feature_cols.pkl')
joblib.dump(pipeline, r'C:\Users\user\Downloads\LostFound\LostFound\ml\model.pkl')
joblib.dump(le, r'C:\Users\user\Downloads\LostFound\LostFound\ml\labelencoder.pkl')
joblib.dump(feature_cols, r'C:\Users\user\Downloads\LostFound\LostFound\ml\featurecols.pkl')