from functools import wraps
from flask import request, jsonify
from controllers.auth_controller import verify_token


def auth_required(f):
   
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({"error": "Authorization header missing or malformed"}), 401

        token = auth_header.split('Bearer ')[-1].strip()

        if not token:
            return jsonify({"error": "Token is required"}), 401

        payload = verify_token(token)

        if not payload:
            return jsonify({"error": "Invalid or expired token. Please login again."}), 401

      
        request.user_id = payload.get('sub')
        request.user_email = payload.get('email')

        return f(*args, **kwargs)

    return decorated