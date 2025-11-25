"""
FastAPI Backend for Research Paper Study Assistant
Implements 4-agent sequential workflow with real-time progress updates via SSE
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import asyncio
from typing import AsyncGenerator

from agents import (
    Agent1_SectionExtractor,
    Agent2_Summarizer,
    Agent3_QuizGenerator,
    Agent4_StudyGuideBuilder
)

app = FastAPI(title="Research Paper Study Assistant API")

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PaperRequest(BaseModel):
    """Request model for paper processing"""
    paper_text: str


async def process_paper_stream(paper_text: str) -> AsyncGenerator[str, None]:
    """
    Process paper through 4-agent workflow and stream progress updates.
    
    Each agent's progress is sent as Server-Sent Events (SSE) to the frontend
    for real-time UI updates.
    """
    
    try:
        # ========== AGENT 1: SECTION EXTRACTION ==========
        yield f"data: {json.dumps({'agent': 1, 'status': 'processing', 'message': 'Agent 1: Extracting sections...'})}\n\n"
        await asyncio.sleep(0.1)  # Ensure message is sent
        
        agent1_result = await asyncio.to_thread(
            Agent1_SectionExtractor.extract_sections,
            paper_text
        )
        
        if not agent1_result.get('success'):
            yield f"data: {json.dumps({'agent': 1, 'status': 'error', 'message': f'Agent 1 failed: {agent1_result.get(\"error\")}' })}\n\n"
            return
        
        sections = agent1_result['sections']
        yield f"data: {json.dumps({'agent': 1, 'status': 'complete', 'message': 'Agent 1: Sections extracted ✓', 'data': sections})}\n\n"
        await asyncio.sleep(0.5)  # Visual pause for demo
        
        
        # ========== AGENT 2: SUMMARIZATION ==========
        yield f"data: {json.dumps({'agent': 2, 'status': 'processing', 'message': 'Agent 2: Generating summaries...'})}\n\n"
        await asyncio.sleep(0.1)
        
        agent2_result = await asyncio.to_thread(
            Agent2_Summarizer.summarize_sections,
            sections
        )
        
        if not agent2_result.get('success'):
            yield f"data: {json.dumps({'agent': 2, 'status': 'error', 'message': f'Agent 2 failed: {agent2_result.get(\"error\")}' })}\n\n"
            return
        
        summaries = agent2_result['summaries']
        yield f"data: {json.dumps({'agent': 2, 'status': 'complete', 'message': 'Agent 2: Summaries created ✓', 'data': summaries})}\n\n"
        await asyncio.sleep(0.5)
        
        
        # ========== AGENT 3: QUIZ GENERATION ==========
        yield f"data: {json.dumps({'agent': 3, 'status': 'processing', 'message': 'Agent 3: Creating quiz questions...'})}\n\n"
        await asyncio.sleep(0.1)
        
        agent3_result = await asyncio.to_thread(
            Agent3_QuizGenerator.generate_quiz,
            summaries
        )
        
        if not agent3_result.get('success'):
            yield f"data: {json.dumps({'agent': 3, 'status': 'error', 'message': f'Agent 3 failed: {agent3_result.get(\"error\")}' })}\n\n"
            return
        
        quiz = agent3_result['quiz']
        yield f"data: {json.dumps({'agent': 3, 'status': 'complete', 'message': 'Agent 3: Quiz generated ✓', 'data': quiz})}\n\n"
        await asyncio.sleep(0.5)
        
        
        # ========== AGENT 4: STUDY GUIDE BUILDING ==========
        yield f"data: {json.dumps({'agent': 4, 'status': 'processing', 'message': 'Agent 4: Building study guide...'})}\n\n"
        await asyncio.sleep(0.1)
        
        agent4_result = await asyncio.to_thread(
            Agent4_StudyGuideBuilder.build_study_guide,
            summaries,
            quiz
        )
        
        if not agent4_result.get('success'):
            yield f"data: {json.dumps({'agent': 4, 'status': 'error', 'message': f'Agent 4 failed: {agent4_result.get(\"error\")}' })}\n\n"
            return
        
        study_guide = agent4_result['study_guide']
        yield f"data: {json.dumps({'agent': 4, 'status': 'complete', 'message': 'Agent 4: Study guide complete ✓', 'data': study_guide})}\n\n"
        await asyncio.sleep(0.5)
        
        
        # ========== FINAL RESULT ==========
        final_result = {
            'status': 'success',
            'sections': sections,
            'summaries': summaries,
            'quiz': quiz,
            'study_guide': study_guide
        }
        
        yield f"data: {json.dumps({'status': 'done', 'message': 'All agents complete! Study guide ready.', 'result': final_result})}\n\n"
        
    except Exception as e:
        yield f"data: {json.dumps({'status': 'error', 'message': f'Unexpected error: {str(e)}'})}\n\n"


@app.post("/api/process-paper")
async def process_paper(request: PaperRequest):
    """
    Main endpoint for processing research papers.
    Returns Server-Sent Events stream for real-time progress updates.
    
    Frontend connects to this endpoint and receives progress as each agent completes.
    """
    
    if not request.paper_text or len(request.paper_text.strip()) < 100:
        raise HTTPException(
            status_code=400,
            detail="Paper text is too short. Please provide a complete research paper."
        )
    
    return StreamingResponse(
        process_paper_stream(request.paper_text),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable buffering for nginx
        }
    )


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "Research Paper Study Assistant API is running",
        "agents": [
            "Agent 1: Section Extractor",
            "Agent 2: Summarizer", 
            "Agent 3: Quiz Generator",
            "Agent 4: Study Guide Builder"
        ]
    }


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "name": "Research Paper Study Assistant API",
        "version": "1.0.0",
        "description": "4-agent sequential workflow for processing research papers",
        "endpoints": {
            "POST /api/process-paper": "Process research paper through agent workflow",
            "GET /api/health": "Health check endpoint",
            "GET /": "This information page"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
