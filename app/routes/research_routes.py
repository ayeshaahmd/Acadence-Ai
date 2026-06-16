from flask import Blueprint, request, jsonify
from app.services.research_collector import ResearchCollector
from app.config import config
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('research', __name__, url_prefix='/api/research')
collector = ResearchCollector(config)

@bp.route('/collect', methods=['POST'])
def collect_research():
    """Collect research data for a topic"""
    try:
        data = request.get_json()
        
        if not data or 'topic' not in data:
            return jsonify({'error': 'Topic is required'}), 400
        
        topic = data.get('topic')
        max_results = int(data.get('max_results', config.MAX_RESEARCH_RESULTS))
        max_results = min(max_results, config.MAX_RESEARCH_RESULTS)
        
        # Collect sources
        sources = collector.collect(topic, max_results)
        
        if not sources:
            return jsonify({
                'success': True,
                'data': [],
                'count': 0,
                'message': 'No sources found for this topic'
            }), 200
        
        return jsonify({
            'success': True,
            'data': sources[:20],  # Return top 20
            'count': len(sources),
            'available': len(sources),
            'topic': topic
        }), 200
    
    except Exception as e:
        logger.error(f"Research collection error: {e}")
        return jsonify({'error': 'Failed to collect research', 'details': str(e)}), 500

@bp.route('/sources/validate', methods=['POST'])
def validate_sources():
    """Validate and rank sources for relevance"""
    try:
        data = request.get_json()
        sources = data.get('sources', [])
        topic = data.get('topic', '')
        
        if not sources:
            return jsonify({'error': 'No sources provided'}), 400
        
        # Rank sources
        ranked = collector._rank_sources(topic, sources)
        
        return jsonify({
            'success': True,
            'data': ranked,
            'count': len(ranked)
        }), 200
    
    except Exception as e:
        logger.error(f"Source validation error: {e}")
        return jsonify({'error': 'Failed to validate sources'}), 500
