from .users import users_bp
from .announcements import announcement_bp
from .comments import comments_bp
from .projects import project_bp
from .tasks import tasks_bp
from .auth import auth_bp

def register_routes(app):
    app.register_blueprint(users_bp, url_prefix = '/users')
    app.register_blueprint(announcement_bp, url_prefix = '/announcement')
    app.register_blueprint(comments_bp, url_prefix = '/comments')
    app.register_blueprint(project_bp, url_prefix = '/project')
    app.register_blueprint(tasks_bp, url_prefix = '/tasks')
    app.register_blueprint(auth_bp, url_prefix='/auth')