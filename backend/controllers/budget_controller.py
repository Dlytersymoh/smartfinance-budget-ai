from models import db
from models.expense_model import Expense
from models.income_model import Income
from sqlalchemy import func


def get_budget_summary(user_id: str):
    """
    Calculate real budget summary from the database for a given user.
    Queries actual income and expense records instead of mock data.
    """
    try:
        # Sum all income for this user
        total_income = db.session.query(
            func.sum(Income.amount)
        ).filter(Income.user_id == user_id).scalar() or 0.0

        # Sum all expenses for this user
        total_expenses = db.session.query(
            func.sum(Expense.amount)
        ).filter(Expense.user_id == user_id).scalar() or 0.0

        # Break down expenses by category
        expense_breakdown = db.session.query(
            Expense.category,
            func.sum(Expense.amount).label('total')
        ).filter(
            Expense.user_id == user_id
        ).group_by(Expense.category).all()

        # Break down income by source
        income_breakdown = db.session.query(
            Income.source,
            func.sum(Income.amount).label('total')
        ).filter(
            Income.user_id == user_id
        ).group_by(Income.source).all()

        return {
            "total_income": round(total_income, 2),
            "total_expenses": round(total_expenses, 2),
            "remaining_balance": round(total_income - total_expenses, 2),
            "expense_breakdown": [
                {"category": row.category, "total": round(row.total, 2)}
                for row in expense_breakdown
            ],
            "income_breakdown": [
                {"source": row.source, "total": round(row.total, 2)}
                for row in income_breakdown
            ],
        }, 200

    except Exception as e:
        print(f"[budget_controller] Error fetching summary for user {user_id}: {e}")
        return {"error": "Failed to fetch budget summary"}, 500


def add_expense(user_id: str, data: dict):
    """
    Add a new expense record to the database for a given user.
    Data is pre-validated by the route before reaching here.
    """
    try:
        new_expense = Expense(
            user_id=user_id,
            amount=data['amount'],
            category=data['category'],
            description=data.get('description', '')
        )
        db.session.add(new_expense)
        db.session.commit()

        return {
            "message": "Expense added successfully",
            "expense": {
                "id": new_expense.id,
                "amount": new_expense.amount,
                "category": new_expense.category,
                "description": new_expense.description,
                "date_spent": new_expense.date_spent.isoformat(),
            }
        }, 201

    except Exception as e:
        db.session.rollback()
        print(f"[budget_controller] Error adding expense for user {user_id}: {e}")
        return {"error": "Failed to add expense. Please try again."}, 500


def add_income(user_id: str, data: dict):
    """
    Add a new income record to the database for a given user.
    """
    try:
        new_income = Income(
            user_id=user_id,
            amount=data['amount'],
            source=data['source'],
            category=data.get('category', 'General'),
            is_recurring=data.get('is_recurring', False)
        )
        db.session.add(new_income)
        db.session.commit()

        return {
            "message": "Income added successfully",
            "income": {
                "id": new_income.id,
                "amount": new_income.amount,
                "source": new_income.source,
                "category": new_income.category,
                "is_recurring": new_income.is_recurring,
                "date_received": new_income.date_received.isoformat(),
            }
        }, 201

    except Exception as e:
        db.session.rollback()
        print(f"[budget_controller] Error adding income for user {user_id}: {e}")
        return {"error": "Failed to add income. Please try again."}, 500