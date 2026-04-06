from flask import jsonify
import os
from dotenv import load_dotenv

from services.ai_agent import ai_agent_service


load_dotenv(os.path.join(os.getcwd(), '.env'))

def process_agent_query(user_id, user_message):
    try:
    
      
        if not reply_text:
            return {"reply":"The AI agent returned an emmpty responce"}
        
        return {"reply": reply_text}, 200

    except Exception as e:
        print(f"CRASH ERROR in Controller: {e}")
        return {"reply": f"AI Error: {str(e)}"}, 500