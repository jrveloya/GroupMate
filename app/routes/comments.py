from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import convert_objectid_to_str, create_task_comment, get_task, update_comment

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    user_id = get_jwt_identity()
    create_task_comment(
        task_id = data['task_id'],
        user_id= user_id,
        content = data['content'])
    return jsonify({'message':'Comment Added'}), 201

@comments_bp.route('/task/<task_id>', methods=['GET'])
@jwt_required()
def get_comments(task_id):
    task = get_task(task_id)
    if not task:
        return jsonify({'error' : 'Task not found'}), 404
    comments = task.get("comments", [])
    comments = convert_objectid_to_str(comments)
    return jsonify(comments)

@comments_bp.route('/<comment_id>', methods=['PUT'])
@jwt_required()
def update_comment_route(comment_id):
    data = request.get_json()
    new_content = data.get('content')

    if not new_content:
        return jsonify({"error": "Content is required to update the comment."}), 400

    result = update_comment(comment_id, new_content)

    if result.matched_count == 0:
        return jsonify({"error": "Comment not found."}), 404
    if result.modified_count == 0:
        return jsonify({"error": "Comment update failed."}), 500

    return jsonify({"message": "Comment updated successfully."}), 200

# April 27, 2025  @ 12:43 pm PDT -- add Update and Delete methods/routes for comments