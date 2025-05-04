from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import complete_task, convert_objectid_to_str, create_task, get_all_tasks, get_db, get_task, update_task, get_all_active_tasks_by_user, get_all_completed_tasks_by_user, get_project, get_all_active_tasks_by_project, get_user_by_id

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/', methods=['POST'])
@jwt_required()
def create_task_route():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    task_id = create_task(
        title=data['title'],
        description=data.get('description', ''),
        project_id=data['project_id'],
        assignee_id = user_id,
        assigned_to_id = data['assigned_to_id']
    )
    return jsonify({
        'task_id' : task_id
        }), 201

@tasks_bp.route('/', methods=["GET"])
@jwt_required()
def get_all_tasks_route():
    tasks = get_all_tasks()
    return jsonify(tasks), 200

@tasks_bp.route('/<task_id>', methods=["GET"])
@jwt_required()
def get_task_route(task_id):
    task = get_task(task_id)
    if not task:
        return jsonify({'error': 'Task not found.'}), 404

    task = convert_objectid_to_str(task)

    return jsonify(task)
    
# make sure to have an enum that says either 'complete','active', or 'archive' as a form in the page
@tasks_bp.route('/<task_id>/complete', methods=["POST"])
@jwt_required()
def complete_task_route(task_id):
    complete_task(task_id)
    return jsonify({
        'message' : f"Task {task_id} marked complete."
    }), 200
    
@tasks_bp.route('/<task_id>', methods=['PUT'])
@jwt_required()
def update_task_route(task_id):
    data = request.get_json()
    updates = {
        "title" : data.get('title'),
        "description" : data.get('description'),
        "status" : data.get('status'),
        "assigned_to": data.get('assigned_to_id'),
        "updated_at" : datetime.now(timezone.utc)
    }
    updates = {k : v for k,v in updates.items() if v is not None}
    results = update_task(task_id, updates)
    if results.matched_count == 0:
        return jsonify({'error': 'Task not found'}), 404
    return jsonify({"message" : "Task Updated."}), 200

@tasks_bp.route('/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    db = get_db()
    db.tasks.delete_one({"_id" : ObjectId(task_id)})
    return jsonify({"message" : "Task deleted."})

# create get_tasks through assignee_id 

#Gets all tasks assigned to the user
@tasks_bp.route('/me', methods=["GET"])
@jwt_required()
def get_all_active_tasks_by_user_route():
    user_id = get_jwt_identity()
    tasks = get_all_active_tasks_by_user(user_id)
    #Add the project name to the response
    for task in tasks:
        task['project'] = get_project(str(task['project_id']))['name']
    return jsonify(tasks), 200

#Get all completed tasks by the user
# create get_tasks through assignee_id 
@tasks_bp.route('/me/completed', methods=["GET"])
@jwt_required()
def get_all__completed_tasks_by_user_route():
    user_id = get_jwt_identity()
    tasks = get_all_completed_tasks_by_user(user_id)
    #Add the project name to the response
    for task in tasks:
        task['project'] = get_project(str(task['project_id']))['name']
    return jsonify(tasks), 200

#Gets all tasks assigned to a project
@tasks_bp.route('/project/<project_id>', methods=["GET"])
@jwt_required()
def get_all_active_tasks_by_project_route(project_id):
    tasks = get_all_active_tasks_by_project(project_id)
    #Add the assigned to name to the response
    for task in tasks:
        task['assigned_to_username'] = get_user_by_id(task['assigned_to'])["username"]
    return jsonify(tasks), 200