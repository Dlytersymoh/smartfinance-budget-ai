import os
from datetime import timedelta

class Auth0Config:
    """
    Central Configuration for SmartFinance AI
    Location: backend/config/auth_config.py
    """
    
    # 1. SECURITY
    # This protects your session and JWT tokens
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart-finance-ai-dev-748'

    # 2. DATABASE PATH (Fixed for the new folder move)
    # Since this file is now in backend/config/, we go up TWO levels 
    # to put the database in the main project folder.
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, '..', '..', 'smartfinance.db')
    
    # Prevents Python from wasting 4GB RAM tracking every single change
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # 3. JWT & SESSION
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)

    # 4. API SETTINGS
    # Match this to your Flask run port (usually 5000)
    BACKEND_URL = "http://127.0.0.1:5000"