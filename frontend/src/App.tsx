import { useState } from "react";

type RouteOption = {
  mode: string;
  duration_minutes: number;
  cost: number;
  notes: string;
};

export default function App() {
  const [airport, setAirport] = useState("Heathrow");
  const [groupSize, setGroupSize] = useState(1);
  const [results, setResults] = useState<RouteOption[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchRoutes() {
    setLoading(true);
    const res = await fetch(`/api/routes?airport=${encodeURIComponent(airport)}&group=${groupSize}`);
    const json = await res.json();
    setResults(json);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">AirPorter — airport transfer comparator</h1>

        <div className="flex gap-2 mb-4">
          <input className="border p-2 flex-1" value={airport} onChange={e => setAirport(e.target.value)} />
          <input type="number" min={1} value={groupSize} onChange={e => setGroupSize(Number(e.target.value))} className="w-20 border p-2"/>
          <button onClick={fetchRoutes} className="bg-blue-600 text-white px-4 rounded">Search</button>
        </div>

        {loading && <p>Loading…</p>}

        <div className="space-y-4">
          {results?.map((r, i) => (
            <div key={i} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{r.mode}</div>
                  <div className="text-sm text-gray-600">{r.notes}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">£{(r.cost / Math.max(1, Number(groupSize))).toFixed(2)} pp</div>
                  <div className="text-sm text-gray-500">{r.duration_minutes} min</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!results && !loading && <p className="text-gray-500 mt-4">Try “Heathrow” → click Search.</p>}
      </div>
    </div>
  );
}
