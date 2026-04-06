from flask import Blueprint, request, jsonify
from middleware.auth_middleware import auth_required #for security purpose
from controllers.agent_controller import process_agent_query 

agent_bp = Blueprint('agent_bp', __name__)

@agent_bp.route('/chat', methods=['POST'])
@auth_required

def chat():
    data = request.get_json()
    user_message=data.get('message')

    if not user_message:
        return jsonify({"reply": "Empty message received"}),400 #kuna shida mahali

    result, status = process_agent_query(request.user_id, user_message)
    return jsonify(result), status