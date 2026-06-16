# Quick Reference Card

## Installation (5 minutes)

### Windows
```bash
# 1. Clone/extract project
cd research-paper-assistant

# 2. Setup backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. Setup frontend
cd ..\frontend
npm install

# 4. Configure
# Edit backend\.env with your API key
```

### macOS/Linux
```bash
cd research-paper-assistant
bash setup.sh
```

---

## Running the App

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python run.py
```

### Terminal 2: Frontend
```bash
cd frontend
npm start
```

### Both at Once (macOS/Linux)
```bash
bash run.sh
```

---

## API Keys Needed

### OpenAI (Easy - Recommended)
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy: `sk-...`
4. Paste in `backend/.env`: `OPENAI_API_KEY=sk-...`

### Anthropic (Alternative)
1. Go to https://console.anthropic.com/
2. Create API key
3. Paste in `backend/.env`: `ANTHROPIC_API_KEY=sk-ant-...`

---

## Generate Your First Paper

1. **Open**: http://localhost:3000
2. **Click**: "Generate Paper"
3. **Enter Topic**: e.g., "Machine Learning in Healthcare"
4. **Set**: Word count (8000 words recommended)
5. **Select**: Citation format (APA for most)
6. **Click**: "Generate"
7. **Wait**: 5-10 minutes ⏳
8. **View**: Download paper from "My Papers"

---

## Common Commands

| Task | Command |
|------|---------|
| Install dependencies | `pip install -r requirements.txt` |
| Start backend | `python run.py` (in backend dir) |
| Start frontend | `npm start` (in frontend dir) |
| Test backend | `curl http://localhost:5000/api/health` |
| Clear database | `rm papers.db` |
| Stop services | `Ctrl+C` in terminal |

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'openai'"
```bash
cd backend
source venv/bin/activate
pip install openai
```

### "OPENAI_API_KEY not found"
1. Create `backend/.env` file
2. Add: `OPENAI_API_KEY=sk-your-key-here`

### Frontend won't connect to backend
1. Check backend running: `http://localhost:5000/api/health`
2. Check .env: `REACT_APP_API_URL=http://localhost:5000`

### Port already in use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
python run.py  # Edit config.py to change
```

---

## File Structure

```
research-paper-assistant/
├── backend/              # Python Flask API
│   ├── app/
│   │   ├── models.py     # Database models
│   │   ├── config.py     # Configuration
│   │   ├── services/     # Business logic
│   │   └── routes/       # API endpoints
│   ├── requirements.txt  # Dependencies
│   ├── run.py           # Entry point
│   └── .env             # API keys (CREATE THIS)
├── frontend/            # React web app
│   ├── src/
│   ├── public/
│   └── package.json
├── README.md            # Main documentation
├── SETUP.md             # Detailed setup
├── USER_GUIDE.md        # How to use
└── ADVANCED_CONFIG.md   # Advanced settings
```

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/papers` | Generate paper |
| GET | `/api/papers` | List papers |
| GET | `/api/papers/{id}` | Get paper details |
| DELETE | `/api/papers/{id}` | Delete paper |
| POST | `/api/research/collect` | Collect sources |
| GET | `/api/citations/formats` | Available formats |

---

## Paper Features

✅ **8k-10k words** - Full research papers
✅ **50+ sources** - Comprehensive research
✅ **Multiple formats** - APA, Chicago, Harvard, IEEE, MLA
✅ **Humanized writing** - Not obviously AI-generated
✅ **Proper citations** - In-text citations + bibliography
✅ **Data collection** - Automated source gathering
✅ **Web interface** - Easy to use
✅ **Download support** - Save and edit

---

## Best Practices

### Before Generating
- ✓ Be specific with your topic
- ✓ Include relevant keywords
- ✓ Know your citation format requirement

### After Generating
- ✓ Read the entire paper
- ✓ Verify citations are accurate
- ✓ Check facts against sources
- ✓ Add your own analysis
- ✓ Humanize the text further
- ✓ Proofread for errors

### Before Submitting
- ✓ Run plagiarism check
- ✓ Verify all sources
- ✓ Check institution AI policies
- ✓ Ensure proper attribution
- ✓ Final proofreading

---

## Support

| Issue | Solution |
|-------|----------|
| Can't find docs | See README.md, SETUP.md, USER_GUIDE.md |
| Installation fails | Check Python version (3.9+), Node (16+) |
| API errors | Verify API keys, check internet connection |
| Slow generation | Topic too vague, check API rate limits |
| No papers showing | Backend might not be running |

---

## Tips for Better Papers

1. **Be Specific**: "AI in oncology diagnosis" not "AI"
2. **Add Keywords**: "machine learning", "neural networks", "classification"
3. **Review Citations**: Not all AI-generated citations might be accurate
4. **Customize**: Add your own research and insights
5. **Vary Topics**: Generate multiple papers and compare

---

## Next Steps

1. ✅ Generate your first paper
2. ✅ Edit and customize it
3. ✅ Read the full USER_GUIDE.md
4. ✅ Explore advanced features
5. ✅ Configure additional options
6. ✅ Contribute improvements

---

## One More Thing...

**Remember**: This tool is a research helper, not a replacement for learning!
- Use generated content as a starting point
- Always verify information
- Add your unique insights
- Cite your sources properly
- Maintain academic integrity ✓

**Happy researching! 🎓**
