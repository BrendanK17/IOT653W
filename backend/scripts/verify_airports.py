from app.services.airports import replace_airports_for_country, get_all_airports
import json

sample = [{
    'iata': 'TST',
    'name': 'Test Airport',
    'city': 'Testville',
    'country': 'TEST',
    'lat': 12.34,
    'lon': 56.78,
    'city_lat': 12.3456,
    'city_lon': 56.7890,
    'aliases': []
}]

replace_airports_for_country('TEST', sample)

docs = [d for d in get_all_airports() if d.get('country') == 'TEST']
print(json.dumps(docs, default=str, indent=2))
