"""
AI Agent definitions for the Research Paper Study Assistant.
Each agent has a distinct role in the sequential workflow.
"""

import ollama
import json
from typing import Dict, Any
from demo_config import ENHANCED_PROMPTS, MODEL_CONFIG
from simple_extractor import extract_sections_simple


class Agent1_SectionExtractor:
    """
    Agent 1: Section Extractor
    Parses research paper text and identifies key sections.
    """
    
    @staticmethod
    def _find_section_boundaries(paper_text: str) -> Dict[str, tuple]:
        """
        Find approximate boundaries of sections in the paper.
        Returns dict with section names and (start, end) indices.
        """
        import re
        
        # Common section headers (case-insensitive)
        section_patterns = {
            'Abstract': r'\b(abstract|summary)\b',
            'Introduction': r'\b(introduction|background)\b',
            'Methods': r'\b(methods?|methodology|materials?\s+and\s+methods?)\b',
            'Results': r'\b(results?|findings?|results?\s+and\s+discussion)\b',
            'Conclusion': r'\b(conclusions?|concluding\s+remarks?|summary\s+and\s+conclusions?)\b'
        }
        
        boundaries = {}
        text_lower = paper_text.lower()
        
        for section, pattern in section_patterns.items():
            matches = list(re.finditer(pattern, text_lower))
            if matches:
                # Take first match as section start
                start = matches[0].start()
                boundaries[section] = start
        
        return boundaries
    
    @staticmethod
    def extract_sections(paper_text: str) -> Dict[str, Any]:
        """
        Extract sections from research paper text.
        Uses rule-based extraction for reliability in demos.
        Returns structured JSON with identified sections.
        """
        
        try:
            # Use simple rule-based extractor for demo reliability
            print("\n" + "="*80)
            print("Using rule-based section extraction for reliability...")
            print("="*80 + "\n")
            
            sections = extract_sections_simple(paper_text)
            
            print(f"Extracted sections: {[k for k, v in sections.items() if v != 'Not Found']}")
            
            return {
                "success": True,
                "sections": sections,
                "agent": "Agent 1: Section Extractor"
            }
        except Exception as e:
            print(f"Simple extraction failed: {e}")
            print("Falling back to LLM extraction...")
        
        # Fallback to LLM if simple extraction fails
        system_prompt = ENHANCED_PROMPTS["section_extractor"]

        try:
            # Strategy: For very large papers, find section boundaries first
            # Then extract each section with surrounding context
            
            paper_length = len(paper_text)
            
            if paper_length > 100000:  # Very large paper (>100k chars)
                # Use smart extraction: find sections and extract each with context
                boundaries = Agent1_SectionExtractor._find_section_boundaries(paper_text)
                
                # Create a focused excerpt with all section headers and surrounding text
                excerpts = []
                sorted_sections = sorted(boundaries.items(), key=lambda x: x[1])
                
                for i, (section, start) in enumerate(sorted_sections):
                    # Extract from section start to next section (or end)
                    if i < len(sorted_sections) - 1:
                        end = sorted_sections[i + 1][1]
                    else:
                        end = len(paper_text)
                    
                    # Take section content (max 8000 chars per section)
                    section_text = paper_text[start:min(start + 8000, end)]
                    excerpts.append(f"=== {section} ===\n{section_text}")
                
                extraction_text = "\n\n".join(excerpts)
            else:
                # For smaller papers, use more content
                extraction_text = paper_text[:80000]  # Increased limit
            
            # Use very explicit format instruction
            user_message = f"""Extract these exact sections from the paper and return as JSON with these exact keys:

Required JSON format:
{{
  "Abstract": "full abstract text or Not Found",
  "Introduction": "full introduction text or Not Found",
  "Methods": "full methods/methodology text or Not Found",
  "Results": "full results text or Not Found",
  "Conclusion": "full conclusion text or Not Found"
}}

Paper text:
{extraction_text[:30000]}"""
            
            response = ollama.chat(
                **MODEL_CONFIG,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_message}
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            # DEBUG: Print raw response
            print("\n" + "="*80)
            print("AGENT 1 RAW RESPONSE:")
            print(result_text[:500])
            print("="*80 + "\n")
            
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
            
            print("AGENT 1 CLEANED RESPONSE:")
            print(result_text[:500])
            print("="*80 + "\n")
            
            raw_sections = json.loads(result_text)
            
            # Post-process: ensure we have the right keys
            sections = {
                "Abstract": "Not Found",
                "Introduction": "Not Found",
                "Methods": "Not Found",
                "Results": "Not Found",
                "Conclusion": "Not Found"
            }
            
            # Try to map whatever the LLM returned to our expected format
            for key, value in raw_sections.items():
                key_lower = key.lower()
                if isinstance(value, str):
                    if 'abstract' in key_lower:
                        sections["Abstract"] = value
                    elif 'intro' in key_lower:
                        sections["Introduction"] = value
                    elif 'method' in key_lower:
                        sections["Methods"] = value
                    elif 'result' in key_lower or 'experiment' in key_lower:
                        sections["Results"] = value
                    elif 'conclu' in key_lower:
                        sections["Conclusion"] = value
            
            print(f"Mapped sections: {list(sections.keys())}")
            
            return {
                "success": True,
                "sections": sections,
                "agent": "Agent 1: Section Extractor"
            }
            
        except json.JSONDecodeError as e:
            print(f"\n!!! JSON PARSE ERROR: {str(e)}")
            print(f"!!! Problematic text: {result_text[:200]}...")
            
            # FALLBACK: Try to extract sections manually from the raw text
            try:
                import re
                sections_fallback = {
                    "Abstract": "Not Found",
                    "Introduction": "Not Found",
                    "Methods": "Not Found",
                    "Results": "Not Found",
                    "Conclusion": "Not Found"
                }
                
                # If LLM mentioned sections in prose, try to extract
                lower_text = result_text.lower()
                if "abstract" in lower_text:
                    sections_fallback["Abstract"] = "Found but could not parse properly"
                
                print(f"!!! Using fallback extraction")
                
                return {
                    "success": False,
                    "error": f"JSON parsing error: {str(e)}. The LLM returned: '{result_text[:100]}...'. This might be due to the model not following JSON format. Try restarting Ollama or using a different paper.",
                    "agent": "Agent 1: Section Extractor"
                }
            except:
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
        system_prompt = ENHANCED_PROMPTS["summarizer"]

        try:
            sections_text = json.dumps(sections, indent=2)
            
            # Create explicit instruction with actual sections
            user_prompt = f"""Summarize ALL of these sections from the research paper. Return JSON with these EXACT keys:

{{"Abstract": "4-6 sentence detailed summary", "Introduction": "5-7 sentence summary", "Methods": "6-8 sentence summary", "Results": "8-10 sentence summary with numbers and findings", "Conclusion": "4-6 sentence summary"}}

Here are the sections to summarize:

ABSTRACT:
{sections.get('Abstract', 'Not Found')[:3000]}

INTRODUCTION:
{sections.get('Introduction', 'Not Found')[:3000]}

METHODS:
{sections.get('Methods', 'Not Found')[:3000]}

RESULTS:
{sections.get('Results', 'Not Found')[:3000]}

CONCLUSION:
{sections.get('Conclusion', 'Not Found')[:3000]}

Return detailed summaries for each section in the exact JSON format specified."""

            response = ollama.chat(
                **MODEL_CONFIG,
                messages=[
                    {'role': 'system', 'content': "You are summarizing a research paper. Return only JSON."},
                    {'role': 'user', 'content': user_prompt}
                ]
            )
            
            result_text = response['message']['content'].strip()
            
            print("\n" + "="*80)
            print("AGENT 2 RAW RESPONSE (first 500 chars):")
            print(result_text[:500])
            print("="*80 + "\n")
            
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
            
            print("AGENT 2 CLEANED (first 500 chars):")
            print(result_text[:500])
            print("="*80 + "\n")
            
            raw_summaries = json.loads(result_text)
            
            # Normalize keys to match expected format
            summaries = {
                "Abstract": "",
                "Introduction": "",
                "Methods": "",
                "Results": "",
                "Conclusion": ""
            }
            
            # Map whatever keys LLM returned to our expected keys
            for key, value in raw_summaries.items():
                key_lower = key.lower()
                if isinstance(value, str) and len(value) > 10:  # Valid summary
                    if 'abstract' in key_lower:
                        summaries["Abstract"] = value
                    elif 'intro' in key_lower:
                        summaries["Introduction"] = value
                    elif 'method' in key_lower:
                        summaries["Methods"] = value
                    elif 'result' in key_lower:
                        summaries["Results"] = value
                    elif 'conclu' in key_lower:
                        summaries["Conclusion"] = value
            
            # Mark sections that didn't get summaries
            for key in summaries:
                if not summaries[key]:
                    summaries[key] = "Section not available in paper"
            
            print(f"Normalized summaries: {[(k, len(v)) for k, v in summaries.items()]}")
            
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
        system_prompt = ENHANCED_PROMPTS["quiz_generator"]

        try:
            # Create explicit quiz instruction with paper content
            user_prompt = f"""Create 10 challenging multiple-choice questions about THIS SPECIFIC research paper.

Paper summaries:
ABSTRACT: {summaries.get('Abstract', '')[:500]}
INTRODUCTION: {summaries.get('Introduction', '')[:500]}
METHODS: {summaries.get('Methods', '')[:500]}
RESULTS: {summaries.get('Results', '')[:500]}
CONCLUSION: {summaries.get('Conclusion', '')[:500]}

Create questions that test understanding of:
- The specific model/method proposed (LPTM, adaptive segmentation, etc.)
- Specific results and metrics mentioned
- The methodology and technical approach
- Key contributions and innovations
- Application domains

Return JSON format:
{{"questions": [{{"question": "Specific question about the paper?", "options": {{"A": "option", "B": "option", "C": "option", "D": "option"}}, "correct_answer": "A", "explanation": "why"}}]}}

Make questions specific to THIS paper, not generic research paper questions."""

            response = ollama.chat(
                **MODEL_CONFIG,
                messages=[
                    {'role': 'system', 'content': "Create quiz questions about the research paper. Return only JSON."},
                    {'role': 'user', 'content': user_prompt}
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
                **MODEL_CONFIG,
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
