"""
Simple rule-based section extractor as fallback
Works reliably for standard research papers
"""

import re
from typing import Dict


def extract_sections_simple(text: str) -> Dict[str, str]:
    """
    Extract sections using simple pattern matching.
    This is more reliable than LLM for demo purposes.
    """
    
    sections = {
        "Abstract": "",
        "Introduction": "",
        "Methods": "",
        "Results": "",
        "Conclusion": ""
    }
    
    # Common section header patterns
    patterns = {
        "Abstract": [r'\bAbstract\b', r'\bSUMMARY\b'],
        "Introduction": [r'\b1\s*Introduction\b', r'\bIntroduction\b', r'\b1\.\s*Introduction\b'],
        "Methods": [r'\bMethods?\b', r'\bMethodology\b', r'\bMaterials? and Methods?\b', r'\b\d+\s*Methods?\b'],
        "Results": [r'\bResults?\b', r'\bExperiments?\b', r'\bEvaluation\b', r'\b\d+\s*Results?\b'],
        "Conclusion": [r'\bConclusions?\b', r'\bConcluding Remarks?\b', r'\b\d+\s*Conclusions?\b']
    }
    
    # Find all section positions
    section_positions = []
    
    for section_name, section_patterns in patterns.items():
        for pattern in section_patterns:
            matches = list(re.finditer(pattern, text, re.IGNORECASE))
            if matches:
                # Take first match
                pos = matches[0].start()
                section_positions.append((pos, section_name, matches[0].group()))
                break
    
    # Sort by position
    section_positions.sort(key=lambda x: x[0])
    
    # Extract text between sections
    for i, (pos, name, header) in enumerate(section_positions):
        # Find where this section ends (next section starts)
        if i < len(section_positions) - 1:
            next_pos = section_positions[i + 1][0]
            section_text = text[pos:next_pos]
        else:
            # Last section - take substantial amount
            section_text = text[pos:pos + 10000]  
        
        # Clean up: remove the header itself
        section_text = re.sub(header, '', section_text, count=1, flags=re.IGNORECASE)
        section_text = section_text.strip()
        
        # Limit length for each section
        if len(section_text) > 8000:
            section_text = section_text[:8000] + "..."
        
        sections[name] = section_text if section_text else "Not Found"
    
    # Mark sections that weren't found
    for key in sections:
        if not sections[key]:
            sections[key] = "Not Found"
    
    return sections

