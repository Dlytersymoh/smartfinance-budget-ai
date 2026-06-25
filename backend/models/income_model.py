from . import db
from datetime import datetime, timezone


class Income(db.Model):
    __tablename__ = 'incomes'

    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.String(100), db.ForeignKey('users.id'), nullable=False, index=True)
    amount         = db.Column(db.Float, nullable=False)
    source         = db.Column(db.String(100), nullable=False)
    category       = db.Column(db.String(50), default='General')
    date_received  = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    is_recurring   = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Income {self.source}: ${self.amount} | user={self.user_id}>'