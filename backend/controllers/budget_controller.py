#from the models folder we import the sql info
from models import db
#rom the models folder we import the expense model
from models.expense_model import Expense
#i dont know this
from sqlalchemy import func
#this is a function that calculates the remaining balance of a user
#it takes the user ID and checks the income and expenses subtract and show remainer
def get_budget_summary(user_id):
    # In a real app, you would sum real DB entries here
    # For now, we return calculated mock data
    total_income = 5000.0
    total_expenses = 1250.0
    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "remaining_balance": total_income - total_expenses
    }, 200

def add_expense(user_id, data):
    try:
        new_exp = Expense(
            user_id=user_id,
            amount=data['amount'],
            category=data['category'],
            description=data.get('description', '')
        )
        db.session.add(new_exp)
        db.session.commit()
        return {"message": "Expense added!"}, 201
    except Exception as e:
        return {"error": str(e)}, 400