from bson import ObjectId
from flask import Blueprint, request, jsonify
from app.models import get_db

announcement_bp = Blueprint('announcement', __name__)

@announcement_bp.route('/project/<project_id>', methods=['POST'])
def get_announcements(project_id):
    db = get_db()
    announcements = list(db.announcements.find({"project_id" : ObjectId(project_id)}))
    for a in announcements:
        a['_id'] = str(a['_id'])
        a['project_id'] = str(a['project_id'])
    return jsonify(announcements)