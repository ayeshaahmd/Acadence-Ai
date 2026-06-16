from app.services.research_collector import ResearchCollector
from app.services.paper_writer import PaperWriter
from app.services.citation_formatter import CitationFormatter
from app import db
from app.models import ResearchPaper, ResearchSource
from typing import Dict
import logging

logger = logging.getLogger(__name__)

class PaperGenerationService:
    """Orchestrates the complete paper generation process"""
    
    def __init__(self, config):
        self.config = config
        self.collector = ResearchCollector(config)
        self.writer = PaperWriter(config)
        self.citation_formatter = CitationFormatter()
    
    def generate_complete_paper(self, topic: str, word_count: int = 8000, 
                               citation_format: str = 'APA', complexity_level: str = 'master',
                               domain: str = 'general') -> Dict:
        """
        Complete workflow: research + write + cite
        """
        try:
            logger.info(f"Starting paper generation for topic: {topic} (Level: {complexity_level}, Domain: {domain})")
            
            # Step 1: Collect research
            logger.info("Step 1: Collecting research...")
            sources = self.collector.collect(topic, self.config.MAX_RESEARCH_RESULTS, domain=domain)
            
            if not sources:
                raise ValueError("No research sources found for the given topic")
            
            logger.info(f"Collected {len(sources)} sources")
            
            # Step 2: Generate paper
            logger.info("Step 2: Generating paper...")
            paper_data = self.writer.generate_paper(topic, sources, word_count, citation_format, complexity_level, domain)
            
            # Step 3: Format citations
            logger.info("Step 3: Formatting citations...")
            bibliography = self.citation_formatter.format_bibliography(sources, citation_format)
            
            # Combine with bibliography
            full_paper = paper_data['content'] + '\n\n' + bibliography
            
            # Step 4: Save to database
            logger.info("Step 4: Saving to database...")
            paper = self._save_paper(topic, paper_data, sources, citation_format, complexity_level, domain)
            
            result = {
                'paper_id': str(paper.id),
                'title': paper_data['title'],
                'abstract': paper_data['abstract'],
                'content': full_paper,
                'word_count': paper_data['word_count'],
                'sources_count': len(sources),
                'citation_format': citation_format,
                'complexity_level': complexity_level,
                'domain': domain,
                'status': paper.status
            }
            
            logger.info(f"Paper generation completed. ID: {paper.id}")
            return result
        
        except Exception as e:
            logger.error(f"Paper generation failed: {e}", exc_info=True)
            raise
    
    def _save_paper(self, topic: str, paper_data: Dict, sources: list, citation_format: str, complexity_level: str = 'master', domain: str = 'general') -> ResearchPaper:
        """Save paper and sources to database"""
        
        # Create source records
        embedded_sources = []
        for source in sources[:20]:  # Save top 20 sources
            research_source = ResearchSource(
                source_type=source.get('source_type', 'unknown'),
                title=source.get('title'),
                authors=source.get('authors'),
                url=source.get('url'),
                doi=source.get('doi'),
                publication_date=source.get('publication_date'),
                abstract=source.get('abstract'),
                relevance_score=source.get('relevance_score', 0.5)
            )
            embedded_sources.append(research_source)
            
        # Create paper record
        paper = ResearchPaper(
            title=paper_data['title'],
            topic=topic,
            abstract=paper_data['abstract'],
            content=paper_data['content'],
            word_count=paper_data['word_count'],
            citation_format=citation_format,
            complexity_level=complexity_level,
            domain=domain,
            sources=embedded_sources,
            status='completed_fallback' if paper_data.get('is_fallback') else 'completed'
        )
        
        paper.save()
        return paper
