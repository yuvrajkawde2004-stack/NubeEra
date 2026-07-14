import os

class Config:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "Veriton_f8A9C4D27E1B6F5A90D3C2E8B7A6419D5E0F4C8B2A7D9E1364CFA90B8D71E52"
    )

    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "mysql+pymysql://root:root123@localhost:3306/veriton_db"
    )

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = os.getenv(
        "JWT_SECRET_KEY",
        "Veriton_f8A9C4D27E1B6F5A90D3C2E8B7A6419D5E0F4C8B2A7D9E1364CFA90B8D71E52"
    )

    JWT_ISSUER = "Veriton"
    JWT_AUDIENCE = "VeritonUsers"

    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

    GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
    GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

    LINKEDIN_CLIENT_ID = os.getenv("LINKEDIN_CLIENT_ID")
    LINKEDIN_CLIENT_SECRET = os.getenv("LINKEDIN_CLIENT_SECRET")

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )
