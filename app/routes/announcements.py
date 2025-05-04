from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import create_announcement, get_db, update_announcement

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

#Get all announcements for a specific user
@announcement_bp.route('/user', methods=['GET'])
@jwt_required()
def get_announcements_for_user():
    db = get_db()
    user_id = get_jwt_identity()
    user_object_id = ObjectId(user_id)
    user_projects = list(db.projects.find({
        "$or": [
            {"member_ids": user_object_id},
            {"manager_id": user_object_id}  # Include if user is manager
        ]
    }))
    project_ids = [project["_id"] for project in user_projects]

    # Get all announcements for these projects
    announcements = list(db.announcements.find({
        "project_id": {"$in": project_ids}
    })) 
    for announcement in announcements:
        announcement['_id'] = str(announcement['_id'])
        announcement['project_id'] = str(announcement['project_id'])
        announcement['created_by'] = str(announcement['created_by'])
        announcement['created_at'] = announcement['created_at'].isoformat()
        project = next((p for p in user_projects if str(p["_id"]) == announcement["project_id"]), None)
        if project:
            announcement['project_name'] = project.get('name', 'Unknown Project')
        else:
            announcement['project_name'] = 'Unknown Project'
    
    print(announcements)
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


@announcement_bp.route('/<announcement_id>', methods=['PUT'])
@jwt_required()
def update_announcement_route(announcement_id):
    data = request.get_json()
    updates = {
        "title" : data.get('title'),
        "content" : data.get('content'),
        "updated_at" : datetime.now(timezone.utc)
    }
    updates = {k : v for k,v in updates.items() if v is not None}
    results = update_announcement(announcement_id, updates)
    if results.matched_count == 0:
        return jsonify({'error': 'Announcement not found'}), 404
    return jsonify({"message" : "Announcement Updated."}), 200

@announcement_bp.route('/<announcement_id>', methods=['DELETE'])
@jwt_required()
def delete_announcement(announcement_id):
    db = get_db()
    db.announcements.delete_one({"_id" : ObjectId(announcement_id)})
    return jsonify({"message" : "Announcement deleted."})