
import os
from dotenv import load_dotenv

load_dotenv()

class TokenVault:
  
    def __init__(self):
        
        self._gemini_key = "AIzaSyCPjhxMkWcjW_BvkkhWMJcedq4R52UbOho"
        self._db_uri = os.getenv("DATABASE_URL", "sqlite:///smart_finance.db")

    def get_api_key(self, service_name):
       # return self._gemini_key 
        if service_name == "gemini":
            return self._gemini_key 
        else:
            return None
            

    def get_db_config(self):
        return self._db_uri

vault = TokenVault()