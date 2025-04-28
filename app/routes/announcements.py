from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import create_announcement, get_db

announcement_bp = Blueprint('announcement', __name__)

@announcement_bp.route('/project/<project_id>', methods=['GET'])
@jwt_required()
def get_announcements(project_id):
    db = get_db()
    user_id = get_jwt_identity()

    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        return jsonify({"error": "Project not found."}), 404

    # Check if the user is assigned to this project
    if ObjectId(user_id) not in project.get("member_ids", []):
        return jsonify({"error": "Unauthorized access to announcements."}), 403

    announcements = list(db.announcements.find({"project_id": ObjectId(project_id)}))
    for a in announcements:
        a['_id'] = str(a['_id'])
        a['project_id'] = str(a['project_id'])
        a['created_by'] = str(a['created_by'])
        a['created_at'] = a['created_at'].isoformat()

    return jsonify(announcements)

@announcement_bp.route('/', methods = ['POST'])
@jwt_required()
def create_announcement_route():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    project_id = data.get('project_id')
    content = data.get('content')
    title = data.get('title')
    
    if not project_id or not content:
        return jsonify({"error" : "Project ID and Content are Required"}), 400
    
    announcement_id = create_announcement(
        project_id = project_id,
        user_id = user_id,
        title = title,
        content = content
    )
    
    return jsonify({
        "message" : "Announcement Created",
        "announcement_id" : announcement_id
    }), 201
    