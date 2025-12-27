import re
import html

def sanitize_string(input_str: str, max_length: int = 1000) -> str:
    """
    Sanitize a string by:
    - Escaping HTML entities
    - Removing potentially dangerous characters
    - Limiting length
    - Stripping whitespace
    """
    if not isinstance(input_str, str):
        raise ValueError("Input must be a string")
    
    # Strip and limit length
    sanitized = input_str.strip()[:max_length]
    
    # Escape HTML
    sanitized = html.escape(sanitized)
    
    # Remove any remaining potentially dangerous chars (e.g., for prompts)
    # Allow alphanumeric, spaces, basic punctuation
    sanitized = re.sub(r'[^\w\s\.,!?\-\'\"]', '', sanitized)
    
    return sanitized

def validate_iata(iata: str) -> str:
    """Validate IATA code: 3 uppercase letters."""
    if not re.match(r'^[A-Z]{3}$', iata):
        raise ValueError("Invalid IATA code")
    return iata

def validate_city(city: str) -> str:
    """Validate city name: alphanumeric, spaces, hyphens, max 100 chars."""
    if not re.match(r'^[A-Za-z\s\-]{1,100}$', city):
        raise ValueError("Invalid city name")
    return city