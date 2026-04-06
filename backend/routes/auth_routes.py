from flask import Blueprint, request, jsonify

from controllers.auth_controller import login_user

auth_bp = Blueprint('auth_bp', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    token = data.get('token')
    
    
    result, status_code = login_user(token)
    return jsonify(result), status_code