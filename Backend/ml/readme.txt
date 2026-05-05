1. Install Python
    First, download and install the Python compiler on your system.

2. Install Required Packages
   Open the VS Code terminal and run the following command:
   pip install flask flask-cors pandas scikit-learn joblib numpy
3. Prepare Your Dataset
   Place your dataset inside a folder named dataset
   Update lines 10–14 in train_model_lostfound.py according to your dataset:
   *Dataset file path
   *Feature columns (input fields)
   *Target column (the value you want to predict)

4. Train the Model
  Run the training script from the ml folder using:

5. python train_model_lostfound.py

6. Run the Flask API 
   Start your API server by running: python app2.py

7. Access Your Local API
Once the server is running, your API will be available at:

http://127.0.0.1:5000/<feature1>/<feature2>/<feature3>/<feature4>

Replace each <feature> with your actual input values separated by slashes.