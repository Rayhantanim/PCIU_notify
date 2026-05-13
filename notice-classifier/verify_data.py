# verify_data.py
import pandas as pd

# Load the data
df = pd.read_csv('data/raw/notices.csv')

print("="*50)
print("DATA VERIFICATION")
print("="*50)
print(f"✅ Total records: {len(df)}")
print(f"✅ Columns: {list(df.columns)}")
print(f"\n📊 Data distribution:")
print(f"\nCategory:")
print(df['category'].value_counts())
print(f"\nAudience:")
print(df['audience'].value_counts())
print(f"\nPriority:")
print(df['priority'].value_counts())
print(f"\nDepartment (non-empty):")
print(df[df['department'].notna()]['department'].value_counts())

# Check for missing values
print(f"\n⚠️ Missing values:")
print(df.isnull().sum())

# Show first 3 rows
print(f"\n📋 First 3 records:")
print(df[['title', 'category', 'audience', 'priority']].head(3))