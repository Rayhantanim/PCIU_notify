# src/train_model.py (CORRECTED VERSION)
import numpy as np
import joblib
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix, precision_recall_fscore_support
import seaborn as sns
import matplotlib.pyplot as plt
import pandas as pd
import os
import warnings
warnings.filterwarnings('ignore')

class NoticeMultiOutputClassifier:
    def __init__(self, base_estimator=None):
        if base_estimator is None:
            # Default: Random Forest with optimized parameters
            base_estimator = RandomForestClassifier(
                n_estimators=200,
                max_depth=20,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42,
                n_jobs=-1
            )
        self.model = MultiOutputClassifier(base_estimator, n_jobs=-1)
        self.base_estimator_name = base_estimator.__class__.__name__
        
    def train(self, X_train, y_train_category, y_train_audience, y_train_priority):
        """Train the multi-output classifier"""
        # Stack the target variables
        y_train = np.column_stack([y_train_category, y_train_audience, y_train_priority])
        
        print(f"\n🚀 Training {self.base_estimator_name} on {X_train.shape[0]} samples...")
        print(f"   Features: {X_train.shape[1]}")
        print(f"   Outputs: 3 (Category, Audience, Priority)")
        
        self.model.fit(X_train, y_train)
        print("   ✅ Training completed!")
        
        # Feature importance if available
        if hasattr(self.model.estimators_[0], 'feature_importances_'):
            importances = np.mean([est.feature_importances_ for est in self.model.estimators_], axis=0)
            print(f"   Top 5 feature indices: {np.argsort(importances)[-5:][::-1]}")
        
        return self.model
    
    def predict(self, X_test):
        """Predict all three labels"""
        predictions = self.model.predict(X_test)
        return predictions[:, 0], predictions[:, 1], predictions[:, 2]
    
    def evaluate(self, X_test, y_test_category, y_test_audience, y_test_priority, 
                 category_encoder, audience_encoder, priority_encoder):
        """Evaluate model performance"""
        
        print("\n" + "="*70)
        print("📊 MODEL EVALUATION RESULTS")
        print("="*70)
        
        # Get predictions
        y_pred_cat, y_pred_aud, y_pred_pri = self.predict(X_test)
        
        # Calculate accuracies
        acc_cat = accuracy_score(y_test_category, y_pred_cat)
        acc_aud = accuracy_score(y_test_audience, y_pred_aud)
        acc_pri = accuracy_score(y_test_priority, y_pred_pri)
        
        print(f"\n📈 ACCURACY SCORES:")
        print(f"   Category:  {acc_cat:.4f} ({acc_cat*100:.2f}%)")
        print(f"   Audience:  {acc_aud:.4f} ({acc_aud*100:.2f}%)")
        print(f"   Priority:  {acc_pri:.4f} ({acc_pri*100:.2f}%)")
        print(f"   {'─'*40}")
        print(f"   Average:   {(acc_cat+acc_aud+acc_pri)/3:.4f} ({(acc_cat+acc_aud+acc_pri)/3*100:.2f}%)")
        
        # Classification reports with actual class names
        print("\n" + "-"*70)
        print("📋 DETAILED CLASSIFICATION REPORTS")
        print("-"*70)
        
        print("\n🔖 CATEGORY CLASSIFICATION:")
        print(classification_report(
            y_test_category, y_pred_cat,
            target_names=category_encoder.classes_,
            digits=4
        ))
        
        print("\n👥 AUDIENCE CLASSIFICATION:")
        print(classification_report(
            y_test_audience, y_pred_aud,
            target_names=audience_encoder.classes_,
            digits=4
        ))
        
        print("\n⚡ PRIORITY CLASSIFICATION:")
        print(classification_report(
            y_test_priority, y_pred_pri,
            target_names=priority_encoder.classes_,
            digits=4
        ))
        
        # Confusion matrices visualization
        self.plot_confusion_matrices(
            y_test_category, y_pred_cat, category_encoder.classes_, 
            y_test_audience, y_pred_aud, audience_encoder.classes_,
            y_test_priority, y_pred_pri, priority_encoder.classes_
        )
        
        return {
            'accuracy_category': acc_cat,
            'accuracy_audience': acc_aud,
            'accuracy_priority': acc_pri,
            'average_accuracy': (acc_cat+acc_aud+acc_pri)/3,
            'y_pred_category': y_pred_cat,
            'y_pred_audience': y_pred_aud,
            'y_pred_priority': y_pred_pri
        }
    
    def plot_confusion_matrices(self, y_cat_true, y_cat_pred, cat_classes, 
                                 y_aud_true, y_aud_pred, aud_classes,
                                 y_pri_true, y_pri_pred, pri_classes):
        """Plot confusion matrices for all three targets"""
        fig, axes = plt.subplots(1, 3, figsize=(18, 5))
        
        # Category confusion matrix
        cm_cat = confusion_matrix(y_cat_true, y_cat_pred)
        sns.heatmap(cm_cat, annot=True, fmt='d', xticklabels=cat_classes, 
                   yticklabels=cat_classes, ax=axes[0], cmap='Blues', cbar=False)
        axes[0].set_title('Category Confusion Matrix', fontsize=12, fontweight='bold')
        axes[0].set_xlabel('Predicted', fontsize=10)
        axes[0].set_ylabel('Actual', fontsize=10)
        
        # Audience confusion matrix
        cm_aud = confusion_matrix(y_aud_true, y_aud_pred)
        sns.heatmap(cm_aud, annot=True, fmt='d', xticklabels=aud_classes,
                   yticklabels=aud_classes, ax=axes[1], cmap='Greens', cbar=False)
        axes[1].set_title('Audience Confusion Matrix', fontsize=12, fontweight='bold')
        axes[1].set_xlabel('Predicted', fontsize=10)
        axes[1].set_ylabel('Actual', fontsize=10)
        
        # Priority confusion matrix
        cm_pri = confusion_matrix(y_pri_true, y_pri_pred)
        sns.heatmap(cm_pri, annot=True, fmt='d', xticklabels=pri_classes,
                   yticklabels=pri_classes, ax=axes[2], cmap='Oranges', cbar=False)
        axes[2].set_title('Priority Confusion Matrix', fontsize=12, fontweight='bold')
        axes[2].set_xlabel('Predicted', fontsize=10)
        axes[2].set_ylabel('Actual', fontsize=10)
        
        plt.tight_layout()
        
        # Save the figure
        os.makedirs('models', exist_ok=True)
        plt.savefig('models/confusion_matrices.png', dpi=150, bbox_inches='tight')
        print(f"\n💾 Confusion matrices saved to 'models/confusion_matrices.png'")
        plt.show()
    
    def save_model(self, path='models/notice_classifier.pkl'):
        """Save the trained model"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.model, path)
        print(f"\n💾 Model saved to {path}")
    
    def load_model(self, path='models/notice_classifier.pkl'):
        """Load a trained model"""
        self.model = joblib.load(path)
        print(f"📂 Model loaded from {path}")

def compare_models(X_train, X_test, y_cat_train, y_cat_test, 
                   y_aud_train, y_aud_test, y_pri_train, y_pri_test,
                   category_encoder, audience_encoder, priority_encoder):
    """Compare multiple models to find the best one"""
    
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=15, random_state=42, n_jobs=-1),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=120, max_depth=10, random_state=42),
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42, n_jobs=-1),
        'MLP Neural Network': MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=500, random_state=42, early_stopping=True),
        'Linear SVM': LinearSVC(max_iter=2000, random_state=42, dual='auto')
    }
    
    results = []
    
    print("\n" + "="*70)
    print("🔄 MODEL COMPARISON (Finding Best Algorithm)")
    print("="*70)
    
    for name, base_model in models.items():
        try:
            print(f"\n📊 Training {name}...")
            classifier = NoticeMultiOutputClassifier(base_model)
            classifier.train(X_train, y_cat_train, y_aud_train, y_pri_train)
            
            y_pred_cat, y_pred_aud, y_pred_pri = classifier.predict(X_test)
            
            acc_cat = accuracy_score(y_cat_test, y_pred_cat)
            acc_aud = accuracy_score(y_aud_test, y_pred_aud)
            acc_pri = accuracy_score(y_pri_test, y_pred_pri)
            avg_acc = (acc_cat + acc_aud + acc_pri) / 3
            
            results.append({
                'Model': name,
                'Category Acc': f"{acc_cat:.4f}",
                'Audience Acc': f"{acc_aud:.4f}",
                'Priority Acc': f"{acc_pri:.4f}",
                'Average Acc': f"{avg_acc:.4f}"
            })
            
            print(f"   ✅ Category: {acc_cat:.4f}, Audience: {acc_aud:.4f}, Priority: {acc_pri:.4f}, Avg: {avg_acc:.4f}")
        except Exception as e:
            print(f"   ❌ {name} failed: {str(e)[:50]}")
    
    if results:
        results_df = pd.DataFrame(results)
        print("\n" + "="*70)
        print("📊 MODEL COMPARISON SUMMARY")
        print("="*70)
        print(results_df.to_string(index=False))
        
        # Find best model
        best_idx = np.argmax([float(r['Average Acc']) for r in results])
        print(f"\n⭐ BEST MODEL: {results[best_idx]['Model']} with average accuracy {results[best_idx]['Average Acc']}")
        
        return results_df
    else:
        print("\n⚠️ No models completed successfully")
        return None

def train_final_model(X_train, X_test, y_cat_train, y_cat_test, 
                      y_aud_train, y_aud_test, y_pri_train, y_pri_test,
                      category_encoder, audience_encoder, priority_encoder):
    """Train and evaluate the final model"""
    
    print("\n" + "="*70)
    print("🏆 TRAINING FINAL MODEL")
    print("="*70)
    
    # Create and train final model
    final_model = NoticeMultiOutputClassifier()
    final_model.train(X_train, y_cat_train, y_aud_train, y_pri_train)
    
    # Evaluate
    evaluation_results = final_model.evaluate(
        X_test, y_cat_test, y_aud_test, y_pri_test,
        category_encoder, audience_encoder, priority_encoder
    )
    
    # Save model
    final_model.save_model('models/notice_classifier.pkl')
    
    return final_model, evaluation_results

def run_training():
    """Run the complete training pipeline"""
    
    print("\n" + "="*70)
    print("🚀 STEP 3: MODEL TRAINING PIPELINE")
    print("="*70)
    
    # Load processed data
    print("\n📂 Loading preprocessed data...")
    X_train = np.load('data/processed/X_train.npy')
    X_test = np.load('data/processed/X_test.npy')
    y_cat_train = np.load('data/processed/y_train_category.npy')
    y_cat_test = np.load('data/processed/y_test_category.npy')
    y_aud_train = np.load('data/processed/y_train_audience.npy')
    y_aud_test = np.load('data/processed/y_test_audience.npy')
    y_pri_train = np.load('data/processed/y_train_priority.npy')
    y_pri_test = np.load('data/processed/y_test_priority.npy')
    
    print(f"   ✅ Training set: {X_train.shape[0]} samples")
    print(f"   ✅ Test set: {X_test.shape[0]} samples")
    print(f"   ✅ Features: {X_train.shape[1]}")
    
    # Load encoders
    print("\n📂 Loading label encoders...")
    category_encoder = joblib.load('data/encoders/category_encoder.pkl')
    audience_encoder = joblib.load('data/encoders/audience_encoder.pkl')
    priority_encoder = joblib.load('data/encoders/priority_encoder.pkl')
    
    print(f"   Categories: {list(category_encoder.classes_)}")
    print(f"   Audiences: {list(audience_encoder.classes_)}")
    print(f"   Priorities: {list(priority_encoder.classes_)}")
    
    # Compare models (optional but recommended)
    print("\n" + "="*70)
    print("🔄 OPTIONAL: Comparing different algorithms")
    print("="*70)
    print("This will take 2-3 minutes. Press Ctrl+C to skip...")
    
    try:
        compare_models(X_train, X_test, y_cat_train, y_cat_test, 
                      y_aud_train, y_aud_test, y_pri_train, y_pri_test,
                      category_encoder, audience_encoder, priority_encoder)
    except KeyboardInterrupt:
        print("\n⏭️ Skipping model comparison...")
    except Exception as e:
        print(f"\n⚠️ Could not run comparison: {e}")
    
    # Train final model
    final_model, results = train_final_model(
        X_train, X_test, y_cat_train, y_cat_test,
        y_aud_train, y_aud_test, y_pri_train, y_pri_test,
        category_encoder, audience_encoder, priority_encoder
    )
    
    print("\n" + "="*70)
    print("✅ STEP 3 COMPLETED SUCCESSFULLY!")
    print("="*70)
    print("\n📁 Files created:")
    print("   models/notice_classifier.pkl")
    print("   models/confusion_matrices.png")
    
    return final_model, results

if __name__ == "__main__":
    run_training()