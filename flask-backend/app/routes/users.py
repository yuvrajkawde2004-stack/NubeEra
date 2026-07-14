from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.user_service import UserService

users_bp = Blueprint("users", __name__)


@users_bp.get("/profile")
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    return UserService.get_profile(user_id)


@users_bp.put("/profile")
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    data = request.get_json()
    return UserService.update_profile(user_id, data)


@users_bp.put("/change-password")
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    data = request.get_json()
    return UserService.change_password(user_id, data)
