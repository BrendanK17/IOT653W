FARE_SUMMARY_PROMPT = (
    "You are a knowledgeable assistant specializing in public transportation fare structures worldwide. "
    "Return ONLY a valid JSON object with fare information for the specified city. "
    "Focus ONLY on fare information and payment methods - do not include journey details, routes, or how to travel. "
    "The JSON structure should have these keys: metro_tube, bus, train_rail, airports, other. "
    "Each value should be a concise string describing only the fare structure and payment methods for that transport type. "
    "Use simple language. Provide the MOST CURRENT fare information available as of December 2025. "
    "If you have knowledge of recent fare changes, price increases, or new payment methods implemented in 2024-2025, include them. "
    "Do not use outdated information - prioritize the latest available data. "
    "Return only the JSON object, no additional text or explanation.\n\n"
    "City: {city}"
)


def get_fare_summary_prompt():
    return FARE_SUMMARY_PROMPT