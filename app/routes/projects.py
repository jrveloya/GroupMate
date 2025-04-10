from flask import Blueprint, request, jsonify
from app.models import db, Project

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['POST'])
def create_project():
    data = request.json()
    new_project = Project(
        name=data['name'],
        description=data.get('description',''),
        manager_id = data['manager_id']
    )
    db.session.add(new_project)
    db.session.commit*()
    return jsonify(
        {
            'message':'Project created.',
            'project_id' : new_project.id
        }
    ), 201

@project_bp.route('/<int:project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id)
    return jsonify(
        {
            'id': project_id,
            'name' : project.name,
            'description' : project.description,
            'status' : project.status
        }
    )