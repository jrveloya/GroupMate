from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import convert_objectid_to_str, create_project, get_db, get_project, get_user_by_id, get_projects_by_manager_id, get_user_by_username

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

@project_bp.route('/completed/manager/<manager_id>', methods=['GET'])
@jwt_required()
def get_completed_projects_by_manger_route(manager_id):
    projects = get_projects_by_manager_id(manager_id)
    if not projects:
        return jsonify({
            "error": "Project not found."
        }), 404
    completed_projects = [project for project in projects if project.get("status") == "complete"]
    
    if not completed_projects:
        return jsonify({
            "message": "No completed projects found for this manager."
        }), 200
        
    completed_projects = convert_objectid_to_str(completed_projects)
    return jsonify(completed_projects)

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

@project_bp.route('/complete/<project_id>', methods=['PUT'])
@jwt_required()
def update_project_complete(project_id):
    db = get_db()
    data = request.get_json()
    
    # Update project status
    project_updates = {
        "status": data.get("status"),
        "updated_at": datetime.now(timezone.utc)
    }
    project_updates = {k: v for k, v in project_updates.items() if v is not None}
    
    # Update the project
    db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": project_updates})
    
    # Update all tasks associated with this project to complete
    task_updates = {
        "status": "complete",
        "updated_at": datetime.now(timezone.utc)
    }
    task_result = db.tasks.update_many(
        {"project_id": ObjectId(project_id)},
        {"$set": task_updates}
    )
    
    # Delete all announcements associated with this project
    announcement_result = db.announcements.delete_many({"project_id": ObjectId(project_id)})
    
    return jsonify({
        'message': 'Project Updated Successfully.',
        'tasks_updated': task_result.modified_count,
        'announcements_deleted': announcement_result.deleted_count
    })

@project_bp.route('/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    try:
        db = get_db()
        project_obj_id = ObjectId(project_id)
        
        # Delete the project
        project_result = db.projects.delete_one({"_id": project_obj_id})
        
        if project_result.deleted_count == 0:
            return jsonify({"message": "Project not found"}), 404
        
        # Delete all tasks associated with the project
        tasks_result = db.tasks.delete_many({"project_id": project_obj_id})
        
        # Delete all announcements associated with the project
        announcements_result = db.announcements.delete_many({"project_id": project_obj_id})
        
        return jsonify({
            "message": "Project deleted successfully",
            "deleted_tasks_count": tasks_result.deleted_count,
            "deleted_announcements_count": announcements_result.deleted_count
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@project_bp.route('/add-user/<project_id>', methods=['POST'])
@jwt_required()
def add_user_to_project_route(project_id):
    try:
        if not request.is_json:
            return jsonify({"error": "Missing JSON in request"}), 400
            
        data = request.get_json()
        
        if "username" not in data:
            return jsonify({"error": "Username is required"}), 400
            
        username = data["username"]
        db = get_db()
        
        user = get_user_by_username(username)
        
        # Check if user exists
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        user_id = user['_id']
        
        if isinstance(project_id, str):
            project_id = ObjectId(project_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        project = db.projects.find_one({"_id": project_id})
        if not project:
            return jsonify({"error": "Project not found"}), 404
            
        # Check if user is already a member
        if user_id in project.get('member_ids', []):
            return jsonify({"error": "User is already a member of this project"}), 409
        
        result = db.projects.update_one(
            {"_id": project_id},
            {
                "$addToSet": {"member_ids": user_id},
                "$set": {"updated_at": datetime.now(timezone.utc)}
            }
        )
        
        if result.modified_count > 0:
            return jsonify({"message": f"Added {username} to project successfully"}), 200
        else:
            return jsonify({"error": "Failed to add user to project"}), 400
                
    except Exception as e:
        # Log the exception for debugging
        print(f"Error adding user to project: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

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
