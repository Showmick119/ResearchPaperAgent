"""Test the full 4-agent workflow"""

import PyPDF2
import json
from agents import Agent1_SectionExtractor, Agent2_Summarizer, Agent3_QuizGenerator, Agent4_StudyGuideBuilder

print("="*80)
print("TESTING FULL 4-AGENT WORKFLOW")
print("="*80)

# Extract paper
print("\nExtracting PDF...")
pdf = PyPDF2.PdfReader('../paper/SamayPaper.pdf')
text = ''
for page in pdf.pages:
    text += page.extract_text() + '\n\n'
print(f"Extracted {len(text)} characters")

# Agent 1
print("\n" + "="*80)
print("AGENT 1: Section Extraction")
print("="*80)
result1 = Agent1_SectionExtractor.extract_sections(text)
if not result1.get('success'):
    print(f"FAILED: {result1.get('error')}")
    exit(1)
sections = result1['sections']
print(f"SUCCESS: Found {len([s for s in sections.values() if s != 'Not Found'])} sections")

# Agent 2
print("\n" + "="*80)
print("AGENT 2: Summarization")
print("="*80)
result2 = Agent2_Summarizer.summarize_sections(sections)
if not result2.get('success'):
    print(f"FAILED: {result2.get('error')}")
    exit(1)
summaries = result2['summaries']
print(f"SUCCESS: Created summaries")
print(f"Abstract summary length: {len(summaries.get('Abstract', ''))}")

# Agent 3
print("\n" + "="*80)
print("AGENT 3: Quiz Generation")
print("="*80)
result3 = Agent3_QuizGenerator.generate_quiz(summaries)
if not result3.get('success'):
    print(f"FAILED: {result3.get('error')}")
    exit(1)
quiz = result3['quiz']
print(f"SUCCESS: Generated {len(quiz.get('questions', []))} questions")

# Agent 4
print("\n" + "="*80)
print("AGENT 4: Study Guide")
print("="*80)
result4 = Agent4_StudyGuideBuilder.build_study_guide(summaries, quiz)
if not result4.get('success'):
    print(f"FAILED: {result4.get('error')}")
    exit(1)
print("SUCCESS: Study guide created")

print("\n" + "="*80)
print("ALL 4 AGENTS COMPLETED SUCCESSFULLY!")
print("="*80)
print("\nSample quiz question:")
if quiz.get('questions'):
    q = quiz['questions'][0]
    print(f"Q: {q['question']}")
    print(f"A: {q['options']['A']}")
    print(f"Correct: {q['correct_answer']}")

