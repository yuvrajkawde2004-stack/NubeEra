import uuid
from datetime import datetime

from app.extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)

    role = db.Column(db.String(50), default="Learner")

    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))

    profile_picture_url = db.Column(db.Text)

    is_active = db.Column(db.Boolean, default=True)

    last_login_at = db.Column(db.DateTime)

    external_provider = db.Column(db.String(50))
    external_id = db.Column(db.String(255))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
