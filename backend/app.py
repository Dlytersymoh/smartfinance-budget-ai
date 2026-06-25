from flask import Flask, render_template, redirect, url_for, jsonify
from flask_cors import CORS
from models import db
from services.token_vault import vault
from routes.budget_routes import budget_bp
from routes.agent_routes import agent_bp
from routes.auth_routes import auth_bp
from config.auth_config import Auth0Config


def create_app():
    app = Flask(__name__)

    # Load config
    app.config.from_object(Auth0Config)

    # CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Database URI
    db_uri = app.config.get('SQLALCHEMY_DATABASE_URI') or vault.get_db_config()
    if not db_uri:
        raise RuntimeError(" No database URI found.")
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri

    # Init database
    db.init_app(app)
    with app.app_context():
        try:
            db.create_all()
            print("Database Tables Created Successfully!")
        except Exception as e:
            raise RuntimeError(f" Database Error: {e}")

    # Blueprints
    app.register_blueprint(budget_bp, url_prefix='/budget')
    app.register_blueprint(agent_bp, url_prefix='/agent')
    app.register_blueprint(auth_bp, url_prefix='/auth')

    # ─── Routes ───────────────────────────────────────────────────────────────

    @app.route('/favicon.ico')
    def favicon():
        return '', 204

    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/index.html')
    def index_html():
        return redirect(url_for('index'))

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')

    # ─── Error Handlers ───────────────────────────────────────────────────────

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'Not found'}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({'error': 'Internal server error'}), 500

    @app.errorhandler(403)
    def forbidden(e):
        return jsonify({'error': 'Forbidden'}), 403

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='127.0.0.1', port=5000, use_reloader=False)