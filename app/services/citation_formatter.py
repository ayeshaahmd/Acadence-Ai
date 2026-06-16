from datetime import datetime
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class CitationFormatter:
    """Format citations in multiple academic styles"""
    
    FORMATS = {
        'APA': {
            'name': 'American Psychological Association',
            'journal': '{authors} ({year}). {title}. {journal}, {volume}({issue}), {pages}.',
            'book': '{authors} ({year}). {title}. {publisher}.',
            'website': '{authors} ({year}). {title}. Retrieved from {url}'
        },
        'Chicago': {
            'name': 'Chicago Manual of Style',
            'journal': '{authors}. "{title}." {journal} {volume}, no. {issue} ({year}): {pages}.',
            'book': '{authors}. {title}. {publisher}, {year}.',
            'website': '{authors}. "{title}." Accessed {access_date}. {url}.'
        },
        'Harvard': {
            'name': 'Harvard',
            'journal': '{authors}, {year}. {title}. {journal}, {volume}({issue}), pp.{pages}.',
            'book': '{authors}, {year}. {title}. {publisher}.',
            'website': '{authors}, {year}. {title}. Available at: {url} (Accessed: {access_date})'
        },
        'IEEE': {
            'name': 'Institute of Electrical and Electronics Engineers',
            'journal': '[{number}] {authors}, "{title}," {journal}, vol. {volume}, no. {issue}, pp. {pages}, {year}.',
            'book': '[{number}] {authors}, {title}. {publisher}, {year}.',
            'website': '[{number}] {authors}, "{title}." [Online]. Available: {url}. [Accessed: {access_date}].'
        },
        'MLA': {
            'name': 'Modern Language Association',
            'journal': '{authors}. "{title}." {journal}, vol. {volume}, no. {issue}, {year}, pp. {pages}.',
            'book': '{authors}. {title}, {publisher}, {year}.',
            'website': '{authors}. "{title}." {website_name}, {year}, {url}. Accessed {access_date}.'
        }
    }
    
    def format_citation(self, source: Dict, style: str = 'APA', source_type: str = 'journal') -> str:
        """
        Format a single citation
        
        Args:
            source: Dictionary with citation data
            style: Citation style (APA, Chicago, Harvard, IEEE, MLA)
            source_type: Type of source (journal, book, website)
        """
        if style not in self.FORMATS:
            logger.warning(f"Unknown citation style: {style}, defaulting to APA")
            style = 'APA'
        
        template = self.FORMATS[style].get(source_type, self.FORMATS[style].get('journal'))
        
        # Prepare citation data
        citation_data = {
            'authors': self._format_authors(source.get('authors', 'Unknown'), style),
            'year': self._extract_year(source.get('publication_date')),
            'title': source.get('title', 'Untitled'),
            'journal': source.get('journal', 'Journal'),
            'volume': source.get('volume', '1'),
            'issue': source.get('issue', '1'),
            'pages': source.get('pages', '1-10'),
            'publisher': source.get('publisher', 'Publisher'),
            'url': source.get('url', ''),
            'website_name': source.get('website_name', 'Website'),
            'access_date': datetime.now().strftime('%d %b. %Y'),
            'number': source.get('number', '1'),
            'doi': source.get('doi', '')
        }
        
        try:
            citation = template.format(**citation_data)
        except KeyError as e:
            logger.warning(f"Missing citation field: {e}")
            citation = str(source)
        
        return citation.strip()
    
    def format_bibliography(self, sources: List[Dict], style: str = 'APA') -> str:
        """
        Format a complete bibliography
        """
        if not sources:
            return "## References\n\nNo sources cited."
        
        if style not in self.FORMATS:
            style = 'APA'
        
        # Format each citation
        citations = []
        for i, source in enumerate(sources, 1):
            source_type = source.get('source_type', 'website')
            citation = self.format_citation(source, style, source_type)
            citations.append(citation)
        
        # Sort alphabetically for bibliography
        citations.sort()
        
        # Create bibliography section
        bibliography = f"## References ({style})\n\n"
        for i, citation in enumerate(citations, 1):
            bibliography += f"{i}. {citation}\n"
        
        return bibliography
    
    def generate_in_text_citation(self, source: Dict, style: str = 'APA') -> str:
        """
        Generate in-text citation
        """
        authors = source.get('authors', 'Unknown')
        year = self._extract_year(source.get('publication_date'))
        
        if style == 'APA':
            return f"({self._format_authors(authors, 'APA', in_text=True)} {year})"
        elif style == 'Chicago':
            return f"({self._format_authors(authors, 'Chicago', in_text=True)} {year})"
        elif style == 'Harvard':
            return f"({self._format_authors(authors, 'Harvard', in_text=True)}, {year})"
        elif style == 'IEEE':
            return f"[{source.get('number', 1)}]"
        elif style == 'MLA':
            return f"({self._format_authors(authors, 'MLA', in_text=True)} {year})"
        else:
            return f"({self._format_authors(authors, 'APA', in_text=True)} {year})"
    
    def _format_authors(self, authors: str, style: str = 'APA', in_text: bool = False) -> str:
        """
        Format author names according to citation style
        """
        if not authors or authors == 'Unknown':
            return 'Anonymous'
        
        # Parse authors (assuming comma-separated)
        author_list = [a.strip() for a in authors.split(',')]
        
        if style == 'APA':
            if in_text:
                if len(author_list) == 1:
                    return author_list[0]
                elif len(author_list) == 2:
                    return f"{author_list[0]} & {author_list[1]}"
                else:
                    return f"{author_list[0]} et al."
            else:
                if len(author_list) == 1:
                    return author_list[0]
                elif len(author_list) <= 7:
                    return ', '.join(author_list[:-1]) + ', & ' + author_list[-1]
                else:
                    return ', '.join(author_list[:6]) + ', & ' + author_list[6]
        
        elif style == 'Chicago':
            return ', '.join(author_list[:3]) + (' et al.' if len(author_list) > 3 else '')
        
        elif style == 'Harvard':
            if len(author_list) == 1:
                return author_list[0]
            elif len(author_list) == 2:
                return f"{author_list[0]} and {author_list[1]}"
            else:
                return f"{author_list[0]} et al."
        
        elif style == 'MLA':
            return ', '.join(author_list[:3]) + (' et al.' if len(author_list) > 3 else '')
        
        else:
            return ', '.join(author_list[:3])
    
    def _extract_year(self, date) -> str:
        """Extract year from date"""
        try:
            if isinstance(date, str):
                return date[:4] if len(date) >= 4 else datetime.now().year
            elif isinstance(date, datetime):
                return str(date.year)
            else:
                return str(datetime.now().year)
        except:
            return str(datetime.now().year)
