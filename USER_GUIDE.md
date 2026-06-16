# User Guide: AI Research Paper Assistant

## Table of Contents
1. [Getting Started](#getting-started)
2. [Generating Papers](#generating-papers)
3. [Managing Papers](#managing-papers)
4. [Citations & References](#citations--references)
5. [Tips & Tricks](#tips--tricks)
6. [Advanced Features](#advanced-features)

---

## Getting Started

### System Requirements
- Python 3.9 or higher
- Node.js 16 or higher
- 2GB RAM minimum
- Internet connection for research

### Installation Steps

1. **Clone or Download** the project
2. **Configure environment** (see SETUP.md)
3. **Set API keys** in `backend/.env`
4. **Run setup script**:
   ```bash
   bash setup.sh  # Linux/Mac
   # OR manual setup
   ```
5. **Start services**:
   ```bash
   bash run.sh
   ```
6. **Open browser**: http://localhost:3000

---

## Generating Papers

### Step 1: Prepare Your Topic

Enter a specific research topic with relevant keywords:

**✓ Good Examples:**
- "Deep Learning Applications in Medical Image Analysis"
- "Blockchain Implementation in Supply Chain Management"
- "Quantum Computing Algorithms for Optimization Problems"
- "Impact of Remote Work on Organizational Productivity"

**✗ Vague Examples:**
- "AI"
- "Business"
- "Technology"

### Step 2: Configure Paper Settings

| Setting | Recommended | Range |
|---------|-------------|-------|
| **Word Count** | 8,000-10,000 | 5,000-10,000 |
| **Citation Format** | Your institution's requirement | APA, Chicago, Harvard, IEEE, MLA |
| **Research Sources** | All enabled | Academic + Web |

### Step 3: Generate

1. Click **"Generate Paper"** button
2. **Wait 5-10 minutes** for:
   - Research collection (50+ sources)
   - Content generation
   - Citation formatting
3. Paper automatically saves to your library

### Step 4: Review & Customize

Download the paper and:
- ✓ Review all citations for accuracy
- ✓ Check facts against your knowledge
- ✓ Add personal insights and analysis
- ✓ Adjust tone to match your voice
- ✓ Fix any formatting issues

---

## Managing Papers

### View Paper Details
- Title, word count, citation format
- List of all sources used
- Full content with formatting
- Generated abstract

### Download Options
- **TXT Format**: Plain text, easy to edit
- **PDF Export**: Coming soon
- **DOCX Export**: Coming soon

### Delete Papers
- Click the delete button
- Paper is permanently removed from library
- Cannot be recovered

### Search & Filter
- Filter by date created
- Sort by word count
- Search by topic or title

---

## Citations & References

### Supported Formats

#### APA (American Psychological Association)
```
Smith, J. A., Johnson, B., & Williams, C. (2023). 
Title of research paper. Journal Name, 45(3), 234-250.
```
**Best for:** Psychology, education, social sciences

#### Chicago Manual of Style
```
Smith, J. A., B. Johnson, and C. Williams. "Title of Research Paper." 
Journal Name 45, no. 3 (2023): 234-250.
```
**Best for:** History, literature, humanities

#### Harvard
```
Smith, J. A., Johnson, B. & Williams, C., 2023. 
Title of research paper. Journal Name, 45(3), pp. 234–250.
```
**Best for:** Natural sciences, engineering

#### IEEE (Institute of Electrical and Electronics Engineers)
```
[1] J. A. Smith, B. Johnson, and C. Williams, 
"Title of research paper," Journal Name, vol. 45, no. 3, pp. 234–250, 2023.
```
**Best for:** Computer science, engineering, technology

#### MLA (Modern Language Association)
```
Smith, J. A., et al. "Title of Research Paper." 
Journal Name, vol. 45, no. 3, 2023, pp. 234-250.
```
**Best for:** Literature, languages, arts

### In-Text Citations

The system automatically inserts proper in-text citations:

**APA**: (Smith et al., 2023)
**Chicago**: Smith, Johnson, and Williams (2023)
**Harvard**: (Smith, Johnson & Williams, 2023)
**IEEE**: [1]
**MLA**: (Smith et al.)

### Managing Sources

Each paper includes:
- List of all research sources
- Relevance score (0-100%)
- Direct links to sources
- Publication dates
- Author information

---

## Tips & Tricks

### For Better Results

#### 1. Topic Specificity
- **Add keywords** from your field
- **Include methodology** terms (experimental, meta-analysis, case study)
- **Specify domain** (e.g., "healthcare" not just "medicine")

#### 2. Review Generated Content
✓ Check factual accuracy
✓ Verify citations are real and relevant
✓ Ensure no plagiarism issues
✓ Add your own analysis
✓ Customize tone and style

#### 3. Citation Accuracy
- Cross-reference sources before submission
- Verify author names and publication dates
- Check DOIs are correct
- Confirm page numbers match

#### 4. Multiple Drafts
- Generate multiple papers on same topic
- Compare different approaches
- Select best version
- Combine strengths from different papers

### Common Workflows

#### Academic Submission
1. Generate paper
2. Download as TXT
3. Open in Word/Google Docs
4. Add personal insights and analysis
5. Review and proofread
6. Final check on citations
7. Submit with confidence

#### Thesis/Dissertation
1. Generate comprehensive paper
2. Use as foundation for chapter
3. Add specialized sections
4. Include your research data
5. Integrate with existing content

#### Literature Review
1. Generate on specific topic
2. Download and extract sources
3. Read and annotate key papers
4. Synthesize findings
5. Create your own analysis

---

## Advanced Features

### Custom API Configuration

Edit `backend/app/config.py` to:
- Change LLM provider (OpenAI → Claude → Other)
- Adjust paper structure and word counts
- Customize citation formats
- Modify research sources
- Fine-tune quality parameters

### Using Different LLM Providers

**OpenAI (GPT-4)**
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

**Anthropic (Claude)**
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

**Performance**: Claude generally produces more humanized text, GPT-4 is faster

### Batch Paper Generation

While waiting for one paper to complete, start another in a new browser tab!

### API Integration

Use the REST API for custom workflows:

```python
import requests

# Generate paper
response = requests.post('http://localhost:5000/api/papers', json={
    'topic': 'Your topic',
    'word_count': 8000,
    'citation_format': 'APA'
})

paper_id = response.json()['data']['paper_id']

# Get paper
response = requests.get(f'http://localhost:5000/api/papers/{paper_id}')
content = response.json()['data']['content']
```

### Database Access

Papers are stored in SQLite (development) or PostgreSQL (production):
- Paper content and metadata
- Research sources used
- Citation formatting
- Generation timestamps

### Performance Optimization

For faster generation:
1. Use specific, narrower topics
2. Reduce word count target
3. Use local LLM (Ollama) for offline mode
4. Increase backend resources

### Troubleshooting Advanced Issues

**Long generation time:**
- Check internet speed
- Monitor API rate limits
- Reduce max research results
- Use faster LLM provider

**Memory issues:**
- Reduce batch size
- Clear old papers
- Monitor RAM usage
- Use PostgreSQL instead of SQLite

**Citation problems:**
- Verify source data is complete
- Try different citation format
- Check for special characters in titles
- Review source relevance scores

---

## Quality Assurance

### Pre-Submission Checklist

- [ ] All citations formatted correctly
- [ ] No plagiarism detected
- [ ] Facts verified against sources
- [ ] Bibliography complete
- [ ] Word count within requirements
- [ ] Proper academic tone
- [ ] Sections well-structured
- [ ] No obvious AI-generated phrases
- [ ] Personal insights added
- [ ] Final proofreading done

### Common Issues & Fixes

| Issue | Cause | Solution |
|-------|-------|----------|
| Repeated content | Low relevance sources | Edit and rewrite sections |
| Missing citations | API limitations | Add manually from sources |
| Unnatural tone | AI generation | Humanize with edits |
| Wrong sources | Relevance ranking | Review and replace sources |
| Format errors | Citation template | Use different format |

---

## Getting Help

- **Technical Issues**: Check logs in backend terminal
- **API Key Problems**: Verify keys on provider's website
- **Generation Failures**: Try with simpler topic first
- **Connection Issues**: Ensure both services running

---

## Best Practices

1. **Always review** AI-generated content
2. **Never submit** without fact-checking
3. **Add your own** analysis and insights
4. **Verify all** citations and references
5. **Cite the system** as research tool, not author
6. **Check institution** policies on AI tools
7. **Use as foundation**, not final product
8. **Maintain academic** integrity

---

**Happy researching! 🎓**

For more help, see README.md or SETUP.md
