
from flask import Flask
from flask_cors import CORS
from models import db
from services.token_vault import vault
from routes.budget_routes import budget_bp
from routes.agent_routes import agent_bp
#sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
# Import your fixed config class
from config.auth_config import Auth0Config 

def create_app():
    app = Flask(__name__)
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response@app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response
    
    # 1. Load configuration from your central config file
    app.config.from_object(Auth0Config)
    
    # 2. Setup CORS (Keeping your credentials support for Auth)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    
    # 3. Security Check: Use vault if needed, otherwise fallback to Config
    # If the vault is empty, it uses the SQLite path from Auth0Config
    if not app.config.get('SQLALCHEMY_DATABASE_URI'):
        app.config['SQLALCHEMY_DATABASE_URI'] = vault.get_db_config()
    
    # 4. Initialize Database
    db.init_app(app)

    # 5. Create tables (The 'With' block ensures it doesn't crash on startup)
    with app.app_context():
        try:
            db.create_all()
            print("✅ Database Tables Created Successfully!")
        except Exception as e:
            print(f"❌ Database Error: {e}")

    # 6. Register Blueprints (The 'Brains' of your routes)
    app.register_blueprint(budget_bp, url_prefix='/budget')
    app.register_blueprint(agent_bp, url_prefix='/agent')

    @app.route('/favicon.ico')
    def favicon():
        return '',204
    def index():
        return {
            "message": "Smart Finance API is Live",
            "status": "Online",
            "agent": "Gemini 1.5 Flash"
        }, 200

    return app

if __name__ == '__main__':
    app = create_app()
    # Running on local host for your dev environment
    app.run(debug=True, host='127.0.0.1', port=5000)