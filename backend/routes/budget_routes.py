from flask import Blueprint, request, jsonify
from middleware.auth_middleware import auth_required
from controllers.budget_controller import get_budget_summary, add_expense

budget_bp = Blueprint('budget_bp', __name__)

# Required fields for adding an expense
REQUIRED_EXPENSE_FIELDS = ['amount', 'category', 'description']


@budget_bp.route('/summary', methods=['GET'])
@auth_required
def summary():
    try:
        result, status = get_budget_summary(request.user_id)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": "Failed to fetch budget summary", "detail": str(e)}), 500


@budget_bp.route('/add', methods=['POST'])
@auth_required
def add():
    # Guard against malformed or missing JSON body
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Invalid or missing JSON body"}), 400

    # Validate required fields
    missing = [field for field in REQUIRED_EXPENSE_FIELDS if not data.get(field)]
    if missing:
        return jsonify({
            "error": f"Missing required fields: {', '.join(missing)}"
        }), 400

    # Validate amount is a positive number
    try:
        amount = float(data['amount'])
        if amount <= 0:
            raise ValueError
    except (ValueError, TypeError):
        return jsonify({"error": "Amount must be a positive number"}), 400

    # Sanitize string fields
    data['amount'] = amount
    data['category'] = str(data['category']).strip()
    data['description'] = str(data['description']).strip()

    if not data['category']:
        return jsonify({"error": "Category cannot be empty"}), 400
    if not data['description']:
        return jsonify({"error": "Description cannot be empty"}), 400

    try:
        result, status = add_expense(request.user_id, data)
        return jsonify(result), status
    except Exception as e:
        return jsonify({"error": "Failed to add expense", "detail": str(e)}), 500