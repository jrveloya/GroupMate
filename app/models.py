from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timezone
from flask import current_app
import uuid

def get_db():
    client = MongoClient('mongodb://localhost:27017/')
    return client['groupmate']

# helper function to converd ObjectId to str ( in order to return as JSON)
def convert_objectid_to_str(doc):
    if isinstance(doc, dict):
        return {k: convert_objectid_to_str(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [convert_objectid_to_str(i) for i in doc]
    elif isinstance(doc, ObjectId):
        return str(doc)
    elif isinstance(doc, datetime):
        return doc.isoformat()
    else:
        return doc
# ---------- USER CRUD METHODS ----------
"""
Creates a user and returns the inserted ID.
@params
    username : username of the user to be used for login.
    password_hash : the password of the user to be hashed
    role : the role of the user. Either member or manager
"""
def create_user(username, first_name, last_name, password_hash, role='member'):
    db = get_db()
    user = {
        'username' : username,
        'first_name' : first_name,
        'last_name' : last_name,
        'password_hash' : password_hash,
        'role' : role,
        'tasks_completed' : 0
    }
    return str(db.users.insert_one(user).inserted_id)

def get_user_by_id(user_id):
    db = get_db()
    return db.users.find_one({
        '_id' : ObjectId(user_id)
    })

def get_all_users():
    db = get_db()
    return list(db.users.find())

def delete_user(user_id):
    db=get_db()
    return db.users.delete_one(get_user_by_id(user_id))

def update_basic_user_information(user_id, updates):
    db = get_db()
    return db.users.update_one({'_id' : ObjectId(user_id)}, {'$set' : updates})


# ---------- PROJECT CRUD METHODS ----------

"""
Creates a project
This project only to be used by managers role users.
@param
    name : name of the project
    description : detailed description of the project
    manager_id : ID of the manager user that created the project 
"""
def create_project(name, description, manager_id):
    db = get_db()
    project = {
        'name': name,
        'description': description,
        'status': 'active',
        'announcements': [],
        'manager_id': ObjectId(manager_id),
        'member_ids': [ObjectId(manager_id)],
        'created_at': datetime.now(timezone.utc),
        'updated_at': datetime.now(timezone.utc)
    }
    result = db.projects.insert_one(project)
    return str(result.inserted_id)
"""
Retrieves the project
@param
    project_id : ID of the project to be retrieved.
"""
def get_project(project_id):
    db = get_db()
    return db.projects.find_one({
        "_id" : ObjectId(project_id)
    })


# ---------- TASK CRUD METHODS ----------

"""
This creates a task
@param
    title : the title of the task
    description : a detailed description of the task
    project_id : the ID of the project it is tied to
    asignee_id : the ID of the asignee the task is tied to
"""

def create_task(title, description, project_id, assignee_id=None, assigned_to_id=None):
    db = get_db()
    task = {
        'title' : title,
        'description' : description,
        'status' : 'active',
        'project_id' : ObjectId(project_id),
        'assignee_id' : ObjectId(assignee_id) if assignee_id else None,
        'assigned_to' : ObjectId(assigned_to_id) if assigned_to_id else None,
        'comments' : [],
        'created_at' : datetime.now(timezone.utc),
        'updated_at' : datetime.now(timezone.utc)
    }
    result = db.tasks.insert_one(task)
    return str(result.inserted_id)

"""
Sets the status of a task to 'compelete'
@param
    task_id : the ID of the task to be marked as complete
"""
def complete_task(task_id):
    db = get_db()
    db.tasks.update_one({'_id' : ObjectId(task_id)}, {"$set" : {
        "status" : "complete",
        "updated_at" : datetime.now(timezone.utc)}})

"""
This returns a list of all the tasks assigned to the project.
"""
def get_all_tasks():
    db = get_db()
    tasks = list(db.tasks.find())
    tasks = convert_objectid_to_str(tasks)
    return tasks

"""
This returns a list of all the tasks assigned to the user.
"""
def get_all_tasks_by_user(user_id):
    db = get_db()
    tasks = list(db.tasks.find({
        "assigned_to": ObjectId(user_id),
        "status": "active"
    }))
    tasks = convert_objectid_to_str(tasks)
    return tasks

"""
This grabs a singular task through the task ID 
"""
def get_task(task_id):
    db = get_db()
    return db.tasks.find_one({'_id' : ObjectId(task_id)})

"""
This updates a task based on the updates received
@param
    task_id : the unique ID for the task
    updates : a dictionary of updates correlating to the schema definition of a task
"""
def update_task(task_id, updates):
    db = get_db()
    return db.tasks.update_one({"_id" : ObjectId(task_id)}, {"$set" : updates})

"""
This finds a task through the asignee ID
@param
    user_id : this is the user_id that will be referenced. Will return a list of matches.
"""
def get_task_list_through_asignee_id(asignee_id):
    db = get_db()
    return list(db.tasks.find({"_id" : ObjectId(asignee_id)}))

# ----------COMMENT ----------

def create_task_comment(content, user_id, task_id, username):
    db = get_db()
    task_comment = {
        "user_id" : ObjectId(user_id),
        "username" : username,
        "content" : content,
        "task_id" : ObjectId(task_id),
        "created_at" : datetime.now(timezone.utc),
        "last_updated" : datetime.now(timezone.utc)
    }
    db.tasks.update_one({"_id":ObjectId(task_id)},
                        {"$push" : {"comments" : task_comment}})

def update_comment(comment_id, new_content):
    db = get_db()
    
    result = db.task.update_one(
        {"comment_id" : ObjectId(comment_id)},
        {"$set" : {
            "comment.$.content" : new_content,
            "comment.$.last_updated" : datetime.now(timezone.utc)
        }}
        )

# ---------- ANNOUNCEMENT ----------
"""
This creates an announcement
@param
    project_id : the project id where it will be announced at
    user_id : the id of the user that made the announcement
    content : the content to be announced to the project members
"""
def create_announcement(project_id, user_id, title, content):
    db = get_db()
    announcement = {
        'project_id' : ObjectId(project_id),
        'created_by' : ObjectId(user_id),
        'title' : title,
        'content' : content,
        'created_at' : datetime.now(timezone.utc)
    }
    result = db.announcements.insert_one(announcement)
    return str(result.inserted_id)