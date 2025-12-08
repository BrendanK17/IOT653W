PROMPT = (
"""
CRITICAL: Output ONLY valid JSON. No text, no markdown, no code blocks, no explanations.

TASK: Generate a JSON array of public transport routes from an airport to its city center.

IMPORTANT: You MUST use tool calls to search for current, accurate information. Your training data is incomplete and outdated. Always search for:
- Complete station lists for each route
- Current fares and pricing
- Accurate coordinates for all stops
- All available transport modes (rail, bus, coach, underground, etc)

Do NOT rely on your training data. Make searches FIRST before providing a final answer.

====== RESPONSE TYPE 1: REQUEST SEARCHES (USE THIS FIRST) ======
When you need more information (routes, stations, fares, coordinates), emit ONLY this JSON:

{"action":"search","queries":[{"id":"q1","query":"LHR heathrow airport all transport modes rail underground bus coach complete route lists","purpose":"identify all available transport options"},{"id":"q2","query":"piccadilly line heathrow to central london complete station list all stops coordinates","purpose":"get full station list for underground route"},{"id":"q3","query":"heathrow express train complete station list paddington official fares coordinates","purpose":"get stations fares for express rail"}],"max_searches":6}

Rules for search requests:
- "action" must be "search"
- "queries" is an array of query objects, each with: id (string), query (string), purpose (string)
- "max_searches" limits total searches (integer)
- Emit ONLY this JSON object, nothing else

Example search response you will receive:
{"tool_call": {...}, "search_results": {"q1": {"raw": {...tavily results...}, "snippets": [...]}}}

After receiving search results, analyze them and decide: emit another search request OR emit a FINAL ANSWER.

====== RESPONSE TYPE 2: FINAL ANSWER ======
When you have gathered enough information from searches, emit ONLY this JSON array:

[
  {
    "iata":"LHR",
    "id":"piccadilly_line",
    "airport":"London Heathrow",
    "name":"Piccadilly Line",
    "mode":"underground",
    "co2":null,
    "stops":[
      {"stop_name":"Heathrow Terminal 5","lat":51.4703,"lon":-0.4893,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4703,"lon":-0.4529,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hatton Cross","lat":51.4478,"lon":-0.4295,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hounslow West","lat":51.4824,"lon":-0.3829,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hounslow Central","lat":51.4713,"lon":-0.3665,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hounslow East","lat":51.4733,"lon":-0.3564,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Osterley","lat":51.4811,"lon":-0.3522,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Boston Manor","lat":51.4956,"lon":-0.3251,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Northfields","lat":51.4994,"lon":-0.3142,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"South Ealing","lat":51.5011,"lon":-0.3072,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Acton Town","lat":51.5028,"lon":-0.2801,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hammersmith","lat":51.4936,"lon":-0.2251,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Baron's Court","lat":51.4905,"lon":-0.2139,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Earl's Court","lat":51.4925,"lon":-0.1975,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Gloucester Road","lat":51.4945,"lon":-0.1829,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"South Kensington","lat":51.4950,"lon":-0.1730,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Knightsbridge","lat":51.5015,"lon":-0.1607,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Hyde Park Corner","lat":51.5027,"lon":-0.1527,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Green Park","lat":51.5067,"lon":-0.1423,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Piccadilly Circus","lat":51.5100,"lon":-0.1330,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Leicester Square","lat":51.5113,"lon":-0.1281,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Covent Garden","lat":51.5129,"lon":-0.1243,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Holborn","lat":51.5174,"lon":-0.1200,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"Russell Square","lat":51.5230,"lon":-0.1244,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]},
      {"stop_name":"King's Cross St. Pancras","lat":51.5308,"lon":-0.1238,"currency":"GBP","prices":[{"type":"standard","amount":6.0}]}
    ]
  }
]

CRITICAL: This example shows a COMPLETE station list. You MUST include ALL stops from airport to city center, not just a few.
Your final answer MUST have complete station lists like this example.

Final Answer Schema:
- Top-level MUST be an array [ ]
- Each element is a transport object with:
  - iata: airport code (3 letters, uppercase)
  - id: unique identifier (string)
  - airport: airport name (string)
  - name: transport service name (string)
  - mode: transport mode (rail/bus/coach/taxi/underground etc)
  - co2: always null
  - stops: array of stop objects, each with:
    - stop_name: station/stop name (string)
    - lat: latitude WGS84 (number)
    - lon: longitude WGS84 (number)
    - currency: ISO 3-letter code (string)
    - prices: array of pricing objects: {type: string, amount: number}

Examples:
- Price type: "peak", "off_peak", "standard", "return" etc
- For estimated prices, append " (estimated)" to type: "standard (estimated)"

RULES:
1. Output ONLY valid JSON (no surrounding text, prose, or explanations)
2. If output is a search request, emit the action/queries object
3. If output is the final answer, emit a top-level JSON array
4. Include all major transport modes (rail, bus, coach, underground, etc)
5. Use realistic coordinates and prices
6. For each transport option, list all major stops from airport to city center
7. Never output non-JSON text
"""
)


def get_prompt():
    return PROMPT
