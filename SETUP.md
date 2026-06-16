# AI Research Paper Assistant - Setup Guide

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- pip package manager
- npm

### Step 1: Configure Environment

Create `.env` file in `backend/` directory:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your API keys:
```
OPENAI_API_KEY=sk-...  # Get from https://platform.openai.com/api-keys
# OR use Anthropic:
ANTHROPIC_API_KEY=sk-ant-...  # Get from https://console.anthropic.com
```

### Step 2: Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Start Backend Server

```bash
python run.py
```

Backend runs on: `http://localhost:5000`

### Step 4: Install Frontend Dependencies

In a new terminal:

```bash
cd frontend
npm install
```

### Step 5: Start Frontend Application

```bash
npm start
```

Frontend opens at: `http://localhost:3000`

## Features & Usage

### Generate a Research Paper

1. Click **"Generate Paper"** button
2. Enter your research topic
3. Select desired word count (5k-10k)
4. Choose citation format (APA, Chicago, Harvard, IEEE, MLA)
5. Click **"Generate"** and wait for results
6. Paper is automatically saved to your library

### What the System Does

✅ **Research Phase** (1-2 minutes)
- Searches Google Scholar for academic papers
- Pulls data from ArXiv (physics, CS, math papers)
- Crawls web for relevant content
- Ranks sources by relevance

✅ **Writing Phase** (2-3 minutes)
- Uses AI to generate natural academic writing
- Creates proper paper structure:
  - Abstract (200 words)
  - Introduction (1000+ words)
  - Literature Review (2500+ words)
  - Methodology (1500+ words)
  - Results (1500+ words)
  - Discussion (1200+ words)
  - Conclusion (800+ words)

✅ **Citation Phase** (1 minute)
- Formats all sources in chosen style
- Generates in-text citations
- Creates complete bibliography

### Download & Edit

1. Go to **"My Papers"**
2. Click on any paper to view details
3. Download as plain text
4. Copy content to Word/Google Docs
5. Add your own analysis and edits

## API Endpoints

### Paper Generation
```bash
POST /api/papers
{
  "topic": "Your research topic",
  "word_count": 8000,
  "citation_format": "APA"
}
```

### List Papers
```bash
GET /api/papers?page=1&per_page=10
```

### Get Paper Details
```bash
GET /api/papers/{id}
```

### Delete Paper
```bash
DELETE /api/papers/{id}
```

### Collect Research
```bash
POST /api/research/collect
{
  "topic": "Your topic",
  "max_results": 50
}
```

### Format Citations
```bash
POST /api/citations/format-citation
{
  "source": {...},
  "style": "APA",
  "source_type": "journal"
}
```

## Configuration

Edit `backend/app/config.py` to customize:

- **LLM Provider**: Change from OpenAI to Anthropic or other
- **Research Sources**: Add/remove academic databases
- **Paper Structure**: Adjust section word counts
- **Citation Formats**: Modify citation templates
- **Quality Settings**: Adjust temperature and tokens

## Tips for Better Results

1. **Be Specific with Topics**
   - Good: "Impact of machine learning in cancer diagnosis"
   - Bad: "AI in healthcare"

2. **Include Keywords**
   - Include domain-specific terms
   - Add methodology keywords (e.g., "meta-analysis", "RCT")

3. **Review Before Submission**
   - Papers are AI-generated and humanized
   - Always review for factual accuracy
   - Check citations are relevant
   - Add your own insights and critiques

4. **Customize the Output**
   - Edit and improve sections
   - Add personal analysis
   - Include missing studies
   - Adjust writing style

## Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.9+

# Clear pip cache and reinstall
pip cache purge
pip install -r requirements.txt
```

### API Key Errors
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has no extra spaces
- Test key on provider's website first

### No Papers Generated
- Check backend logs for errors
- Ensure internet connection is stable
- Try with different topic
- Check API rate limits (if using free tier)

### Frontend Won't Connect
- Ensure backend is running on port 5000
- Check CORS settings in config.py
- Clear browser cache
- Try `http://localhost:3000` instead of `127.0.0.1`

## Production Deployment

### Backend (Using Gunicorn)
```bash
gunicorn -w 4 -b 0.0.0.0:5000 "app:create_app()"
```

### Frontend (Build for Production)
```bash
cd frontend
npm run build
# Deploy 'build' folder to hosting service
```

### Database
- Use PostgreSQL instead of SQLite in production
- Update `DATABASE_URL` in `.env`

### Environment Variables
- Set `FLASK_ENV=production`
- Generate strong `SECRET_KEY`
- Use environment secrets for API keys
- Set `SESSION_COOKIE_SECURE=True`

## Support & Issues

- Check error messages in browser console
- View backend logs in terminal
- Test API endpoints with Postman
- Verify all dependencies are installed

## License

MIT License - Feel free to use and modify

---

**Happy researching! 🎓**
