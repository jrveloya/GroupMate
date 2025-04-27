import datetime
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import create_project, get_db, get_project

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['POST'])
@jwt_required()
def create_project_route():
    data = request.get_json()
    user = get_jwt_identity()
    if user['role'] != 'manager':
        return jsonify({'error' : 'Only managers can create projects.'}), 403
    project_id = create_project(
        name=data['name'],
        description=data.get('description', ''),
        manager_id = user['id']
    )
    return jsonify(
        {
            'message':'Project created.',
            'project_id' : project_id
        }
    ), 201

@project_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project_route(project_id):
    project = get_project(project_id)
    if not project:
        return jsonify({
            "error" : "Project not found."
        }), 404
    return jsonify(project)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def list_projects():
    db = get_db()
    projects = list(db.projects.find())
    for p in projects:
        p['_id'] = str(p["_id"])
    return jsonify(projects)

@project_bp.route('/<project_id>', methods=['PUT'])
@jwt_required
def update_project(project_id):
    db = get_db()
    data = request.get_json()
    updates = {
        "name" : data.get("name"),
        "description" : data.get("description"),
        "status" : data.get("status"),
        "updated_at" : datetime.now(datetime.UTC)
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