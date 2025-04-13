import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    # Flask settings
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

    # MongoDB URI (can use MongoDB Atlas or localhost)
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/projectsync")

    # JWT settings
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "another-super-secret")
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # Token expires after 1 hour (seconds)

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True
    MONGO_URI = "mongodb://localhost:27017/projectsync_test"