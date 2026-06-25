from flask import Blueprint, request, jsonify
from controllers.auth_controller import login_user, logout_user, register_user

auth_bp = Blueprint('auth_bp', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user with email and password."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    # Validate required fields before hitting controller
    required = ['firstName', 'lastName', 'email', 'password']
    missing  = [f for f in required if not data.get(f, '').strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    try:
        result, status_code = register_user(data)
        return jsonify(result), status_code
    except Exception as e:
        print(f"[auth_routes] Register error: {e}")
        return jsonify({"error": "Registration failed. Please try again."}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password. Returns a JWT token on success."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not email:
        return jsonify({"error": "Email is required"}), 400
    if not password:
        return jsonify({"error": "Password is required"}), 400

    try:
        result, status_code = login_user(data)
        return jsonify(result), status_code
    except Exception as e:
        print(f"[auth_routes] Login error: {e}")
        return jsonify({"error": "Login failed. Please try again."}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout — invalidates the token on the server side."""
    auth_header = request.headers.get('Authorization', '')

    if not auth_header.startswith('Bearer '):
        return jsonify({"error": "Missing or invalid Authorization header"}), 401

    token = auth_header.split('Bearer ')[-1].strip()
    if not token:
        return jsonify({"error": "Token is required"}), 401

    try:
        result, status_code = logout_user(token)
        return jsonify(result), status_code
    except Exception as e:
        print(f"[auth_routes] Logout error: {e}")
        return jsonify({"error": "Logout failed."}), 500