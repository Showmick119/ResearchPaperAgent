"""
Quick test to see what Agent 1 is returning
"""

import PyPDF2
import json
from agents import Agent1_SectionExtractor

# Extract paper
pdf = PyPDF2.PdfReader('../paper/SamayPaper.pdf')
text = ''
for page in pdf.pages[:10]:  # First 10 pages only for speed
    text += page.extract_text() + '\n\n'

print(f"Extracted {len(text)} characters from PDF")
print("\n" + "="*80)
print("Testing Agent 1...")
print("="*80 + "\n")

result = Agent1_SectionExtractor.extract_sections(text)

print("\n" + "="*80)
print("RESULT:")
print(json.dumps(result, indent=2)[:1000])
print("="*80)

