from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import get_db, create_task_comment, get_task

comments_bp = Blueprint('comments', __name__)

@comments_bp('/', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    user = get_jwt_identity()
    create_task_comment(data['task_id'], user['id'], data['content'])
    return jsonify({'message':'Comment Added'}), 201

@comments_bp('/task/<task_id>', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    task = get_task(task_id)
    if not task:
        return jsonify({'error' : 'Task not found'}), 404
    comments = task.get("comments", [])
    return jsonify(comments)