# Research Paper Study Assistant 🎓

An AI-powered study assistant that uses a **4-agent sequential workflow** to analyze research papers and generate comprehensive study materials. Built with Python FastAPI backend and React frontend, powered by Ollama (Llama 3.1 8B).

## 🤖 4-Agent Workflow

This application demonstrates a clear sequential agentic workflow where each AI agent performs a distinct task:

1. **Agent 1 (Section Extractor)** 📄
   - Parses research paper text
   - Identifies key sections: Abstract, Introduction, Methods, Results, Discussion, Conclusion
   - Outputs: Structured JSON with extracted sections

2. **Agent 2 (Summarizer)** 📝
   - Takes extracted sections from Agent 1
   - Generates 2-3 sentence summaries for each section
   - Outputs: Concise summaries for comprehension

3. **Agent 3 (Quiz Generator)** 🎯
   - Takes summaries from Agent 2
   - Creates 5-8 multiple choice questions with 4 options each
   - Outputs: Interactive quiz with explanations

4. **Agent 4 (Study Guide Builder)** 📚
   - Takes summaries and quiz from previous agents
   - Combines everything into a formatted study guide
   - Adds study tips and key takeaways
   - Outputs: Complete study package

Each agent's output becomes the input for the next agent, creating a sequential processing pipeline that's **visually tracked in real-time** on the frontend.

## ✨ Features

- **PDF Upload Support**: Upload research papers directly as PDF files (automatic text extraction)
- **Flexible Input**: Choose between PDF upload or direct text paste
- **Comprehensive Summaries**: Detailed summaries including statistics, methodology, and key findings
- **Challenging Quizzes**: 8-12 questions testing deep understanding with specific details
- **Real-time Progress Tracking**: Watch each agent process your paper with live status updates
- **Interactive UI**: Modern, clean interface with smooth animations
- **Study Guide**: Complete guide with detailed tips, key takeaways, and organized content
- **Server-Sent Events (SSE)**: Real-time streaming of agent progress
- **Local Processing**: All AI processing happens locally using Ollama

## ⚠️ Important Notes on PDF Extraction

**PDF text extraction has limitations:**
- ✅ Works well with digital PDFs (Word, LaTeX)
- ❌ Cannot extract diagrams, figures, graphs, or images
- ❌ May struggle with complex equations (LaTeX formulas)
- ❌ Tables with complex formatting may be garbled
- ❌ Scanned/image-based PDFs will not work

**For best results with figure/diagram-heavy papers:**
1. Use "📝 Paste Text" mode
2. Copy text from PDF and add descriptions of key figures
3. Example: "Figure 2 shows accuracy improving from 79% (baseline) to 94% (CNN)"

See [PDF_LIMITATIONS.md](PDF_LIMITATIONS.md) for detailed information.

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Ollama** - Local LLM inference (Llama 3.1 8B)
- **PyPDF2** - PDF text extraction
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React** - UI library
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Server-Sent Events** - Real-time updates

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+** and npm
- **Ollama** installed and running
- **Llama 3.1 8B model** pulled in Ollama

## 🚀 Setup Instructions

### 1. Install Ollama

**Windows:**
```bash
# Download from https://ollama.ai/download/windows
# Run the installer
```

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull Llama 3.1 8B Model

```bash
ollama pull llama3.1:8b
```

Verify the model is installed:
```bash
ollama list
```

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

## 🏃 Running the Application

### Start Backend Server

```bash
# From backend directory with virtual environment activated
python main.py
```

Backend will run on: `http://localhost:8000`

API documentation available at: `http://localhost:8000/docs`

### Start Frontend Development Server

```bash
# From frontend directory
npm run dev
```

Frontend will run on: `http://localhost:5173`

The application will automatically open in your browser.

## 📖 Usage

1. **Choose Input Method**
   - **Upload PDF** (Recommended): Click "📄 Upload PDF" and select your research paper PDF file
   - **Paste Text**: Click "📝 Paste Text" and paste paper content directly
   - Or use "Load Sample Paper" to try with demo content

2. **Upload Your Research Paper**
   - Select a PDF file from your computer
   - The app will automatically extract text from the PDF
   - Supported format: PDF files only

3. **Generate Study Guide**
   - Click the "🚀 Generate Study Guide" button
   - Watch the 4-agent workflow progress in real-time

4. **Explore Results**
   - **Summaries Tab**: View section-by-section summaries
   - **Quiz Tab**: Take an interactive quiz to test understanding
   - **Study Guide Tab**: Access the complete study guide with tips

