import uuid
from datetime import datetime

from app.extensions import db


class Learner(db.Model):
    __tablename__ = "learners"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    user_id = db.Column(db.String(36), db.ForeignKey("users.id"))

    learner_id = db.Column(db.String(50), unique=True, nullable=False)

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))

    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))

    address = db.Column(db.Text)

    profile_picture_url = db.Column(db.Text)

    is_active = db.Column(db.Boolean, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="learner_profile", uselist=False)
