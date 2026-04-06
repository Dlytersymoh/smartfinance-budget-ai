import os
from google import genai 
from dotenv import load_dotenv
from services.token_vault import vault
#since the serve cant acces the .env directry.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, '.env')

load_dotenv(ENV_PATH)

class FinanceAgent:
    def __init__(self):
        #api_key ="AlzaSyC7e58YJyklx97ZypY_vLPfRnUI5TIKE"
        api_key=vault.get_api_key("gemini")
        #if not api_key:
           # raise ValueError("GEMINI_API_KEY not found in .env file")
        
        # i used genai instead of the old model which is ccconfigure().generative

        self.client = genai.Client(api_key=api_key)
        self.model_name = "gemini-1.5-flash"

    def generate_response(self, prompt):
        try:
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"AI Service Error: {e}")
            return "I'm having trouble processing that right now."


ai_agent_service = FinanceAgent() #these will help controller to import it without trouble