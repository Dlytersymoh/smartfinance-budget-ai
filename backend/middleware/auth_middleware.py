from flask import request, jsonify
from functools import wraps

def auth_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Authorization token is missing!'}), 401
        
        # Mocking Auth0 extraction for the hackathon
        request.user_id = "auth0|mock_user_123"
        return func(*args, **kwargs)
    return decorated