# AI Research Paper Assistant

A comprehensive web-based tool for PhD students to research topics and generate humanized, high-quality research papers (8k-10k words) with proper citations.

## Features

✅ **Intelligent Research** - Gathers data from multiple sources (Google Scholar, ArXiv, web search)
✅ **Humanized Writing** - Generates natural, academic-quality papers
✅ **Multi-Format Citations** - Support for APA, Chicago, Harvard, IEEE, and more
✅ **Data Collection** - Automated data extraction from academic sources
✅ **Large Documents** - Generates 8k-10k word well-structured research papers
✅ **Web Interface** - Easy-to-use browser-based dashboard

## Project Structure

```
research-paper-assistant/
├── backend/                 # Python Flask API
│   ├── app/
│   │   ├── models/         # Database models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Core business logic
│   │   └── config.py       # Configuration
│   ├── requirements.txt    # Python dependencies
│   └── run.py             # Backend entry point
├── frontend/               # React web interface
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Setup

### Backend Setup

1. Install Python 3.9+
2. Navigate to backend folder:
```bash
cd backend
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
# Create .env file in backend/
OPENAI_API_KEY=your_key_here  # or use Claude/other LLM
DATABASE_URL=sqlite:///papers.db
SECRET_KEY=your_secret_key
```

4. Run the server:
```bash
python run.py
```

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
npm install
npm start
```

2. Open http://localhost:3000

## Quick Start

1. Enter your research topic
2. Select desired word count (8k-10k recommended)
3. Choose citation format (APA, Chicago, etc.)
4. Click "Generate Paper"
5. System will:
   - Research your topic
   - Collect relevant data
   - Generate humanized content
   - Add proper citations
   - Format bibliography

## API Endpoints

- `POST /api/papers/generate` - Generate a research paper
- `GET /api/papers` - List your papers
- `GET /api/papers/<id>` - Get paper details
- `POST /api/research` - Research a topic
- `GET /api/citations` - Get citation options

## Technologies

- **Backend**: Python, Flask, SQLAlchemy
- **Frontend**: React, TailwindCSS
- **APIs**: OpenAI/Claude, Google Scholar, ArXiv, NewsAPI
- **Database**: SQLite (dev) / PostgreSQL (production)

## Configuration

Edit `backend/app/config.py` to customize:
- LLM provider (OpenAI, Claude, etc.)
- Research sources
- Citation formats
- Paper structure templates
- Quality settings

## Tips for Better Results

1. **Be Specific**: More detailed topics generate better papers
2. **Add Keywords**: Include domain-specific keywords for better research
3. **Review Citations**: Always verify citations are from credible sources
4. **Proofread**: The output is humanized but review for your field's specifics
5. **Customize**: Edit generated papers to match your unique insights

## License

MIT

## Support

For issues or questions, check the documentation or reach out.
