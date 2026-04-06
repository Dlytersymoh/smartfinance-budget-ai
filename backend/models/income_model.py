from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# We import db from the user_model or a central base file
from models.user_model import db

class Income(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Key linking this income to a specific User
    user_id = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False)
    
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(100), nullable=False)  # e.g., "Salary", "Freelance"
    category = db.Column(db.String(50), default="General")
    
    # Important for the AI to track trends over time
    date_received = db.Column(db.DateTime, default=datetime.utcnow)
    is_recurring = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Income {self.source}: ${self.amount}>'