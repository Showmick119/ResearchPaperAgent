"""
Demo Configuration - Simplified for reliability
"""

# Simple, working prompts
ENHANCED_PROMPTS = {
    "summarizer": """Summarize each section of the research paper in detail.

For each section, write a comprehensive summary (4-10 sentences) that includes:
- Key points and main ideas
- Technical details and methodology  
- Important results and findings
- Specific numbers, percentages, and metrics mentioned

Return as JSON:
{"Abstract":"summary","Introduction":"summary","Methods":"summary","Results":"summary","Conclusion":"summary"}

If section is "Not Found", write "Section not available in paper".""",

    "quiz_generator": """Create 10 challenging multiple-choice quiz questions about the research paper.

Each question should:
- Test understanding of specific concepts
- Include 4 options (A, B, C, D)
- Have one correct answer
- Include an explanation

Return as JSON:
{"questions":[{"question":"text?","options":{"A":"opt1","B":"opt2","C":"opt3","D":"opt4"},"correct_answer":"A","explanation":"why"}]}

Cover different aspects: methodology, results, contributions, technical details."""
}

# Ollama configuration  
MODEL_CONFIG = {
    "model": "llama3.1:8b",
    "format": "json",
    "options": {
        "temperature": 0.1,
        "top_p": 0.9,
        "top_k": 40
    }
}
