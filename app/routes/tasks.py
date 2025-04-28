from datetime import datetime, timezone
from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.models import complete_task, convert_objectid_to_str, create_task, get_all_tasks, get_db, get_task, update_task

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
        assignee_id = user_id
    )
    return jsonify({
        'task_id' : task_id
        }), 201

@tasks_bp.route('/', methods=["GET"])
@jwt_required()
def get_all_tasks_route():
    tasks = get_all_tasks()
    return jsonify(tasks)

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
    })
    
@tasks_bp.route('/<task_id>', methods=['PUT'])
@jwt_required()
def update_task_route(task_id):
    data = request.get_json()
    updates = {
        "title" : data.get('title'),
        "description" : data.get('description'),
        "status" : data.get('status'),
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