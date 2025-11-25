"""
Quick test script to debug Agent 1 JSON parsing issues
"""

import ollama
import json

def test_agent1():
    """Test Agent 1 with a simple input"""
    
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

    test_text = """
    Abstract
    
    This study examines machine learning in healthcare. We achieved 94% accuracy.
    
    Introduction
    
    Healthcare needs better diagnostics. Machine learning can help.
    
    Methods
    
    We used 5000 patients and trained neural networks.
    
    Results
    
    The model achieved 94% accuracy.
    """
    
    print("Calling Ollama...")
    response = ollama.chat(
        model='llama3.1:8b',
        messages=[
            {'role': 'system', 'content': system_prompt},
            {'role': 'user', 'content': f"Extract sections from this research paper:\n\n{test_text}"}
        ]
    )
    
    result_text = response['message']['content'].strip()
    print("\n=== RAW RESPONSE ===")
    print(result_text)
    print("\n=== END RAW RESPONSE ===\n")
    
    # Clean up
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
    
    print("=== CLEANED RESPONSE ===")
    print(result_text)
    print("\n=== END CLEANED RESPONSE ===\n")
    
    try:
        parsed = json.loads(result_text)
        print("✅ SUCCESS! Parsed JSON:")
        print(json.dumps(parsed, indent=2))
    except json.JSONDecodeError as e:
        print(f"❌ JSON PARSE ERROR: {e}")
        print(f"Attempted to parse: {result_text[:200]}...")

if __name__ == "__main__":
    test_agent1()

