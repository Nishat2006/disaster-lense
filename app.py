from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder='../frontend')
CORS(app)

# In-memory storage for user reports (for demo purposes)
user_reports = []

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/disasters')
def get_disasters():
    # Placeholder: Return sample disaster data
    disasters = [
        {"id": 1, "type": "Earthquake", "location": "California, USA", "severity": "High", "lat": 36.7783, "lng": -119.4179, "time": "2024-06-01T12:00:00Z"},
        {"id": 2, "type": "Flood", "location": "Bangladesh", "severity": "Medium", "lat": 23.685, "lng": 90.3563, "time": "2024-06-02T08:00:00Z"}
    ]
    return jsonify(disasters)

@app.route('/api/reports', methods=['GET', 'POST'])
def handle_reports():
    if request.method == 'POST':
        data = request.json
        user_reports.append(data)
        return jsonify({"status": "success", "report": data}), 201
    else:
        return jsonify(user_reports)

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == '__main__':
    app.run(debug=True) 