from flask import Blueprint, request, jsonify
from app.models import db, Tasks

tasks_bp = Blueprint('tasks', __name__)

STATUS = ['ACTIVE', 'COMPLETE', 'ARCHIVE']

@tasks_bp.route('/', methods=['POST'])
def create_task():
    data = request.json()
    new_task = Tasks(
        title = data['title'],
        description = data.get('description', ''),
        status = data.get('status','todo'),
        project_id = data['project_id'],
        assignee_id = data.get('assignee_id')
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify({
        'message': 'Task created',
        'task_id' : new_task.id
    }), 201
    
# make sure to have an enum that says either 'complete','active', or 'archive' as a form in the page
@tasks_bp.route('/<int:task_id>/complete', methods=["POST"])
def  complete_task(task_id):
    data=request.json()
    task = Tasks.query.get_or_404(task_id)
    task.status = data.get('status')
    # add more logic here later on -- if the whole project is completed, archive all tasks. OR after a certain time frame (maybe a week), archive all completed tasks
    db.session.commit()
    return jsonify({
        'message' : f"Task {task_id} marked {task.status}"
    })