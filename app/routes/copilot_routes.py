import logging
from flask import Blueprint, request, jsonify
from app.models import ResearchPaper
from openai import OpenAI
from app.config import config

logger = logging.getLogger(__name__)

bp = Blueprint('copilot', __name__, url_prefix='/api/scibot')

# Client initialized dynamically per request

@bp.route('/chat', methods=['POST'])
def scibot_chat():
    try:
        data = request.get_json()
        paper_id = data.get('paper_id')
        user_message = data.get('message')
        chat_history = data.get('history', [])

        if not paper_id or not user_message:
            return jsonify({'error': 'Paper ID and message are required'}), 400

        paper = ResearchPaper.objects(id=paper_id).first()
        if not paper:
            return jsonify({'error': 'Paper not found'}), 404

        # Context injection: Give SciBot the full paper context
        system_prompt = f"""You are SciBot, an advanced AI Research Copilot.
You are assisting the user with their research paper titled "{paper.title}".
Paper Context: "{paper.topic}"
Domain: {paper.domain}
Complexity: {paper.complexity_level}

Current Paper Abstract:
{paper.abstract}

Your goal is to help the user rewrite, expand, critique, or analyze sections of this paper.
Keep your responses academic, precise, and helpful. Use markdown formatting when providing code or structured text.
If the user asks about the paper, use the context provided.
"""

        messages = [{"role": "system", "content": system_prompt}]
        
        # Append history
        for msg in chat_history[-5:]: # Keep last 5 turns to save tokens
            messages.append({"role": msg['role'], "content": msg['content']})
            
        messages.append({"role": "user", "content": user_message})

        if config.SCIBOT_LLM_PROVIDER == 'openai' and config.OPENAI_API_KEY:
            client = OpenAI(api_key=config.OPENAI_API_KEY)
        elif config.SCIBOT_LLM_PROVIDER == 'gemini' and config.GEMINI_API_KEY:
            client = OpenAI(
                api_key=config.GEMINI_API_KEY,
                base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
            )
        elif config.SCIBOT_LLM_PROVIDER == 'openrouter' and config.OPENROUTER_API_KEY:
            client = OpenAI(
                api_key=config.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1"
            )
        else:
            client = None

        if client:
            try:
                # Call LLM using 1.x syntax
                if config.SCIBOT_LLM_PROVIDER == 'gemini':
                    model_name = "gemini-1.5-flash-latest"
                elif config.SCIBOT_LLM_PROVIDER == 'openrouter':
                    model_name = "anthropic/claude-3-haiku"
                else:
                    model_name = "gpt-3.5-turbo"
                    
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=1000
                )
                bot_reply = response.choices[0].message.content
            except Exception as api_err:
                logger.error(f"SciBot API Error: {api_err}")
                bot_reply = f"I am SciBot. The {config.SCIBOT_LLM_PROVIDER.upper()} API key configured in the backend has failed. Please check your credits!"
        else:
            # Fallback if no API key
            bot_reply = "I am SciBot (Simulation Mode). To generate real analytical insights, please configure an active API Key."

        return jsonify({
            'success': True,
            'reply': bot_reply
        }), 200

    except Exception as e:
        logger.error(f"SciBot Chat Error: {e}", exc_info=True)
        return jsonify({'error': 'Failed to process chat request', 'details': str(e)}), 500
