from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.services.auth_service import AuthService

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    data = request.get_json()
    return AuthService.register(data)


@auth_bp.post("/login")
def login():
    data = request.get_json()
    return AuthService.login(data)


@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()

    return {
        "id": user_id
    }, 200
