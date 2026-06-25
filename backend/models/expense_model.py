from . import db
from datetime import datetime, timezone


class Expense(db.Model):
    __tablename__ = 'expenses'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False, index=True)
    amount      = db.Column(db.Float, nullable=False)
    category    = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255), default='')
    date_spent  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def __repr__(self):
        return f'<Expense {self.category}: ${self.amount} | user={self.user_id}>'