FARE_SUMMARY_PROMPT = (
    "You are a knowledgeable assistant specializing in public transportation fare structures worldwide. "
    "Return ONLY a valid JSON object with fare information for the specified city. "
    "Focus ONLY on fare information and payment methods - do not include journey details, routes, or how to travel. "
    "The JSON structure must include: "
    "'city': the city name in uppercase, "
    "'modes': an object with keys 'metro_tube', 'bus', 'coach', 'train_rail', 'other'. Each mode is an object with 'summary' (human-readable text) and 'payment' (object with 'allowed' and 'not_allowed' arrays of payment methods like 'oyster', 'contactless', 'paper_ticket', 'online', etc.), "
    "'airports': an object with 'terminals' as a subobject, keyed by airport IATA codes (e.g., 'LHR', 'STN'). Each terminal has 'services' as an array of objects, each with 'name' (service name) and 'payment' (same structure as above). "
    "Use simple language. Provide the MOST CURRENT fare information available as of December 2025. "
    "If you have knowledge of recent fare changes, price increases, or new payment methods implemented in 2024-2025, include them. "
    "Do not use outdated information - prioritize the latest available data. "
    "Return only the JSON object, no additional text or explanation.\n\n"
    "City: {city}"
)


def get_fare_summary_prompt():
    return FARE_SUMMARY_PROMPT