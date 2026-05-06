from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
import joblib

# Use your custom template folder
app = Flask(__name__, template_folder='template')
CORS(app)

# ---------------- LOAD SAVED ML OBJECTS ----------------
try:
    model = joblib.load("ml/model.pkl")
    le = joblib.load("ml/labelencoder.pkl")
    feature_cols = joblib.load("ml/featurecols.pkl")
    print("✅ Models loaded successfully")
except Exception as e:
    print(f"❌ Error loading models: {e}")
    model = le = feature_cols = None




# ---------------- GET API (URL style) ----------------
@app.route("/<item>/<desc>/<cat>/<loc>", methods=["GET"])
def url_predict(item, desc, cat, loc):
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        input_data = {
            "item_name": item.lower(),
            "description": desc.lower(),
            "category": cat.lower(),
            "location": loc.lower()
        }

        input_df = pd.DataFrame([[input_data[col] for col in feature_cols]],
                                columns=feature_cols)

        pred_enc = model.predict(input_df)[0]
        pred_name = le.inverse_transform([pred_enc])[0]

        confidence = None
        if hasattr(model, "predict_proba"):
            confidence = float(round(model.predict_proba(input_df).max() * 100, 2))

        return jsonify({
            "status": pred_name,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------- RUN APP ----------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)