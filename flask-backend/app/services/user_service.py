from flask import jsonify
from flask_bcrypt import check_password_hash, generate_password_hash

from app.models.user import User
from app.models.learner import Learner
from app.models.trainer import Trainer
from app.repositories.user_repository import UserRepository
from app.extensions import db


class UserService:

    @staticmethod
    def get_profile(user_id):

        user = UserRepository.get_by_id(user_id)

        if not user:
            return {"message": "User not found"}, 404

        learner = Learner.query.filter_by(user_id=user.id).first()
        trainer = Trainer.query.filter_by(user_id=user.id).first()

        return {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip(),
            "role": user.role,
            "utype": user.role.lower(),
            "phone": user.phone,
            "profile_picture_url": user.profile_picture_url,
            "is_active": user.is_active,
            "learner_details": {
                "gender": learner.gender if learner else None,
                "learner_id": learner.learner_id if learner else None
            } if learner else None,
            "trainer_details": {
                "gender": trainer.gender if trainer else None,
                "qualification": trainer.qualification if trainer else None
            } if trainer else None
        }, 200

    @staticmethod
    def update_profile(user_id, data):

        user = UserRepository.get_by_id(user_id)

        if not user:
            return {"message": "User not found"}, 404

        user.first_name = data.get("first_name")
        user.last_name = data.get("last_name")
        user.phone = data.get("phone")
        user.profile_picture_url = data.get("profile_picture_url")

        learner = Learner.query.filter_by(user_id=user.id).first()

        if learner:
            learner.first_name = data.get("first_name") or learner.first_name
            learner.last_name = data.get("last_name") or learner.last_name
            learner.phone = data.get("phone")
            learner.gender = data.get("gender")

        trainer = Trainer.query.filter_by(user_id=user.id).first()

        if trainer:
            trainer.first_name = data.get("first_name") or trainer.first_name
            trainer.last_name = data.get("last_name") or trainer.last_name
            trainer.phone = data.get("phone")
            trainer.gender = data.get("gender")
            trainer.qualification = data.get("qualification")

        db.session.commit()

        return {"message": "Profile updated successfully"}, 200

    @staticmethod
    def change_password(user_id, data):

        user = UserRepository.get_by_id(user_id)

        if not user:
            return {"message": "User not found"}, 404

        if not check_password_hash(
            user.password_hash,
            data["current_password"]
        ):
            return {"message": "Current password is incorrect"}, 400

        user.password_hash = generate_password_hash(
            data["new_password"]
        ).decode("utf-8")

        db.session.commit()

        return {"message": "Password updated successfully"}, 200
