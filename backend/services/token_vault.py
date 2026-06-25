
import os
from dotenv import load_dotenv

load_dotenv()

class TokenVault:
  
    def __init__(self):
        
        self._gemini_key = os.getenv("GEMINI_API_KEY", "AIzaSyC1jOSJ8ZDcSLLze5AZqLTY2J3AEq4F0pk")
        self._db_uri = os.getenv("DATABASE_URL", "sqlite:///smart_finance.db")

    def get_api_key(self, service_name):
       
        if service_name == "gemini":

            return self._gemini_key 
        else:
            return None
            

    def get_db_config(self):
        return self._db_uri

vault = TokenVault()