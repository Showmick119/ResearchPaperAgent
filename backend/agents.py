"""
AI Agent definitions for the Research Paper Study Assistant.
Each agent has a distinct role in the sequential workflow.
"""

import ollama
import json
from typing import Dict, Any


class Agent1_SectionExtractor:
    """
    Agent 1: Section Extractor
    Parses research paper text and identifies key sections.
    """
    
    @staticmethod
    def extract_sections(paper_text: str) -> Dict[str, Any]:
        """
        Extract sections from research paper text.
        Returns structured JSON with identified sections.
        """
        system_prompt = """You are a section extraction agent specializing in academic research papers.

Your task is to parse the provided research paper text and identify the following sections:
- Abstract
- Introduction
- Methods (or Methodology)
- Results
- Discussion
- Conclusion

Extract ONLY the first 500 characters of each section. If a section is not present, write "Not Found".

YOU MUST return ONLY a valid JSON object with this EXACT structure (no additional text):
{
  "Abstract": "text here or Not Found",
  "Introduction": "text here or Not Found",
  "Methods": "text here or Not Found",
  "Results": "text here or Not Found",
  "Discussion": "text here or Not Found",
  "Conclusion": "text here or Not Found"
}

CRITICAL RULES:
1. Return ONLY the JSON object
2. No explanations before or after
3. No markdown code fences
4. Must be valid parseable JSON"""

        try:
            response = ollama.chat(
                model='llama3.1:8b',
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f"Extract sections from this research paper:\n\n{paper_text[:15000]}"}  # Limit to first 15k chars
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            # Clean up markdown code blocks if present
            if '```json' in result_text:
                start = result_text.find('```json') + 7
                end = result_text.rfind('```')
                result_text = result_text[start:end].strip()
            elif result_text.startswith('```'):
                lines = result_text.split('\n')
                result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            # Remove any text before first { or after last }
            if '{' in result_text and '}' in result_text:
                start_idx = result_text.find('{')
                end_idx = result_text.rfind('}') + 1
                result_text = result_text[start_idx:end_idx]
            
            sections = json.loads(result_text)
            return {
                "success": True,
                "sections": sections,
                "agent": "Agent 1: Section Extractor"
            }
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}. LLM may have returned invalid JSON. Try a shorter paper or use text mode.",
                "agent": "Agent 1: Section Extractor"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Error: {str(e)}",
                "agent": "Agent 1: Section Extractor"
            }


class Agent2_Summarizer:
    """
    Agent 2: Summarizer
    Generates concise 2-3 sentence summaries for each section.
    """
    
    @staticmethod
    def summarize_sections(sections: Dict[str, str]) -> Dict[str, Any]:
        """
        Create summaries for each extracted section.
        """
        system_prompt = """You are a summarization agent specializing in academic content.

Your task is to generate concise, clear summaries for each section of a research paper.
Each summary should be 2-3 sentences that capture the main points.

You will receive sections from a research paper. For each section that contains actual content (not "Not Found"), 
create a focused summary.

Return your response as a valid JSON object with this structure:
{
  "Abstract": "2-3 sentence summary",
  "Introduction": "2-3 sentence summary",
  "Methods": "2-3 sentence summary",
  "Results": "2-3 sentence summary",
  "Discussion": "2-3 sentence summary",
  "Conclusion": "2-3 sentence summary"
}

If a section was "Not Found", write "Section not available in paper" for that summary.

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting."""

        try:
            sections_text = json.dumps(sections, indent=2)
            
            response = ollama.chat(
                model='llama3.1:8b',
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f"Summarize these research paper sections:\n\n{sections_text}"}
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            # Clean up markdown code blocks if present
            if '```json' in result_text:
                start = result_text.find('```json') + 7
                end = result_text.rfind('```')
                result_text = result_text[start:end].strip()
            elif result_text.startswith('```'):
                lines = result_text.split('\n')
                result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            # Remove any text before first { or after last }
            if '{' in result_text and '}' in result_text:
                start_idx = result_text.find('{')
                end_idx = result_text.rfind('}') + 1
                result_text = result_text[start_idx:end_idx]
            
            summaries = json.loads(result_text)
            return {
                "success": True,
                "summaries": summaries,
                "agent": "Agent 2: Summarizer"
            }
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}. LLM returned invalid JSON.",
                "agent": "Agent 2: Summarizer"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Agent 2: Summarizer"
            }


