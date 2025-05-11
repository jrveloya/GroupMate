from app import create_app
from app import config

app = create_app()

@app.route('/health', methods=['GET'])
def health_check():
    return 'OK', 200

if __name__ == '__main__':
    app.run(debug=True, port=5050, host='0.0.0.0')