5. **Track Progress**
   - Real-time progress indicators show which agent is active
   - Progress bar updates as each agent completes (25% → 50% → 75% → 100%)

## 🎥 Demo Video Features

The UI is optimized for demonstration videos with:
- Large, clear progress indicators
- Smooth animations and transitions
- Color-coded agent status (pending → processing → complete)
- Visual confirmation checkmarks
- Clean, professional design
- Typical workflow completes in under 60 seconds

## 📁 Project Structure

```
ResearchPaperAgent/
├── backend/
│   ├── agents.py          # 4 AI agent classes with distinct prompts
│   ├── main.py            # FastAPI app with SSE endpoint
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentProgress.jsx      # Real-time progress tracker
│   │   │   ├── SummaryDisplay.jsx     # Section summaries display
│   │   │   ├── QuizInterface.jsx      # Interactive quiz component
│   │   │   └── StudyGuideDisplay.jsx  # Complete study guide
│   │   ├── App.jsx        # Main application component
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind imports
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

## 🔧 API Endpoints

### `POST /api/process-paper-pdf`
Process research paper PDF through 4-agent workflow with SSE streaming.

**Request:** Multipart form data with PDF file
- Field name: `file`
- Content-Type: `multipart/form-data`

**Response:** Server-Sent Events stream with progress updates

### `POST /api/process-paper`
Process research paper text through 4-agent workflow with SSE streaming.

**Request:**
```json
{
  "paper_text": "Your research paper text here..."
}
```

**Response:** Server-Sent Events stream with progress updates

**Event Format (both endpoints):**
```json
{
  "agent": 1,
  "status": "processing|complete|error",
  "message": "Agent 1: Extracting sections...",
  "data": {...}
}
```

### `GET /api/health`
Health check endpoint.

### `GET /`
API information and documentation.

## 🎨 Customization

### Modify Agent Prompts
Edit system prompts in `backend/agents.py` to customize how each agent behaves.

### Adjust UI Styling
Modify Tailwind classes in component files or update `tailwind.config.js` for theme changes.

### Change Model
Update the model name in `agents.py`:
```python
response = ollama.chat(
    model='llama3.1:8b',  # Change to any Ollama model
    ...
)
```

## 🐛 Troubleshooting

### "Agent 1 failed: Expecting value" or JSON parsing errors
This usually means the LLM returned malformed JSON. Solutions:

1. **Test your setup first:**
```bash
cd backend
python test_agent.py
```
This will show you the raw LLM output and help identify the issue.

2. **Try with smaller papers first** - Start with 5-10 page papers
3. **Use text mode** instead of PDF if extraction is problematic
4. **Restart Ollama** if it's been running a long time:
```bash
# Stop Ollama
ollama stop

# Restart it
ollama serve
```

5. **Check Ollama health:**
```bash
curl http://localhost:8000/api/health
```

### PDF extraction issues with large papers
- The app limits processing to first 50 pages for large PDFs
- For very large papers (>30 pages), consider extracting specific sections manually
- Alternative: Use the "Paste Text" mode with just the relevant sections

### "Connection Error" when processing paper
- Ensure Ollama is running: `ollama serve`
- Verify model is installed: `ollama list`
- Check if llama3.1:8b is available

### Backend CORS errors
- Backend must run on port 8000
- Frontend must run on port 5173
- Check CORS settings in `backend/main.py`

### Frontend not connecting to backend
- Verify backend URL in `App.jsx` is `http://localhost:8000`
- Check browser console for detailed errors
- Ensure both servers are running

### Slow processing
- First run may be slower as model loads (can take 2-3 minutes for first request)
- Consider using a smaller model for faster demos
- Processing time varies with paper length
- 35-page PDF may take 3-5 minutes to process

## 📝 Notes

- **Local Processing**: All AI processing happens on your machine via Ollama
- **No API Keys Required**: No external API calls or subscription needed
- **Privacy**: Your research papers never leave your computer
- **Model Size**: Llama 3.1 8B requires ~4.7GB disk space and ~8GB RAM

## 🤝 Contributing

This is an academic demo project. Feel free to fork and modify for your own use cases.

## 📄 License

See LICENSE file for details.

## 🎓 Academic Use

This project demonstrates:
- Sequential multi-agent AI workflows
- Real-time streaming with Server-Sent Events
- Local LLM integration with Ollama
- Modern full-stack development with FastAPI + React
- Prompt engineering for specific AI agent roles

Perfect for AI/ML course demonstrations, research presentations, or educational videos showing practical agentic AI applications.

---

**Built with ❤️ for demonstrating practical AI agent workflows**
