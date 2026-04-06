from datetime import datetime
from models.user_model import db

class Budget(db.Model):
    __tablename__ = 'budgets'

    id = db.Column(db.Integer, primary_key=True)
    
    # Link to the Auth0 User
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    
    # The name of the budget (e.g., "Monthly Limit", "Holiday Savings")
    name = db.Column(db.String(100), nullable=False)
    
    # The spending ceiling
    limit_amount = db.Column(db.Float, nullable=False)
    
    # Category-specific budget (optional, e.g., "Food only")
    category = db.Column(db.String(50), default="All")
    
    # Timeframe for the AI to track
    start_date = db.Column(db.DateTime, default=datetime.utcnow)
    end_date = db.Column(db.DateTime)
    
    # Current status for the dashboard
    is_active = db.Column(db.Boolean, default=True)

    def __repr__(self):
        return f'<Budget {self.name}: Max ${self.limit_amount}>'