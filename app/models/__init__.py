from datetime import datetime
import mongoengine as db

class ResearchSource(db.EmbeddedDocument):
    """Research source embedded in papers"""
    source_type = db.StringField(max_length=100)
    title = db.StringField(max_length=500)
    authors = db.StringField(max_length=500)
    url = db.StringField(max_length=1000)
    doi = db.StringField(max_length=200)
    publication_date = db.DateTimeField()
    abstract = db.StringField()
    relevance_score = db.FloatField()
    cited_in = db.ListField(db.StringField())
    created_at = db.DateTimeField(default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'source_type': self.source_type,
            'title': self.title,
            'authors': self.authors,
            'url': self.url,
            'doi': self.doi,
            'publication_date': self.publication_date.isoformat() if self.publication_date else None,
            'abstract': self.abstract,
            'relevance_score': self.relevance_score
        }

class ResearchPaper(db.Document):
    """Research paper MongoDB document"""
    meta = {'collection': 'research_papers', 'ordering': ['-created_at']}
    
    title = db.StringField(max_length=500, required=True)
    topic = db.StringField(max_length=300, required=True)
    abstract = db.StringField()
    content = db.StringField(required=True)
    word_count = db.IntField()
    citation_format = db.StringField(max_length=50, default='APA')
    complexity_level = db.StringField(max_length=100, default='master')
    domain = db.StringField(max_length=100, default='general')
    citations = db.DictField()
    sources = db.ListField(db.EmbeddedDocumentField(ResearchSource))
    status = db.StringField(max_length=50, default='draft')
    created_at = db.DateTimeField(default=datetime.utcnow)
    updated_at = db.DateTimeField(default=datetime.utcnow)
    
    def save(self, *args, **kwargs):
        if not self.created_at:
            self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        return super(ResearchPaper, self).save(*args, **kwargs)
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'title': self.title,
            'topic': self.topic,
            'abstract': self.abstract,
            'word_count': self.word_count,
            'citation_format': self.citation_format,
            'complexity_level': self.complexity_level,
            'domain': self.domain,
            'status': self.status,
            'sources': [s.to_dict() for s in self.sources],
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
