from flask import Blueprint, request, jsonify
from app.services.citation_formatter import CitationFormatter
from app.config import config
import logging

logger = logging.getLogger(__name__)

bp = Blueprint('citations', __name__, url_prefix='/api/citations')
formatter = CitationFormatter()

@bp.route('/formats', methods=['GET'])
def get_formats():
    """Get available citation formats"""
    formats = []
    for format_name, format_info in CitationFormatter.FORMATS.items():
        formats.append({
            'name': format_name,
            'full_name': format_info['name'],
            'types': ['journal', 'book', 'website']
        })
    
    return jsonify({
        'success': True,
        'data': formats,
        'count': len(formats)
    }), 200

@bp.route('/format-citation', methods=['POST'])
def format_single_citation():
    """Format a single citation"""
    try:
        data = request.get_json()
        
        source = data.get('source', {})
        style = data.get('style', 'APA')
        source_type = data.get('source_type', 'journal')
        
        if not source:
            return jsonify({'error': 'Source data is required'}), 400
        
        if style not in CitationFormatter.FORMATS:
            return jsonify({'error': f'Invalid citation style: {style}'}), 400
        
        citation = formatter.format_citation(source, style, source_type)
        in_text = formatter.generate_in_text_citation(source, style)
        
        return jsonify({
            'success': True,
            'data': {
                'citation': citation,
                'in_text': in_text,
                'style': style
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Citation formatting error: {e}")
        return jsonify({'error': 'Failed to format citation', 'details': str(e)}), 500

@bp.route('/format-bibliography', methods=['POST'])
def format_bibliography():
    """Format a complete bibliography"""
    try:
        data = request.get_json()
        
        sources = data.get('sources', [])
        style = data.get('style', 'APA')
        
        if not sources:
            return jsonify({'error': 'Sources are required'}), 400
        
        if style not in CitationFormatter.FORMATS:
            return jsonify({'error': f'Invalid citation style: {style}'}), 400
        
        bibliography = formatter.format_bibliography(sources, style)
        
        return jsonify({
            'success': True,
            'data': {
                'bibliography': bibliography,
                'style': style,
                'sources_count': len(sources)
            }
        }), 200
    
    except Exception as e:
        logger.error(f"Bibliography formatting error: {e}")
        return jsonify({'error': 'Failed to format bibliography', 'details': str(e)}), 500
