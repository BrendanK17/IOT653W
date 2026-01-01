PROMPT = """
CRITICAL: Output ONLY valid JSON. No text, no markdown, no code blocks, no explanations.

TASK: Generate a JSON array of public transport routes from an airport to its city center.

IMPORTANT: Produce the final JSON array using the prompt and your knowledge. External search tools are not available; provide the best possible final JSON array using the schema below. If uncertain about a value, set it to null.

====== RESPONSE TYPE: FINAL ANSWER ======
Emit ONLY this JSON array with MULTIPLE transport options:

[
  {
    "iata": "LHR",
    "id": "heathrow_express",
    "airport": "London Heathrow",
    "name": "Heathrow Express",
    "mode": "train",
    "duration": 15,
    "co2": null,
    "url": "https://www.heathrowexpress.com/ticket-fares",
    "hasFirstClass": true,
    "stops": [
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"standard","amount":0}],"branch_id":"T5-branch"},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"standard","amount":0}],"branch_id":"T4-branch"},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"standard","amount":0}],"branch_id":null},
      {"stop_name":"London Paddington","lat":51.5155,"lon":-0.1754,"currency":"GBP","prices":[{"type":"standard","amount":25}],"branch_id":null}
    ]
  },
  {
    "iata": "LHR",
    "id": "elizabeth_line",
    "airport": "London Heathrow",
    "name": "Elizabeth Line",
    "mode": "train",
    "duration": 30,
    "co2": null,
    "url": "https://tfl.gov.uk/fares/tickets",
    "hasFirstClass": false,
    "stops": [
      {"stop_name":"Reading","lat":51.3739,"lon":-0.9716,"currency":"GBP","prices":[{"type":"standard","amount":17.50}],"branch_id":"reading-branch"},
      {"stop_name":"Twyford","lat":51.4124,"lon":-0.8299,"currency":"GBP","prices":[{"type":"standard","amount":15.50}],"branch_id":"reading-branch"},
      {"stop_name":"Maidenhead","lat":51.5195,"lon":-0.7223,"currency":"GBP","prices":[{"type":"standard","amount":14.00}],"branch_id":"reading-branch"},
      {"stop_name":"Taplow","lat":51.5354,"lon":-0.6761,"currency":"GBP","prices":[{"type":"standard","amount":13.50}],"branch_id":"reading-branch"},
      {"stop_name":"Burnham","lat":51.5145,"lon":-0.6265,"currency":"GBP","prices":[{"type":"standard","amount":13.00}],"branch_id":"reading-branch"},
      {"stop_name":"Slough","lat":51.5079,"lon":-0.5936,"currency":"GBP","prices":[{"type":"standard","amount":12.50}],"branch_id":"reading-branch"},
      {"stop_name":"Langley","lat":51.5060,"lon":-0.7113,"currency":"GBP","prices":[{"type":"standard","amount":12.00}],"branch_id":"reading-branch"},
      {"stop_name":"Iver","lat":51.5166,"lon":-0.6405,"currency":"GBP","prices":[{"type":"standard","amount":11.50}],"branch_id":"reading-branch"},
      {"stop_name":"West Drayton","lat":51.5094,"lon":-0.4633,"currency":"GBP","prices":[{"type":"standard","amount":11.00}],"branch_id":"reading-branch"},
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":"terminal-T5"},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":"terminal-T4"},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Hayes & Harlington","lat":51.4469,"lon":-0.4325,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Southall","lat":51.5083,"lon":-0.3741,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Hanwell","lat":51.5172,"lon":-0.3393,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"West Ealing","lat":51.5055,"lon":-0.3127,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Ealing Broadway","lat":51.5048,"lon":-0.3075,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Acton Main Line","lat":51.5079,"lon":-0.2654,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Paddington","lat":51.5165,"lon":-0.1789,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Bond Street","lat":51.5138,"lon":-0.1489,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Tottenham Court Road","lat":51.5301,"lon":-0.1327,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Farringdon","lat":51.5184,"lon":-0.1043,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null},
      {"stop_name":"Liverpool Street","lat":51.5182,"lon":-0.0824,"currency":"GBP","prices":[{"type":"standard","amount":10.00}],"branch_id":null}
    ]
  },
  {
    "iata": "LHR",
    "id": "piccadilly_line",
    "airport": "London Heathrow",
    "name": "Piccadilly Line",
    "mode": "underground",
    "duration": 50,
    "co2": null,
    "url": "https://tfl.gov.uk/fares/tickets",
    "hasFirstClass": false,
    "stops": [
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":"T5-line"},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":"T4-line"},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hatton Cross","lat":51.47,"lon":-0.4419,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hounslow West","lat":51.4824,"lon":-0.3829,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hounslow Central","lat":51.4713,"lon":-0.3665,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hounslow East","lat":51.4733,"lon":-0.3564,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Osterley","lat":51.4811,"lon":-0.3522,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Boston Manor","lat":51.4956,"lon":-0.3251,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Northfields","lat":51.4994,"lon":-0.3142,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"South Ealing","lat":51.5011,"lon":-0.3072,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Acton Town","lat":51.5025,"lon":-0.2809,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Turnham Green","lat":51.4946,"lon":-0.2469,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hammersmith","lat":51.4923,"lon":-0.2237,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Barons Court","lat":51.4906,"lon":-0.2146,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Earl's Court","lat":51.4926,"lon":-0.1969,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Gloucester Road","lat":51.4943,"lon":-0.183,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"South Kensington","lat":51.4947,"lon":-0.1732,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Knightsbridge","lat":51.501,"lon":-0.1626,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Hyde Park Corner","lat":51.5033,"lon":-0.1527,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Green Park","lat":51.5069,"lon":-0.1426,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Piccadilly Circus","lat":51.5097,"lon":-0.1337,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Leicester Square","lat":51.5112,"lon":-0.1283,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Covent Garden","lat":51.5115,"lon":-0.1244,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Holborn","lat":51.5176,"lon":-0.1205,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"Russell Square","lat":51.5241,"lon":-0.1239,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null},
      {"stop_name":"King's Cross St. Pancras","lat":51.53079,"lon":-0.12379,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}],"branch_id":null}
    ]
  }
]

CRITICAL REQUIREMENTS:
1. ALWAYS include MULTIPLE transport options (at least Elizabeth Line, Piccadilly Line, Heathrow Express, and other major services for Heathrow)
2. For routes with MULTIPLE BRANCHES (like Heathrow Express and Piccadilly Line), list each branch separately with its unique branch_id
3. IMPORTANT: Branches should NOT be consecutive with the same branch_id. Instead:
   - List each branch's terminal separately (e.g., T5 with branch_id "T5-branch")
   - Then list other branches (e.g., T4 with branch_id "T4-branch")
   - Then list the convergence hub (e.g., Terminals 2&3 with branch_id: null)
   - Then list main line stations (all with branch_id: null)
4. The FRONTEND will automatically draw connecting lines from each branch endpoint to the convergence hub
5. Examples:
   - Heathrow Express CORRECT: [T5 (T5-branch), T4 (T4-branch), Terminals 2&3 (null), Paddington (null)]
   - Heathrow Express WRONG: [T5 (T5-T4), T4 (T5-T4), Terminals 2&3 (null), Paddington (null)] <- This draws line between T5-T4!
   - Piccadilly Line CORRECT: [T5 (T5-line), Terminals 2&3 (null), T4 (T4-line), Hatton Cross onwards (null)]
6. For EACH transport service, include ALL major stops from the airport through to central London/city center

Final Answer Schema:
- Top-level MUST be an array [ ] containing MULTIPLE transport objects
- Each element is a transport object with:
  - iata: airport code (3 letters, uppercase)
  - id: unique identifier (string)
  - airport: airport name (string)
  - name: transport service name (string)
  - mode: transport mode
    - IMPORTANT: choose ONE of these existing categories whenever applicable:
      "underground", "tube", "metro", "train", "rail", "bus", "coach"
  - duration: journey time in MINUTES from airport to city center (integer)
  - co2: always null
  - url: booking URL where users can purchase tickets (string, e.g., "https://www.heathrowexpress.com/ticket-fares")
  - hasFirstClass: boolean indicating if first class tickets are available (true or false)
  - stops: array of stop objects, LISTED IN COMPLETE ORDER, each with:
    - stop_name: station/stop name (string)
    - lat: latitude WGS84 (number)
    - lon: longitude WGS84 (number)
    - currency: ISO 3-letter code (string)
    - prices: array of pricing objects: {type: string, amount: number}
    - branch_id: OPTIONAL - string identifying which branch this stop belongs to, or null if on main line after convergence

RULES:
1. Output ONLY valid JSON (no surrounding text, prose, or explanations)
2. Emit a top-level JSON array with MULTIPLE transport options
3. For multi-branch routes, use branch_id to identify separate branches
4. Stops with the same branch_id should connect to each other in sequence
5. Use null for branch_id on the main line and at convergence hubs
6. PRICES: Format all prices to either 0 decimal places (whole numbers like 25, 30) OR exactly 2 decimal places (like 25.50, 17.90). NO other formats allowed.
7. For EACH transport option, list ALL stations/stops in order from airport to city center
8. DURATION is CRITICAL: Provide an accurate, realistic journey time in minutes from the airport to the city center
9. Never output non-JSON text
"""


def get_prompt():
    return PROMPT
