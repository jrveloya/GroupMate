from flask import Blueprint, request, jsonify
from app.models import db, Comment

comments_bp = Blueprint('comments', __name__)

@comments_bp('/', methods=['POST'])
def create_comment(task_id):
    data=request.data()
    comment = Comment(
        content = data['content'],
        user_id = data['user_id'],
        task_id = data['task_id']
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify({
        'message' : 'Comment added'
    }), 201