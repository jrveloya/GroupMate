from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import get_db
import datetime

auth_bp = Blueprint('auth', __name__)

# SIGN UP ROUTE
@auth_bp.route('/signup', methods=['POST'])
def signup():
    db = get_db()
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'member')  # default role is member

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    if db.users.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 409

    password_hash = generate_password_hash(password)
    new_user = {
        "username": username,
        "password_hash": password_hash,
        "role": role,
        "tasks_completed": 0,
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }

    user_id = db.users.insert_one(new_user).inserted_id

    return jsonify({
        "message": "User created successfully",
        "user_id": str(user_id)
    }), 201


# LOGIN ROUTE
@auth_bp.route('/login', methods=['POST'])
def login():
    db = get_db()
    data = request.get_json()

    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    user = db.users.find_one({"username": username})

    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    if not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    # If password matches, create a JWT
    access_token = create_access_token(identity=str(user['_id']))

    return jsonify({
        "access_token": access_token,
        "message": "Login successful"
    }), 200