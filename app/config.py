import os
from dotenv import load_dotenv
load_dotenv(override=True)
from datetime import timedelta

class Config:
    """Base configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    MONGODB_URI = os.getenv('MONGODB_URI')
    MONGODB_SETTINGS = {
        'host': MONGODB_URI
    } if MONGODB_URI else {
        'db': 'acadence_test',
        'host': 'mongomock://localhost'
    }    
    # LLM Configuration
    GENERATOR_LLM_PROVIDER = os.getenv('GENERATOR_LLM_PROVIDER', 'openai')
    SCIBOT_LLM_PROVIDER = os.getenv('SCIBOT_LLM_PROVIDER', 'openai')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
    
    # Research Configuration
    RESEARCH_SOURCES = ['google_scholar', 'arxiv', 'web_search', 'semantic_scholar']
    MAX_RESEARCH_RESULTS = 50
    RESEARCH_TIMEOUT = 300  # 5 minutes
    
    # Paper Generation Configuration
    DEFAULT_WORD_COUNT = 8000
    MAX_WORD_COUNT = 10000
    MIN_WORD_COUNT = 5000
    PAPER_STRUCTURE = {
        'abstract': 200,
        'introduction': 1000,
        'literature_review': 2500,
        'methodology': 1500,
        'results': 1500,
        'discussion': 1200,
        'conclusion': 800,
        'references': 300
    }
    
    # Citation Formats
    CITATION_FORMATS = ['APA', 'Chicago', 'Harvard', 'IEEE', 'MLA', 'AMA']
    DEFAULT_CITATION_FORMAT = 'APA'
    
    # API Keys
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    GOOGLE_SEARCH_ENGINE_ID = os.getenv('GOOGLE_SEARCH_ENGINE_ID')
    NEWSAPI_KEY = os.getenv('NEWSAPI_KEY')
    SEMANTIC_SCHOLAR_API_KEY = os.getenv('SEMANTIC_SCHOLAR_API_KEY')
    
    # Session Configuration
    PERMANENT_SESSION_LIFETIME = timedelta(days=7)
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False
    SESSION_COOKIE_SECURE = False

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True

class TestingConfig(Config):
    """Testing configuration"""
    TESTING = True
    MONGODB_SETTINGS = {
        'db': 'acadence_test',
        'host': 'mongomock://localhost'
    }


# Select configuration based on environment
environment = os.getenv('FLASK_ENV', 'development')
if environment == 'production':
    config = ProductionConfig
elif environment == 'testing':
    config = TestingConfig
else:
    config = DevelopmentConfig
