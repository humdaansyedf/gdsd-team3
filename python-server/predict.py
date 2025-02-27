from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


# Load the trained model and scaler
scaler = joblib.load("scaler.pkl")
model = joblib.load("rent_price_model.pkl")

def predict_rent(user_input):
    # Convert input to DataFrame
    user_df = pd.DataFrame([user_input])

    # Convert boolean columns to integers
    bool_cols = ["balcony", "hasKitchen", "lift"]
    user_df[bool_cols] = user_df[bool_cols].astype(int)

    # Apply the same normalization as in training
    user_scaled = scaler.transform(user_df)

    # Make prediction
    predicted_rent = model.predict(user_scaled)
    return round(predicted_rent[0], 2)  # Return as a single value

@app.route('/predict-rent', methods=['POST'])
def predict_rent_endpoint():
    try:
        data = request.json
        print("Received Data:", data)  # Debugging line

        # Define the exact feature order used during model training
        feature_order = ["balcony", "hasKitchen", "livingSpace", "lift", "noRooms", "numberOfYear"]

        # Convert input to DataFrame and reorder columns
        user_df = pd.DataFrame([data], columns=feature_order)
        print("User DataFrame Columns:", user_df.columns)  # Debugging line

        # Convert boolean columns to integers
        bool_cols = ["balcony", "hasKitchen", "lift"]
        user_df[bool_cols] = user_df[bool_cols].astype(int)

        # Apply the same normalization as in training
        user_scaled = scaler.transform(user_df)

        # Make prediction
        predicted_rent = model.predict(user_scaled)
        return jsonify({"predicted_price": float(round(predicted_rent[0], 2))})
    except Exception as e:
        print("Prediction Error:", str(e))
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)