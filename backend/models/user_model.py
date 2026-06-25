from . import db
from datetime import datetime, timezone


class User(db.Model):
    __tablename__ = 'users'

    id           = db.Column(db.String(100), primary_key=True)  # UUID string
    email        = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name   = db.Column(db.String(100), nullable=False)
    last_name    = db.Column(db.String(100), nullable=False)
    is_active    = db.Column(db.Boolean, default=True)
    created_at   = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login   = db.Column(db.DateTime, nullable=True)

    # Relationships
    expenses = db.relationship('Expense', backref='user', lazy=True, cascade='all, delete-orphan')
    incomes  = db.relationship('Income',  backref='user', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<User {self.email}>'