from flask_jwt_extended import JWTManager
from flask import Flask
from .routes import register_routes

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.DevelopmentConfig')
    jwt.init_app(app)
    
    register_routes(app)
    
    return app