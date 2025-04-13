from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime
from flask import current_app
import uuid

def get_db():
    client = MongoClient('mongodb://localhost:27017/')
    return client['groupmate']


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
        'name' : name,
        'description' : description,
        'status' : 'active',
        'manager_id' : ObjectId(manager_id),
        'created_at' : datetime.now(datetime.UTC),
        'updated_at' : datetime.now(datetime.UTC)
    }
    return str(db.project.insert_one(project).inserted_id)
"""
Retrieves the project
@param
    project_id : ID of the project to be retrieved.
"""
def get_project(project_id):
    db = get_db()
    return db.project.find_one({
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

def create_task(title, description, project_id, asignee_id=None):
    db = get_db()
    task = {
        'title' : title,
        'description' : description,
        'status' : 'active',
        'project_id' : ObjectId(project_id),
        'asignee_id' : ObjectId(asignee_id),
        'comments' : [],
        'created_at' : datetime.now(datetime.UTC),
        'updated_at' : datetime.now(datetime.UTC)
    }
    return str(db.tasks.insert_one(task).inserted_id)

"""
Sets the status of a task to 'compelete'
@param
    task_id : the ID of the task to be marked as complete
"""
def complete_task(task_id):
    db = get_db()
    db.tasks.update_one({'_id' : ObjectId(task_id)}, {"$set" : {
        "status" : "complete",
        "updated_at" : datetime.now(datetime.UTC)}})

"""
This returns a list of all the tasks assigned to the project.
"""
def get_all_tasks():
    db = get_db()
    tasks = list(db.tasks.find())
    for task in tasks:
        task['_id'] = str(task['_id'])
        if task.get('project_id'):
            task['project_id'] = str(task['project_id'])
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

def create_task_comment(content, user_id, task_id):
    db = get_db()
    task_comment = {
        "user_id" : ObjectId(user_id),
        "content" : content,
        "task_id" : ObjectId(task_id)
    }
    db.tasks.update_one({"_id":ObjectId(task_id)},
                        {"$push" : {"comments" : task_comment}})

# ---------- ANNOUNCEMENT ----------
"""
This creates an announcement
@param
    project_id : the project id where it will be announced at
    user_id : the id of the user that made the announcement
    content : the content to be announced to the project members
"""
def create_announcement(project_id, user_id, content):
    db = get_db()
    announcement = {
        'project_id' : ObjectId(project_id),
        'user_id' : ObjectId(user_id),
        'content' : content
    }
    return str(db.announcements.insert_one(announcement).inserted_id)