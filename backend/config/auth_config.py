import os
from datetime import timedelta

class Auth0Config:
  
    
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'smart-finance-ai-dev-748'

   
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, '..', '..', 'smartfinance.db')
    
  
    SQLALCHEMY_TRACK_MODIFICATIONS = False

  
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)

  
    BACKEND_URL = "http://127.0.0.1:5000"