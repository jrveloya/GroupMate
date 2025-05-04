from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import convert_objectid_to_str, create_task_comment, get_task, update_comment, get_user_by_id, get_db

comments_bp = Blueprint('comments', __name__)

@comments_bp.route('/', methods=['POST'])
@jwt_required()
def create_comment():
    data = request.get_json()
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    

    comment_id = str(ObjectId()) 
    
    comment = create_task_comment(
        task_id=data['task_id'],
        username=user['username'],
        user_id=user_id,
        content=data['content'],
        comment_id=comment_id 
    )
    
    return jsonify({
        'message': 'Comment Added',
        'comment_id': comment_id,
        'comment': comment  
    }), 201

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

@comments_bp.route('/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    
    db = get_db()
    
    # Find the task that contains the comment
    task = db.tasks.find_one({"comments": {"$elemMatch": {"_id": ObjectId(comment_id)}}})
    
    if not task:
        return jsonify({"error": "Comment not found"}), 404
    
    # Get the comment using _id field
    comment = next((c for c in task["comments"] if str(c["_id"]) == comment_id), None)
    
    if not comment:
        return jsonify({"error": "Comment not found in task"}), 404
    
    # Check if the current user is authorized to delete this comment
    if str(comment.get("user_id")) != str(current_user_id):
        return jsonify({"error": "Unauthorized to delete this comment"}), 403
    
    # Delete the comment using _id field
    result = db.tasks.update_one(
        {"_id": task["_id"]},
        {"$pull": {"comments": {"_id": ObjectId(comment_id)}}}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Failed to delete comment"}), 500
    
    return jsonify({"message": "Comment deleted successfully"}), 200
        