import uuid
import os
from datetime import datetime, timezone, timedelta

import jwt
import bcrypt
from dotenv import load_dotenv

from models import db
from models.user_model import User

load_dotenv()

JWT_SECRET       = os.getenv("JWT_SECRET", "change-this-in-production")
JWT_ALGORITHM    = "HS256"
JWT_EXPIRY_HOURS = 24


# ─── Token Helpers ────────────────────────────────────────────────────────────

def _generate_token(user_id: str, email: str) -> str:
    """Generate a signed JWT token for the user."""
    payload = {
        "sub":   user_id,
        "email": email,
        "iat":   datetime.now(timezone.utc),
        "exp":   datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRY_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _verify_token(token: str) -> dict | None:
    """Decode and verify a JWT token. Returns payload dict or None."""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        print("[auth_controller] Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"[auth_controller] Invalid token: {e}")
        return None


# ─── Register ─────────────────────────────────────────────────────────────────

def register_user(data: dict):
    """
    Register a new user with email and password.
    Hashes password with bcrypt before storing.
    """
    email      = data.get("email", "").strip().lower()
    password   = data.get("password", "")
    first_name = data.get("firstName", "").strip()
    last_name  = data.get("lastName", "").strip()

    if not email or not password or not first_name or not last_name:
        return {"error": "All fields are required"}, 400

    if len(password) < 8:
        return {"error": "Password must be at least 8 characters"}, 400

    if "@" not in email or "." not in email:
        return {"error": "Invalid email address"}, 400

    try:
        existing = User.query.filter_by(email=email).first()
        if existing:
            return {"error": "An account with this email already exists"}, 409

        # Hash password with bcrypt
        password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        user = User(
            id            = str(uuid.uuid4()),
            email         = email,
            password_hash = password_hash,
            first_name    = first_name,
            last_name     = last_name,
        )
        db.session.add(user)
        db.session.commit()

        return {"message": "Account created successfully. Please login."}, 201

    except Exception as e:
        db.session.rollback()
        print(f"[auth_controller] Registration error: {e}")
        return {"error": "Registration failed. Please try again."}, 500


# ─── Login ────────────────────────────────────────────────────────────────────

def login_user(data: dict):
    """
    Authenticate user with email and password.
    Returns a signed JWT token on success.
    """
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return {"error": "Email and password are required"}, 400

    try:
        user = User.query.filter_by(email=email).first()

        # Constant-time comparison prevents timing attacks
        if not user or not bcrypt.checkpw(
            password.encode("utf-8"),
            user.password_hash.encode("utf-8")
        ):
            return {"error": "Invalid email or password"}, 401

        if not user.is_active:
            return {"error": "Account is disabled. Contact support."}, 403

        # Update last login
        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        token = _generate_token(user.id, user.email)

        return {
            "message": "Login successful",
            "token": token,
            "user": {
                "id":         user.id,
                "email":      user.email,
                "first_name": user.first_name,
                "last_name":  user.last_name,
            }
        }, 200

    except Exception as e:
        db.session.rollback()
        print(f"[auth_controller] Login error: {e}")
        return {"error": "Login failed. Please try again."}, 500


# ─── Logout ───────────────────────────────────────────────────────────────────

def logout_user(token: str):
    """
    Stateless JWT logout.
    For full blacklisting, store token in Redis with TTL = remaining expiry.
    """
    payload = _verify_token(token)
    if not payload:
        return {"error": "Invalid or expired token"}, 401

    # TODO: redis_client.setex(f"blacklist:{token}", JWT_EXPIRY_HOURS * 3600, "1")
    return {"message": "Logged out successfully"}, 200


# ─── Verify Token (called by auth middleware) ─────────────────────────────────

def verify_token(token: str) -> dict | None:
    """Public wrapper used by auth_middleware to validate incoming requests."""
    return _verify_token(token)