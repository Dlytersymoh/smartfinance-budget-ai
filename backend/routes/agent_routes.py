from flask import Blueprint, request, jsonify
from middleware.auth_middleware import auth_required
from controllers.agent_controller import process_agent_query

agent_bp = Blueprint('agent_bp', __name__)

MAX_MESSAGE_LENGTH = 2000  #


@agent_bp.route('/chat', methods=['POST'])
@auth_required
def chat():

    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400 #if the datta is not not from the json the code will raise an errot

    user_message = data.get('message', '').strip()

    if not user_message:
        return jsonify({"error": "Message cannot be empty"}), 400

    if len(user_message) > MAX_MESSAGE_LENGTH:
        return jsonify({
            "error": f"Message too long. Only {MAX_MESSAGE_LENGTH} allowed."
        }), 400

    try:
        result, status = process_agent_query(request.user_id, user_message)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": "Agent processing failed", "detail": str(e)}), 500