from flask import Blueprint, request, jsonify
from app.models import db, Announcement

announcement_bp = Blueprint('announcement', __name__)

@announcement_bp.route('/', methods=['POST'])
def create_announcement():
    data = request.json()
    announcement = Announcement(
        title = data['title'],
        content=data['content'],
        project_id = data['project_id']
    )
    db.session.add(announcement)
    db.session.commit()
    return jsonify({
        'message' : 'Announcement created'
    }), 201