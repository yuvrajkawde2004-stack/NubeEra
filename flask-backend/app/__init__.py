from flask import Flask, send_from_directory
from config import Config
from app.extensions import init_extensions, db


def create_app():
    app = Flask(
        __name__,
        static_folder="static",
        static_url_path=""
    )

    app.config.from_object(Config)

    # Initialize extensions
    init_extensions(app)

    # Import models
    from app.models.user import User
    from app.models.learner import Learner
    from app.models.trainer import Trainer

    # Create tables
    with app.app_context():
        db.create_all()

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(users_bp, url_prefix="/api/users")

    @app.route("/health")
    def health():
        return {"status": "healthy"}, 200

    @app.route("/")
    def serve_frontend():
        return send_from_directory(app.static_folder, "index.html")

    @app.route("/<path:path>")
    def serve_static(path):
        try:
            return send_from_directory(app.static_folder, path)
        except Exception:
            return send_from_directory(app.static_folder, "index.html")

    return app
