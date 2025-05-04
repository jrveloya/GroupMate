from flask_jwt_extended import JWTManager
from flask import Flask
from flask_cors import CORS
from .routes import register_routes

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config.from_object('app.config.DevelopmentConfig')
    jwt.init_app(app)
    
    register_routes(app)
    
    return app