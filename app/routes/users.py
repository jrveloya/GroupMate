from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import create_user, delete_user, get_all_users, get_user_by_id, update_basic_user_information
from werkzeug.security import generate_password_hash

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=["GET"])
@jwt_required()
def get_users_route():
    users = get_all_users()
    for u in users:
        u['_id'] = str(u['_id'])
        #pop the password_hash information for security purposes
        u.pop('password_hash', None)
    return jsonify(users)

@users_bp.route('/<user_id>', methods=["GET"])
@jwt_required()
def get_user_by_id_route(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"message" : "User not found."
        })
    user['_id'] = str(user["_id"])
    #pop the password_hash information for security purposes
    user.pop('password_hash', None)
    return jsonify(user)

@users_bp.route('/', methods=['POST'])
def create_user_route():
    data = request.get_json()

    # Validate required fields
    if not data.get('username') or not data.get('password'):
        return jsonify({"error": "Username and password are required."}), 400

    # Hash the password
    hashed_password = generate_password_hash(data['password'])

    user_id = create_user(
        username=data['username'],
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        password_hash=hashed_password,
        role=data.get('role', 'member')
    )

    return jsonify({
        "message": f"User created with ID {user_id}"
    }), 201

@users_bp.route('/', methods=["DELETE"])
@jwt_required()
def delete_user_route():
    user = get_jwt_identity()
    if not user:
        return jsonify({"error" : "User does not exist"}), 401
    if not delete_user(user[id]):
        return jsonify({"error" : "Something went wrong. Try again"}), 401
    else:
        return jsonify({"message" : "User deleted"}), 201
    
@users_bp.route('/', methods=['PUT'])
@jwt_required()
def update_user_route():
    data = request.get_json()
    user = get_jwt_identity()
    updates = {
        'username' : data['username'],
        'first_name' : data['first_name'],
        'last_name' : data['last_name']
    }
    updates = {k : v for k,v in updates.items() if v is not None}
    results = update_basic_user_information(user, updates)
    if results.matched_count == 0:
        return jsonify({'error' : 'User information error. Try again'}), 404
    return jsonify({'message' : 'Changes added successfully'}), 200
    