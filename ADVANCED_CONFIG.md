# Advanced Configuration Guide

## LLM Provider Setup

### OpenAI (Recommended for Speed)

1. **Get API Key**:
   - Visit https://platform.openai.com/api-keys
   - Create new secret key
   - Copy and save securely

2. **Add to .env**:
   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-...
   ```

3. **Models Available**:
   - `gpt-4` - Best quality, slower
   - `gpt-3.5-turbo` - Balanced (current)
   - Modify in `backend/app/services/paper_writer.py`

4. **Pricing**: ~$0.01-0.05 per paper (depends on length)

### Anthropic (Claude - Best for Humanization)

1. **Get API Key**:
   - Visit https://console.anthropic.com/
   - Create API key
   - Save securely

2. **Add to .env**:
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. **Models Available**:
   - `claude-3-opus` - Highest quality
   - `claude-3-sonnet` - Balanced (current)
   - `claude-3-haiku` - Fastest

4. **Advantages**:
   - More natural writing
   - Better context understanding
   - Slightly higher cost

### Local Models (Offline)

Run Ollama for privacy:

```bash
# Install Ollama from ollama.ai
# Pull model
ollama pull mistral  # or neural-chat, etc.

# Start Ollama
ollama serve

# Update config in paper_writer.py
# Change to local API calls
```

---

## Research Source Configuration

### Enabled Sources

By default, the system searches:
- **ArXiv**: Physics, computer science, mathematics
- **Google Scholar**: Broad academic coverage
- **Web Search**: News, blogs, technical articles
- **Semantic Scholar**: Academic papers with AI indexing

### Adding Custom Sources

Edit `backend/app/services/research_collector.py`:

```python
def collect(self, topic: str, max_results: int = 50) -> List[Dict]:
    # Add new source
    custom_results = self._collect_your_source(topic, max_results)
    all_sources.extend(custom_results)
    return all_sources
```

### Database Integration

Connect to academic databases:
```python
# Example: PubMed integration
import requests

def _collect_pubmed(self, topic, max_results):
    url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    # Implementation...
```

---

## Paper Structure Customization

### Adjust Section Lengths

Edit `backend/app/config.py`:

```python
PAPER_STRUCTURE = {
    'abstract': 250,              # 250 words
    'introduction': 1200,          # 1200 words
    'literature_review': 3000,     # 3000 words (longest)
    'methodology': 1500,
    'results': 1500,
    'discussion': 1200,
    'conclusion': 800,
    'references': 300              # Approx.
}
```

### Add New Sections

```python
# Modify paper_writer.py

sections['case_studies'] = self._generate_section(
    'case_studies',
    topic,
    sources_summary,
    2000  # 2000 words
)

# Add to compile_paper():
```

---

## Citation Format Customization

### Modify Existing Format

Edit `backend/app/services/citation_formatter.py`:

```python
FORMATS = {
    'APA': {
        'journal': '{authors} ({year}). {title}. {journal}, {volume}({issue}), {pages}. DOI: {doi}',
        # Add DOI field
    }
}
```

### Add New Format

```python
FORMATS['CustomFormat'] = {
    'name': 'My Custom Format',
    'journal': '{authors} - {title} ({year})',
    'book': '{authors}: {title}. {publisher}',
    'website': '{title} from {url}'
}
```

---

## Database Configuration

### SQLite (Development - Default)

```
DATABASE_URL=sqlite:///papers.db
```

Stored in `backend/` directory. Simple but not scalable.

### PostgreSQL (Production)

1. **Install PostgreSQL**:
   ```bash
   # Mac
   brew install postgresql
   
   # Ubuntu
   sudo apt-get install postgresql
   ```

2. **Update .env**:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/research_db
   ```

3. **Create database**:
   ```bash
   createdb research_db
   ```

4. **Run migrations** (if needed):
   ```bash
   python backend/manage.py db upgrade
   ```

### MySQL Alternative

```
DATABASE_URL=mysql+pymysql://user:password@localhost/research_db
```

---

## Email & Notifications

### Add Email Notifications

Create `backend/app/services/email_service.py`:

```python
import smtplib

class EmailService:
    def send_paper_ready(self, email, paper_title):
        # Send email when paper is ready
        pass
```

### Configure SMTP

```python
# .env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Monitoring & Logging

### Enable Detailed Logging

Edit `backend/run.py`:

```python
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Performance Monitoring

```python
import time

def generate_complete_paper(self, topic, word_count, citation_format):
    start = time.time()
    
    # ... generation code ...
    
    elapsed = time.time() - start
    logger.info(f"Paper generation took {elapsed:.2f} seconds")
```

---

## API Rate Limiting

### Implement Rate Limiting

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=get_remote_address)

@bp.route('', methods=['POST'])
@limiter.limit("5 per hour")  # Max 5 papers per hour
def generate_paper():
    # ...
```

---

## Caching Optimization

### Cache Research Results

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_arxiv_papers(topic, limit):
    # Cached for same topic
    return collector._collect_arxiv(topic, limit)
```

---

## Docker Deployment

### Build and Run with Docker

```bash
# Build
docker-compose build

# Run
docker-compose up

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Docker Environment Variables

Create `.env.docker`:

```
FLASK_ENV=production
DATABASE_URL=postgresql://postgres:password@db:5432/research_db
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

---

## Security Configuration

### Enable HTTPS

```python
# config.py
SESSION_COOKIE_SECURE = True  # Production only
SESSION_COOKIE_HTTPONLY = True
```

### API Key Management

Use environment secrets instead of hardcoding:

```bash
# Using systemd environment
export OPENAI_API_KEY='sk-...'
systemctl set-environment OPENAI_API_KEY='sk-...'
```

### CORS Security

```python
CORS_ORIGINS = ['https://yourdomain.com']  # Production
```

---

## Performance Tuning

### Batch Processing

```python
# Process multiple requests
for topic in topics_list:
    generate_paper(topic)  # Queued processing
```

### Parallel Requests

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=3) as executor:
    futures = [executor.submit(generate_paper, topic) for topic in topics]
```

---

## Backup & Restore

### Database Backup

```bash
# PostgreSQL
pg_dump research_db > backup.sql

# Restore
psql research_db < backup.sql
```

### File Backup

```bash
# Backup papers and data
tar -czf research-backup.tar.gz papers.db
```

---

## Troubleshooting

### Debug Mode

```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Test LLM Connection

```bash
python -c "
import openai
openai.api_key = 'sk-...'
print(openai.ChatCompletion.create(
    model='gpt-3.5-turbo',
    messages=[{'role': 'user', 'content': 'test'}]
))"
```

### Check Database

```bash
# SQLite
sqlite3 papers.db "SELECT COUNT(*) FROM research_papers;"

# PostgreSQL
psql -U postgres research_db -c "SELECT COUNT(*) FROM research_papers;"
```

---

For more help, contact support or check documentation.
