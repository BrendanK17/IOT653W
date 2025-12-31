PROMPT = """
CRITICAL: Output ONLY valid JSON. No text, no markdown, no code blocks, no explanations.

TASK: Generate a JSON array of public transport routes from an airport to its city center.

IMPORTANT: Produce the final JSON array using the prompt and your knowledge. External search tools are not available; provide the best possible final JSON array using the schema below. If uncertain about a value, set it to null.

====== RESPONSE TYPE: FINAL ANSWER ======
Emit ONLY this JSON array with MULTIPLE transport options:

[
  {
    "iata": "LHR",
    "id": "elizabeth_line",
    "airport": "London Heathrow",
    "name": "Elizabeth Line",
    "mode": "train",
    "duration": 30,
    "co2": null,
    "stops": [
      {"stop_name":"Reading","lat":51.3739,"lon":-0.9716,"currency":"GBP","prices":[{"type":"standard","amount":17.50}]},
      {"stop_name":"Twyford","lat":51.4124,"lon":-0.8299,"currency":"GBP","prices":[{"type":"standard","amount":15.50}]},
      {"stop_name":"Maidenhead","lat":51.5195,"lon":-0.7223,"currency":"GBP","prices":[{"type":"standard","amount":14.00}]},
      {"stop_name":"Taplow","lat":51.5354,"lon":-0.6761,"currency":"GBP","prices":[{"type":"standard","amount":13.50}]},
      {"stop_name":"Burnham","lat":51.5145,"lon":-0.6265,"currency":"GBP","prices":[{"type":"standard","amount":13.00}]},
      {"stop_name":"Slough","lat":51.5079,"lon":-0.5936,"currency":"GBP","prices":[{"type":"standard","amount":12.50}]},
      {"stop_name":"Langley","lat":51.5060,"lon":-0.7113,"currency":"GBP","prices":[{"type":"standard","amount":12.00}]},
      {"stop_name":"Iver","lat":51.5166,"lon":-0.6405,"currency":"GBP","prices":[{"type":"standard","amount":11.50}]},
      {"stop_name":"West Drayton","lat":51.5094,"lon":-0.4633,"currency":"GBP","prices":[{"type":"standard","amount":11.00}]},
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"standard","amount":10.50}]},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"standard","amount":10.50}]},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"standard","amount":10.50}]},
      {"stop_name":"Hayes & Harlington","lat":51.4469,"lon":-0.4325,"currency":"GBP","prices":[{"type":"standard","amount":10.00}]},
      {"stop_name":"Southall","lat":51.5083,"lon":-0.3741,"currency":"GBP","prices":[{"type":"standard","amount":8.50}]},
      {"stop_name":"Hanwell","lat":51.5172,"lon":-0.3393,"currency":"GBP","prices":[{"type":"standard","amount":8.00}]},
      {"stop_name":"West Ealing","lat":51.5055,"lon":-0.3127,"currency":"GBP","prices":[{"type":"standard","amount":7.50}]},
      {"stop_name":"Ealing Broadway","lat":51.5048,"lon":-0.3075,"currency":"GBP","prices":[{"type":"standard","amount":7.50}]},
      {"stop_name":"Acton Main Line","lat":51.5079,"lon":-0.2654,"currency":"GBP","prices":[{"type":"standard","amount":7.00}]},
      {"stop_name":"Paddington","lat":51.5165,"lon":-0.1789,"currency":"GBP","prices":[{"type":"standard","amount":6.00}]},
      {"stop_name":"Bond Street","lat":51.5138,"lon":-0.1489,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Tottenham Court Road","lat":51.5301,"lon":-0.1327,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Farringdon","lat":51.5184,"lon":-0.1043,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Liverpool Street","lat":51.5182,"lon":-0.0824,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Whitechapel","lat":51.5161,"lon":-0.0615,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Canary Wharf","lat":51.5033,"lon":-0.0192,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Custom House","lat":51.5076,"lon":0.0044,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Woolwich","lat":51.4889,"lon":0.0564,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Abbey Wood","lat":51.4869,"lon":0.1222,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Stratford","lat":51.5413,"lon":-0.0035,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Maryland","lat":51.5527,"lon":-0.0169,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Forest Gate","lat":51.5652,"lon":-0.0265,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Manor Park","lat":51.5822,"lon":-0.0406,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Ilford","lat":51.5408,"lon":0.0721,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Seven Kings","lat":51.5636,"lon":0.1114,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Goodmayes","lat":51.5754,"lon":0.1276,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Chadwell Heath","lat":51.5913,"lon":0.1482,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Romford","lat":51.5795,"lon":0.1839,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Gidea Park","lat":51.5952,"lon":0.2099,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Harold Wood","lat":51.6081,"lon":0.2326,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Brentwood","lat":51.6246,"lon":0.3108,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]},
      {"stop_name":"Shenfield","lat":51.6288,"lon":0.3744,"currency":"GBP","prices":[{"type":"standard","amount":5.90}]}
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
    "stops": [
      {"stop_name":"Cockfosters","lat":51.6504,"lon":-0.1246,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Oakwood","lat":51.6366,"lon":-0.1319,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Southgate","lat":51.6192,"lon":-0.1271,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Arnos Grove","lat":51.6031,"lon":-0.1175,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Bounds Green","lat":51.5860,"lon":-0.1174,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Wood Green","lat":51.5884,"lon":-0.1095,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Turnpike Lane","lat":51.5851,"lon":-0.1045,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Manor House","lat":51.5729,"lon":-0.0954,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Finsbury Park","lat":51.5569,"lon":-0.1049,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Arsenal","lat":51.5553,"lon":-0.1072,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Holloway Road","lat":51.5468,"lon":-0.1106,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Caledonian Road","lat":51.5348,"lon":-0.1193,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"King's Cross St. Pancras","lat":51.53079,"lon":-0.12379,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Russell Square","lat":51.5241,"lon":-0.1239,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Holborn","lat":51.5176,"lon":-0.1205,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Covent Garden","lat":51.5115,"lon":-0.1244,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Leicester Square","lat":51.5112,"lon":-0.1283,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Piccadilly Circus","lat":51.5097,"lon":-0.1337,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Green Park","lat":51.5069,"lon":-0.1426,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hyde Park Corner","lat":51.5033,"lon":-0.1527,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Knightsbridge","lat":51.501,"lon":-0.1626,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"South Kensington","lat":51.4947,"lon":-0.1732,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Gloucester Road","lat":51.4943,"lon":-0.183,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Earl's Court","lat":51.4926,"lon":-0.1969,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Barons Court","lat":51.4906,"lon":-0.2146,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hammersmith","lat":51.4923,"lon":-0.2237,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Turnham Green","lat":51.4946,"lon":-0.2469,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Acton Town","lat":51.5025,"lon":-0.2809,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"South Ealing","lat":51.5011,"lon":-0.3072,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Northfields","lat":51.4994,"lon":-0.3142,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Boston Manor","lat":51.4956,"lon":-0.3251,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Osterley","lat":51.4811,"lon":-0.3522,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hounslow East","lat":51.4733,"lon":-0.3564,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hounslow Central","lat":51.4713,"lon":-0.3665,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hounslow West","lat":51.4824,"lon":-0.3829,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hatton Cross","lat":51.47,"lon":-0.4419,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Ealing Common","lat":51.5106,"lon":-0.2899,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"North Ealing","lat":51.5193,"lon":-0.3003,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Park Royal","lat":51.5198,"lon":-0.3091,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Alperton","lat":51.5234,"lon":-0.3164,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Sudbury Town","lat":51.5330,"lon":-0.3341,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Sudbury Hill","lat":51.5260,"lon":-0.3376,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"South Harrow","lat":51.5510,"lon":-0.3496,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Rayners Lane","lat":51.5510,"lon":-0.4211,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Eastcote","lat":51.5671,"lon":-0.4214,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Ruislip Manor","lat":51.5679,"lon":-0.4345,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Ruislip","lat":51.5714,"lon":-0.4421,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Ickenham","lat":51.5563,"lon":-0.4639,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Hillingdon","lat":51.5468,"lon":-0.4709,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]},
      {"stop_name":"Uxbridge","lat":51.5469,"lon":-0.4781,"currency":"GBP","prices":[{"type":"peak","amount":5.90},{"type":"off_peak","amount":3.80}]}
    ]
  },
  {
    "iata": "LHR",
    "id": "heathrow_express",
    "airport": "London Heathrow",
    "name": "Heathrow Express",
    "mode": "train",
    "duration": 15,
    "co2": null,
    "stops": [
      {"stop_name":"Heathrow Terminal 5","lat":51.47,"lon":-0.4863,"currency":"GBP","prices":[{"type":"standard","amount":25}]},
      {"stop_name":"Heathrow Terminal 4","lat":51.459,"lon":-0.447,"currency":"GBP","prices":[{"type":"standard","amount":25}]},
      {"stop_name":"Heathrow Terminals 2 & 3","lat":51.4706,"lon":-0.4525,"currency":"GBP","prices":[{"type":"standard","amount":25}]},
      {"stop_name":"London Paddington","lat":51.5155,"lon":-0.1754,"currency":"GBP","prices":[{"type":"standard","amount":25}]}
    ]
  }
]

CRITICAL REQUIREMENTS:
1. ALWAYS include MULTIPLE transport options (at least Elizabeth Line, Piccadilly Line, Heathrow Express, and other major services for Heathrow)
2. Elizabeth Line MUST be included as a separate transport option from Piccadilly Line
3. For EACH transport service, you MUST include ALL major stops from the airport through to central London/city center
4. The Piccadilly Line example above shows the COMPLETE station list with all stops from Heathrow to King's Cross
5. Do NOT abbreviate station lists - show the full journey from airport to city center

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
    - Do NOT invent new categories. Only use a different mode value if it is
      definitely not one of the above.
  - duration: journey time in MINUTES from airport to city center (integer). This should be a realistic estimate of the typical journey time to reach the city center/downtown area.
  - co2: always null
  - stops: array of stop objects, LISTED IN COMPLETE ORDER FROM AIRPORT TO CITY CENTER, each with:
    - stop_name: station/stop name (string)
    - lat: latitude WGS84 (number)
    - lon: longitude WGS84 (number)
    - currency: ISO 3-letter code (string)
    - prices: array of pricing objects: {type: string, amount: number}

RULES:
1. Output ONLY valid JSON (no surrounding text, prose, or explanations)
2. Emit a top-level JSON array with MULTIPLE transport options (not just one)
3. For Heathrow (LHR), MUST include: Elizabeth Line, Piccadilly Line, Heathrow Express, and other major services
4. Include ALL major transport modes available (rail, bus, coach, underground, etc)
5. Use realistic coordinates and prices. Prices should be to 2 decimal places or whole numbers.
6. For EACH transport option, list ALL stations/stops in order from airport to city center - DO NOT abbreviate or skip stations
7. DURATION is CRITICAL: Provide an accurate, realistic journey time in minutes from the airport to the city center
8. Never output non-JSON text
"""


def get_prompt():
    return PROMPT
