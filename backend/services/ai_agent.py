import os
from google import  genai
from dotenv import load_dotenv
from services.token_vault import vault
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, '.env')
load_dotenv(ENV_PATH)


class FinanceAgent:
    def __init__(self):
        api_key = vault.get_api_key("gemini")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY not found. Check vault.get_api_key('gemini') or your .env file."
            )

        self.client = genai.Client(api_key=api_key)
        #self.model_name = genai.GenerativeModel("gemini-1.5-flash")
        self.model_name = "models/gemini-1.5-flash"

    def generate_response(self, prompt: str) -> str:
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text

        except Exception as e:
            
            print(f"[ai_agent] Gemini API Error: {e}")
            return ""  


ai_agent_service = FinanceAgent()