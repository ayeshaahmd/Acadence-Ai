import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS
import mongoengine as db

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '..', '.env'))

from app.config import config

def create_app():
    """Application factory"""
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config)
    
    # Initialize extensions
    if 'host' in app.config.get('MONGODB_SETTINGS', {}):
        db.connect(host=app.config['MONGODB_SETTINGS']['host'])
    else:
        db.connect(**app.config.get('MONGODB_SETTINGS', {}))
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from app.routes import paper_routes, research_routes, citation_routes, copilot_routes
    app.register_blueprint(paper_routes.bp)
    app.register_blueprint(research_routes.bp)
    app.register_blueprint(citation_routes.bp)
    app.register_blueprint(copilot_routes.bp)
    
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'healthy', 'service': 'Research Paper Assistant'}, 200
    
    return app
