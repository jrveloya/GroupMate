import os
from app import create_app
from app import config
from flask_cors import CORS

app = create_app()
CORS(app, origins=["https://www.groupmateproject.com"], supports_credentials=True)

@app.route('/health', methods=['GET'])
def health_check():
    return 'OK', 200

@app.route("/debug/db")
def debug_db():
    return os.environ.get("MONGO_URI", "Not set")

if __name__ == '__main__':
    app.run(debug=True, port=5050, host='0.0.0.0')