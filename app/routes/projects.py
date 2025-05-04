from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import convert_objectid_to_str, create_project, get_db, get_project, get_user_by_id, get_projects_by_manager_id, add_user_to_project

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['POST'])
@jwt_required()
def create_project_route():
    data = request.get_json()
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    
    if user['role'] != 'manager':
        return jsonify({'error' : 'Only managers can create projects.'}), 403
    project_id = create_project(
        name=data['name'],
        description=data.get('description', ''),
        manager_id = user_id
    )
    return jsonify(
        {
            'message':'Project created.',
            'project_id' : project_id
        }
    ), 201

@project_bp.route('/<project_id>', methods=['GET'])
@jwt_required()
def get_project_route(project_id):
    project = get_project(project_id)
    if not project:
        return jsonify({
            "error": "Project not found."
        }), 404
    project["members"] = []
    for member in project["member_ids"]:
        name = get_user_by_id(member)["username"]
        project["members"].append({"member_id": str(member), "username": name}) #Attach the usernames to each member
    project = convert_objectid_to_str(project)
    return jsonify(project)

@project_bp.route('/manager/<manager_id>', methods=['GET'])
@jwt_required()
def get_project_by_manger_route(manager_id):
    project = get_projects_by_manager_id(manager_id)
    if not project:
        return jsonify({
            "error": "Project not found."
        }), 404
    project = convert_objectid_to_str(project)
    return jsonify(project)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def list_projects():
    db = get_db()
    projects = list(db.projects.find())
    
    projects = convert_objectid_to_str(projects)

    return jsonify(projects)

@project_bp.route('/<project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    db = get_db()
    data = request.get_json()
    updates = {
        "name" : data.get("name"),
        "description" : data.get("description"),
        "status" : data.get("status"),
        "updated_at" : datetime.now(timezone.utc)
    }
    updates = {k : v for k, v in updates.items() if v is not None}
    db.projects.update_one({"_id" : ObjectId(project_id)}, {"$set" : updates})
    return jsonify({'message' : 'Project Updated Successfully.'})

@project_bp.route('/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    db = get_db()
    db.projects.delete_one({"_id" : ObjectId(project_id)})
    return jsonify({"message" : "Project Deleted"})


@project_bp.route('/add-user/<project_id>', methods=['POST'])
@jwt_required()
def add_user_to_project_route(project_id):
    data = request.get_json()
    username = data["username"]
    add_user_to_project(username, project_id)

    return jsonify({"message" : "Added " + username})

@project_bp.route('/user/<project_id>', methods=['DELETE'])
@jwt_required()
def remove_user_from_project_route(project_id):
    db = get_db()
    current_user_id = get_jwt_identity()
    request_data = request.get_json()
    if not request_data or 'user_id' not in request_data:
        return jsonify({"error": "Missing user_id in request body"}), 400
    
    user_id_to_remove = request_data['user_id']
    project = db.projects.find_one({"_id": ObjectId(project_id)})
    if not project:
        return jsonify({"error": "Project not found"}), 404
    
    # Check if the current user is the project owner or has permission to modify members
    if str(project.get('manager_id')) != current_user_id:
        return jsonify({"error": "Not authorized to modify this project"}), 403
    
    if 'member_ids' not in project or ObjectId(user_id_to_remove) not in project['member_ids']:
        return jsonify({"message": "User is not a member of this project"}), 400
    
    result = db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$pull": {"member_ids": ObjectId(user_id_to_remove)}}
    )
    if result.modified_count > 0:
            return jsonify({"message": "User successfully removed from project"}), 200
    else:
        return jsonify({"message": "Failed to remove user from project"}), 500
