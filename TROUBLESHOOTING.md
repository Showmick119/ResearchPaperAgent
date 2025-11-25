# Troubleshooting Guide for Research Paper Study Assistant

## Common Issues and Solutions

### ❌ "Agent 1 failed: Expecting value: line 1 column 1 (char 0)"

**Problem:** The LLM (Llama 3.1) is returning text that isn't valid JSON, causing parsing errors.

**Root Causes:**
1. **Large PDFs overwhelming the model** - 35+ page papers have too much text
2. **LLM adding explanatory text** before/after the JSON
3. **Markdown code fences** in the response
4. **Incomplete JSON** due to model context limits

**Solutions:**

#### Quick Fix #1: Test with Smaller Paper
Start with a 5-10 page paper to verify the system works, then try larger ones.

#### Quick Fix #2: Use Text Mode
Instead of uploading PDF:
1. Click "📝 Paste Text" tab
2. Copy/paste just the key sections (Abstract, Intro, Methods, Results, Conclusion)
3. This gives you more control over input size

#### Quick Fix #3: Run Test Script
```bash
cd backend
python test_agent.py
```

This will show you:
- Raw LLM response
- Cleaned response
- Whether JSON parsing succeeds

**Example output if working:**
```
✅ SUCCESS! Parsed JSON:
{
  "Abstract": "...",
  "Introduction": "...",
  ...
}
```

**Example output if broken:**
```
❌ JSON PARSE ERROR: Expecting value: line 1 column 1 (char 0)
```

#### Advanced Fix: Adjust Model Parameters

Edit `backend/agents.py` and add temperature parameter:

```python
response = ollama.chat(
    model='llama3.1:8b',
    options={'temperature': 0.1},  # Add this line for more deterministic output
    messages=[...]
)
```

Lower temperature (0.1-0.3) makes responses more consistent and structured.

---

## PDF-Specific Issues

### PDF Text Extraction Fails

**Test PDF extraction separately:**
```bash
# Using curl
curl -X POST "http://localhost:8000/api/test-pdf-extract" \
  -F "file=@your_paper.pdf"
```

This endpoint returns:
- Success status
- Extracted text length
- First 1000 characters preview

**Common PDF issues:**
- **Scanned PDFs** - Image-based PDFs won't work (need OCR)
- **Protected PDFs** - Password-protected files will fail
- **Complex formatting** - Tables/equations may extract poorly

**Solution:** Convert problematic PDFs to text first:
1. Use Adobe Reader's "Save As Text"
2. Or use online PDF-to-text converter
3. Then paste text directly using "Paste Text" mode

---

## Performance Issues

### Processing Takes Too Long

**Expected times:**
- 5-page paper: ~30-60 seconds
- 15-page paper: ~1-2 minutes  
- 35-page paper: ~3-5 minutes

**Speed improvements:**

1. **Use smaller context window:**
   - App already limits to first 15k characters for Agent 1
   - And first 50 pages for PDFs

2. **Try llama3.1:latest (smaller) model:**
```bash
ollama pull llama3.1:latest
```
Then change in `backend/agents.py`:
```python
model='llama3.1:latest'  # Instead of llama3.1:8b
```

3. **Ensure Ollama has enough RAM:**
   - Llama 3.1 8B needs ~8GB RAM
   - Check system resources while processing

---

## Backend Issues

### Ollama Not Responding

**Check Ollama status:**
```bash
ollama list
curl http://localhost:11434/api/tags
```

**Restart Ollama:**
```bash
# Windows (if running as service)
Stop-Service Ollama
Start-Service Ollama

# Or just restart Ollama app from system tray

# macOS/Linux
pkill ollama
ollama serve
```

### Backend Won't Start

**Error: "Address already in use"**
```bash
# Find process using port 8000
# Windows:
netstat -ano | findstr :8000

# Kill it (replace PID):
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

---

## Frontend Issues

### Frontend Shows "Failed to fetch"

**Checklist:**
1. ✅ Backend running on port 8000
2. ✅ Frontend running on port 5173
3. ✅ No firewall blocking localhost connections
4. ✅ CORS enabled in backend (already configured)

**Test backend directly:**
```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "ollama_status": "connected",
  ...
}
```

### Agent Progress Not Updating

**Issue:** Progress bar stuck at 0%

**Cause:** Server-Sent Events (SSE) not connecting

**Solution:**
1. Check browser console for errors
2. Ensure you're using modern browser (Chrome/Firefox/Edge)
3. Disable browser extensions that might block SSE
4. Check backend logs for errors

---

## Model-Specific Issues

### Llama 3.1 Returns Invalid JSON

Some LLMs struggle with strict JSON formatting. **Improvements made:**

1. **Aggressive JSON cleaning** in `agents.py`:
   - Removes markdown code fences
   - Extracts JSON between first `{` and last `}`
   - Handles both ````json` and plain ``` blocks

2. **Stricter system prompts**:
   - Explicit "Return ONLY JSON" instructions
   - No explanations allowed
   - Examples of exact format

3. **Better error messages**:
   - Shows which agent failed
   - Indicates if it's JSON parsing issue
   - Suggests next steps

**If still having issues, try alternative models:**

```bash
# Try Mistral (often better at structured output)
ollama pull mistral

# Or CodeLlama (trained on structured data)
ollama pull codellama
```

Then update `backend/agents.py` to use that model.

---

## Debug Mode

### Enable Verbose Logging

Add this to `backend/main.py` at the top:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

This will show detailed request/response logs.

### Test Individual Agents

Create test files in `backend/`:

**test_agent1.py:**
```python
from agents import Agent1_SectionExtractor

result = Agent1_SectionExtractor.extract_sections("Your text here...")
print(result)
```

Run: `python test_agent1.py`

---

## Getting Help

If you're still stuck:

1. **Run test script** and share output:
```bash
python backend/test_agent.py
```

2. **Check backend logs** for detailed errors

3. **Verify Ollama model works independently:**
```bash
ollama run llama3.1:8b "Return only JSON: {\"test\": \"value\"}"
```

4. **Try with sample paper** (provided in frontend) to isolate issue

---

## Known Limitations

1. **Image-based PDFs** - Cannot extract text from scanned documents
2. **Very large papers** - Limited to first 50 pages (15k chars for Agent 1)
3. **Complex equations** - LaTeX may not extract properly from PDFs
4. **Tables** - PDF table extraction can be messy
5. **LLM consistency** - Llama 3.1 may occasionally return malformed JSON

**Workaround:** For best results, use well-formatted digital PDFs (not scans) under 30 pages.

