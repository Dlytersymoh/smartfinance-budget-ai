from services.ai_agent import ai_agent_service


def process_agent_query(user_id: str, user_message: str):
    """
    Process a user message through the AI agent and return a reply.

    Args:
        user_id: The authenticated user's ID
        user_message: The message from the user

    Returns:
        Tuple of (response_dict, status_code)
    """
    try:
        # Build prompt — include user context for personalization
        prompt = (
            f"You are a personal finance assistant. "
            f"User ID: {user_id}. "
            f"User message: {user_message}"
        )

        reply_text = ai_agent_service.generate_response(prompt)

        if not reply_text or not reply_text.strip():
            return {"reply": "The AI agent returned an empty response. Please try again."}, 502

        return {"reply": reply_text.strip()}, 200

    except Exception as e:
        # Log internally but never expose raw error to client
        print(f"[agent_controller] ERROR for user {user_id}: {e}")
        return {"error": "The AI agent encountered an unexpected error. Please try again."}, 500