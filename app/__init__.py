from flask_jwt_extended import JWTManager
from flask import Flask
from flask_migrate import Migrate
from .models import db
from .routes import register_routes

jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    db.init_app(app)
    Migrate(app, db)
    jwt.init_app(app)
    
    register_routes(app)
    
    return app