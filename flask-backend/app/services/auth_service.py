from flask_bcrypt import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token

from app.models.user import User
from app.repositories.user_repository import UserRepository


class AuthService:

    @staticmethod
    def register(data):

        email = data["email"].strip().lower()

        if UserRepository.get_by_email(email):
            return {"message": "User with this email already exists."}, 400

        user = User(
            email=email,
            password_hash=generate_password_hash(data["password"]).decode("utf-8"),
            role=data.get("role", "Learner"),
            first_name=data.get("first_name"),
            last_name=data.get("last_name")
        )

        UserRepository.create(user)

        return {
            "message": "Registration successful"
        }, 200

    @staticmethod
    def login(data):

        email = data["email"].strip().lower()

        user = UserRepository.get_by_email(email)

        if not user:
            return {"message": "Invalid credentials"}, 401

        if not check_password_hash(user.password_hash, data["password"]):
            return {"message": "Invalid credentials"}, 401

        token = create_access_token(
            identity=user.id,
            additional_claims={
                "email": user.email,
                "role": user.role
            }
        )

        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip(),
                "role": user.role,
                "utype": user.role.lower(),
             #   "phone": user.phone,
                "is_active": user.is_active
            }
        }, 200
