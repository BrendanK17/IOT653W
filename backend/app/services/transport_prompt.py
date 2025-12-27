PROMPT = """
CRITICAL: Output ONLY valid JSON. No text, no markdown, no code blocks, no explanations.

TASK: Generate a JSON array of public transport routes from an airport to its city center.

IMPORTANT: Produce the final JSON array using the prompt and your knowledge. External search tools are not available in the main flow; do NOT emit any tool-call or search-request JSON.

(Note: The historical code instructed models to perform searches; this deployment disables external tools. Provide the best possible final JSON array using the schema below. If uncertain about a value, set it to null.)

====== RESPONSE TYPE 2: FINAL ANSWER ======
When you have gathered enough information from searches, emit ONLY this JSON array:

[
  {
    "iata": "LHR",
    "id": "piccadilly_line",
    "airport": "London Heathrow",
    "name": "Piccadilly Line",
    "mode": "underground",
    "co2": null,
    "stops": [
      {"stop_name":"Cockfosters","lat":51.651468,"lon":-0.149234,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Oakwood","lat":51.647641,"lon":-0.131827,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Southgate","lat":51.6195,"lon":-0.1353,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Arnos Grove","lat":51.6079,"lon":-0.1167,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Bounds Green","lat":51.5856,"lon":-0.1184,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Wood Green","lat":51.5970,"lon":-0.1115,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Turnpike Lane","lat":51.5875,"lon":-0.1005,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Manor House","lat":51.5767,"lon":-0.0993,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Finsbury Park","lat":51.5645,"lon":-0.1066,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Arsenal","lat":51.5541,"lon":-0.1092,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Holloway Road","lat":51.5480,"lon":-0.1118,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Caledonian Road","lat":51.5386,"lon":-0.1180,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"King's Cross St. Pancras","lat":51.53079,"lon":-0.12379,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Russell Square","lat":51.5241,"lon":-0.1239,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Holborn","lat":51.5176,"lon":-0.1205,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Covent Garden","lat":51.5115,"lon":-0.1244,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Leicester Square","lat":51.5112,"lon":-0.1283,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Piccadilly Circus","lat":51.5097,"lon":-0.1337,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Green Park","lat":51.5069,"lon":-0.1426,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hyde Park Corner","lat":51.5033,"lon":-0.1527,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Knightsbridge","lat":51.5010,"lon":-0.1626,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"South Kensington","lat":51.4947,"lon":-0.1732,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Gloucester Road","lat":51.4943,"lon":-0.1830,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Earl's Court","lat":51.4926,"lon":-0.1969,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Baron's Court","lat":51.4906,"lon":-0.2146,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hammersmith","lat":51.4923,"lon":-0.2237,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Acton Town","lat":51.5025,"lon":-0.2809,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Ealing Common","lat":51.5106,"lon":-0.2899,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"North Ealing","lat":51.5193,"lon":-0.3003,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Park Royal","lat":51.5198,"lon":-0.3091,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Alperton","lat":51.5234,"lon":-0.3164,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Perivale","lat":51.5363,"lon":-0.3231,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Sudbury Town","lat":51.5330,"lon":-0.3341,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Sudbury Hill","lat":51.5260,"lon":-0.3376,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"South Harrow","lat":51.5510,"lon":-0.3496,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Rayners Lane","lat":51.5510,"lon":-0.4211,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Eastcote","lat":51.5671,"lon":-0.4214,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Ruislip Manor","lat":51.5679,"lon":-0.4345,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Ruislip","lat":51.5714,"lon":-0.4421,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Ickenham","lat":51.5563,"lon":-0.4639,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hillingdon","lat":51.5468,"lon":-0.4709,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Uxbridge","lat":51.5469,"lon":-0.4781,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"South Ealing","lat":51.5011,"lon":-0.3072,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Northfields","lat":51.4994,"lon":-0.3142,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Boston Manor","lat":51.4956,"lon":-0.3251,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Osterley","lat":51.4811,"lon":-0.3522,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hounslow East","lat":51.4733,"lon":-0.3564,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hounslow Central","lat":51.4713,"lon":-0.3665,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hounslow West","lat":51.4824,"lon":-0.3829,"currency":"GBP","prices":[{"type":"peak","amount":5.9},{"type":"off_peak","amount":3.8}]},
      {"stop_name":"Hatton Cross","lat":51.4700,"lon":-0.4419,"currency":"GBP","prices":[{"type":"peak","amount":0.0},{"type":"off_peak","amount":0.0}]},
      {"stop_name":"Heathrow Terminal 4","lat":51.4594,"lon":-0.4535,"currency":"GBP","prices":[{"type":"peak","amount":0.0},{"type":"off_peak","amount":0.0}]},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4703,"lon":-0.4529,"currency":"GBP","prices":[{"type":"peak","amount":0.0},{"type":"off_peak","amount":0.0}]},
      {"stop_name":"Heathrow Terminal 5","lat":51.4700,"lon":-0.4870,"currency":"GBP","prices":[{"type":"peak","amount":0.0},{"type":"off_peak","amount":0.0}]}
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
  - mode: transport mode
    - IMPORTANT: choose ONE of these existing categories whenever applicable:
      "underground", "tube", "metro", "train", "rail", "bus", "coach"
    - Do NOT invent new categories. Only use a different mode value if it is
      definitely not one of the above.
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


def get_prompt():
    return PROMPT