class Agent3_QuizGenerator:
    """
    Agent 3: Quiz Generator
    Creates multiple choice questions based on summaries.
    """
    
    @staticmethod
    def generate_quiz(summaries: Dict[str, str]) -> Dict[str, Any]:
        """
        Generate 5-8 multiple choice questions from summaries.
        """
        system_prompt = """You are a quiz generation agent specializing in academic assessment.

Your task is to create 5-8 multiple choice questions based on research paper summaries.
Each question should:
- Test understanding of key concepts
- Have 4 answer options (A, B, C, D)
- Have exactly one correct answer
- Be clear and unambiguous

Return your response as a valid JSON object with this structure:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": {
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      },
      "correct_answer": "A",
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

Create between 5-8 questions covering different sections of the paper.

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting."""

        try:
            summaries_text = json.dumps(summaries, indent=2)
            
            response = ollama.chat(
                model='llama3.1:8b',
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f"Create quiz questions from these summaries:\n\n{summaries_text}"}
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            # Clean up markdown code blocks if present
            if '```json' in result_text:
                start = result_text.find('```json') + 7
                end = result_text.rfind('```')
                result_text = result_text[start:end].strip()
            elif result_text.startswith('```'):
                lines = result_text.split('\n')
                result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            # Remove any text before first { or after last }
            if '{' in result_text and '}' in result_text:
                start_idx = result_text.find('{')
                end_idx = result_text.rfind('}') + 1
                result_text = result_text[start_idx:end_idx]
            
            quiz_data = json.loads(result_text)
            return {
                "success": True,
                "quiz": quiz_data,
                "agent": "Agent 3: Quiz Generator"
            }
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}. LLM returned invalid JSON.",
                "agent": "Agent 3: Quiz Generator"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Agent 3: Quiz Generator"
            }


class Agent4_StudyGuideBuilder:
    """
    Agent 4: Study Guide Builder
    Combines summaries and quiz into formatted study guide with study tips.
    """
    
    @staticmethod
    def build_study_guide(summaries: Dict[str, str], quiz: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a comprehensive study guide with summaries, quiz, and study tips.
        """
        system_prompt = """You are a study guide formatting agent specializing in educational content design.

Your task is to create a comprehensive study guide that combines:
1. Section summaries from a research paper
2. Quiz questions for self-assessment
3. Personalized study tips for mastering the material

Generate 5-7 actionable study tips that help students effectively learn from this research paper.
Tips should be specific to academic paper comprehension and retention.

Return your response as a valid JSON object with this structure:
{
  "title": "Study Guide: [Infer paper topic from summaries]",
  "study_tips": [
    "Tip 1: Specific actionable advice",
    "Tip 2: Another specific tip",
    "... 5-7 tips total"
  ],
  "sections_overview": "2-3 sentence overview of what this paper covers",
  "key_takeaways": [
    "Main takeaway 1",
    "Main takeaway 2",
    "Main takeaway 3"
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting."""

        try:
            combined_data = {
                "summaries": summaries,
                "quiz_question_count": len(quiz.get('questions', []))
            }
            combined_text = json.dumps(combined_data, indent=2)
            
            response = ollama.chat(
                model='llama3.1:8b',
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': f"Create a study guide from this data:\n\n{combined_text}"}
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            # Clean up markdown code blocks if present
            if '```json' in result_text:
                start = result_text.find('```json') + 7
                end = result_text.rfind('```')
                result_text = result_text[start:end].strip()
            elif result_text.startswith('```'):
                lines = result_text.split('\n')
                result_text = '\n'.join(lines[1:-1]) if len(lines) > 2 else result_text
            
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            # Remove any text before first { or after last }
            if '{' in result_text and '}' in result_text:
                start_idx = result_text.find('{')
                end_idx = result_text.rfind('}') + 1
                result_text = result_text[start_idx:end_idx]
            
            guide_data = json.loads(result_text)
            
            # Combine everything into final study guide
            final_guide = {
                "success": True,
                "study_guide": {
                    **guide_data,
                    "summaries": summaries,
                    "quiz": quiz
                },
                "agent": "Agent 4: Study Guide Builder"
            }
            
            return final_guide
            
        except json.JSONDecodeError as e:
            return {
                "success": False,
                "error": f"JSON parsing error: {str(e)}. LLM returned invalid JSON.",
                "agent": "Agent 4: Study Guide Builder"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Agent 4: Study Guide Builder"
            }
