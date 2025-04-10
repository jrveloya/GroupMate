from flask import Blueprint, jsonify
from app.models import User

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=["GET"])
def get_users():
    users = User.query.all()
    return jsonify([
        {
            'id':u.id,
            'username' : u.username,
            'role' : u.role
        } for u in users
    ])