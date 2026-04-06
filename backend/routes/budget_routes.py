from flask import Blueprint, request, jsonify
from models import db
from models.expense_model import Expense
from middleware.auth_middleware import auth_required
from controllers.budget_controller import get_budget_summary, add_expense

# Define the blueprint name exactly as app.py expects it
budget_bp = Blueprint('budget_bp', __name__)

@budget_bp.route('/summary', methods=['GET'])
@auth_required
def summary():
    result, status = get_budget_summary(request.user_id)
    return jsonify(result), status

@budget_bp.route('/add', methods=['POST','OPTIONS'])
@auth_required
def add():
    data = request.get_json()
    result, status = add_expense(request.user_id, data)
    return jsonify(result), status