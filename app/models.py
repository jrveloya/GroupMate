from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash, generate_password_hash

db = SQLAlchemy()

# created an association table for many-to-many relationships 
user_team = db.Table('user_team',
                     db.Column('user_id', db.Integer, db.Foreignkey('user.id'), primary_key=True),
                     db.Column('team_id', db.Integer, db.Foreignkey('team.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash= db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    tasks_completed = db.Column(db.Integer, default=0) # do we want to store a list? or only the amount of tasks completed?

class Project(db.Model):
    __tablename__ = 'project'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='active') # we should decide on what the status should be. For now, I will leave it as 'active','completed','archived'
    manager_id = db.Column(db.Integer, db.Foreignkey('user_id'), nullable=False)
    created_date = db.Column(db.DateTime, default=datetime.now)
    updated_date = db.Column(db.DateTime, default=datetime.now)
    
class Tasks(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='active')
    created_date = db.Column(db.DateTime, default=datetime.now)
    updated_date = db.Column(db.DateTime, default=datetime.now)
    
    project_id = db.Column(db.Integer, db.Foreignkey('project.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.Foreignkey('user.id'), nullable=False)
    
    comments = db.relationship('Comment', backref='task', lazy=True)
    
class Team(db.Model):
    __tablename__ = 'team'
    
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(128), nullable=False)
    
    members = db.relationship('User', secondary=user_team, back_populates = 'teams')
    manager_id = db.Column(db.Integer, db.Foreignkey('user.id'), nullable=False)
    manager = db.relationship('User', foreign_keys=[manager_id], backref='managed_teams')
    
    project_id = db.Column(db.Integer, db.Foreignkey('project.id'), nullable=False)
    project = db.relationship('Project', backref='teams')

class Comment(db.Model):
    __tablename__ = 'comment'
    
    id = db.Column(db.Integer, primary_key = True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Datetime, default=datetime.now(datetime.UTC))
    
    user_id = db.Column(db.Integer, db.Foreignkey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.Foreignkey('task.id'), nullable=False)
    
class Announcement(db.Model):
    __tablename__ = 'announcement'
    
    id = db.Column(db.Integer, primary_key = True)
    title = db.Column(db.String(128), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.Datetime, default=datetime.now(datetime.UTC))
    
    project_id = db.Column(db.Integer, db.Foreignkey('project.id'), nullable = False)