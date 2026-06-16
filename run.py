import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

from app import create_app
from app.config import config

if __name__ == '__main__':
    app = create_app()
    
    # Set Flask environment
    os.environ['FLASK_ENV'] = os.getenv('FLASK_ENV', 'development')
    os.environ['FLASK_DEBUG'] = '1' if os.environ['FLASK_ENV'] == 'development' else '0'
    
    # Run development server
    debug = os.environ['FLASK_ENV'] == 'development'
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=debug,
        use_reloader=debug
    )
